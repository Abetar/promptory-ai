// prisma/seed.ts
import { PrismaClient, PromptType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedPrompt = {
  title: string;
  description: string;
  type: PromptType;
  isFree: boolean;
  contentPreview: string;
  contentFull: string;
  isPublished: boolean;
  aiSlugs: string[];
};

type SeedPack = {
  slug: string;
  title: string;
  description: string;
  isFree: boolean;
  priceMx?: number | null; // lo permitimos aquí, pero NO lo mandamos como null a Prisma
  isPublished: boolean;
  promptTitles: string[];
};

async function main() {
  // 1) AI Tools base
  const aiTools = [
    { slug: "chatgpt", name: "ChatGPT" },
    { slug: "claude", name: "Claude" },
    { slug: "gemini", name: "Gemini" },
    { slug: "midjourney", name: "Midjourney" },
    { slug: "sora", name: "Sora" },
  ];

  await prisma.aiTool.createMany({
    data: aiTools.map((t) => ({ ...t, isActive: true })),
    skipDuplicates: true,
  });

  const tools = await prisma.aiTool.findMany({
    where: { slug: { in: aiTools.map((t) => t.slug) } },
    select: { id: true, slug: true },
  });

  const toolId = new Map(tools.map((t) => [t.slug, t.id] as const));

  // 2) Prompts base (SIN priceMx)
  const prompts: SeedPrompt[] = [
    {
      title: "Resumen ejecutivo de reunión",
      description: "Convierte notas en un resumen claro con acciones y pendientes.",
      type: PromptType.texto,
      isFree: true,
      contentPreview: "Crea un resumen con: decisiones, tareas, responsables y fechas.",
      contentFull:
        "Eres un asistente experto. Toma estas notas y devuelve:\n1) Resumen ejecutivo\n2) Decisiones\n3) Acciones (owner + fecha)\n4) Riesgos\n5) Pendientes\nNotas:\n{{NOTAS}}",
      isPublished: true,
      aiSlugs: ["chatgpt", "claude", "gemini"],
    },
    {
      title: "Prompt para imagen estilo product shot",
      description: "Genera un prompt para render e-commerce.",
      type: PromptType.imagen,
      isFree: false, // premium -> se desbloquea por pack o acceso directo
      contentPreview: "Describe producto, fondo, iluminación, lente y estilo.",
      contentFull:
        "Genera un prompt para imagen e-commerce hiperrealista con:\n- Producto: {{PRODUCTO}}\n- Materiales: {{MATERIALES}}\n- Fondo: {{FONDO}}\n- Iluminación: softbox\n- Lente: 85mm\n- Calidad: ultra\nDevuelve 3 variantes.",
      isPublished: true,
      aiSlugs: ["midjourney", "sora"],
    },
  ];

  for (const p of prompts) {
    const links = p.aiSlugs
      .map((slug) => toolId.get(slug))
      .filter((v): v is string => Boolean(v))
      .map((aiToolId) => ({ aiToolId }));

    const created = await prisma.prompt.upsert({
      where: { title: p.title },
      update: {
        description: p.description,
        type: p.type,
        isFree: p.isFree,
        contentPreview: p.contentPreview,
        contentFull: p.contentFull,
        isPublished: p.isPublished,
        aiTools: {
          deleteMany: {}, // solo borra relaciones de ESTE prompt
          create: links,
        },
      },
      create: {
        title: p.title,
        description: p.description,
        type: p.type,
        isFree: p.isFree,
        contentPreview: p.contentPreview,
        contentFull: p.contentFull,
        isPublished: p.isPublished,
        aiTools: { create: links },
      },
      select: { id: true, title: true },
    });

    console.log("✅ prompt:", created.title, created.id);
  }

  // 3) Packs base (free/premium; priceMx opcional)
  const packs: SeedPack[] = [
    {
      slug: "starter-productividad",
      title: "Pack Starter · Productividad",
      description: "Prompts esenciales para resumir, planear y ejecutar más rápido.",
      isFree: true,
      priceMx: null, // ok aquí
      isPublished: true,
      promptTitles: ["Resumen ejecutivo de reunión"],
    },
    {
      slug: "pack-imagen-ecommerce",
      title: "Pack · Imagen E-commerce",
      description: "Prompts premium para generar imágenes tipo product shot.",
      isFree: false,
      priceMx: 49,
      isPublished: true,
      promptTitles: ["Prompt para imagen estilo product shot"],
    },
  ];

  // Traemos los prompts por title para linkearlos a packs
  const promptRows = await prisma.prompt.findMany({
    where: { title: { in: packs.flatMap((p) => p.promptTitles) } },
    select: { id: true, title: true },
  });
  const promptIdByTitle = new Map(promptRows.map((p) => [p.title, p.id] as const));

  for (const pack of packs) {
    // ✅ data sin null: si es free, omitimos priceMx completamente
    const packDataBase = {
      slug: pack.slug,
      title: pack.title,
      description: pack.description,
      isFree: pack.isFree,
      isPublished: pack.isPublished,
    };

    const packData = pack.isFree
      ? packDataBase
      : {
          ...packDataBase,
          // premium: number sí o sí
          priceMx: typeof pack.priceMx === "number" ? pack.priceMx : 0,
        };

    const createdPack = await prisma.pack.upsert({
      where: { slug: pack.slug },
      update: packData,
      create: packData,
      select: { id: true, slug: true },
    });

    // links pack <-> prompts (tabla puente)
    await prisma.packPrompt.deleteMany({
      where: { packId: createdPack.id },
    });

    const packLinks = pack.promptTitles
      .map((t) => promptIdByTitle.get(t))
      .filter((v): v is string => Boolean(v))
      .map((promptId) => ({
        packId: createdPack.id,
        promptId,
      }));

    if (packLinks.length > 0) {
      await prisma.packPrompt.createMany({
        data: packLinks,
        skipDuplicates: true,
      });
    }

    const missing = pack.promptTitles.filter((t) => !promptIdByTitle.has(t));
    if (missing.length) {
      console.warn("⚠️ pack", pack.slug, "no encontró prompts:", missing);
    }

    console.log("✅ pack:", createdPack.slug, "links:", packLinks.length);
  }

  console.log("✅ Seed terminado (AI Tools + Prompts + Packs)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

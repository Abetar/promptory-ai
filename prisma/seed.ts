// prisma/seed.ts
import { PrismaClient, PromptType } from "@prisma/client";

const prisma = new PrismaClient();

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

  const toolId = new Map(tools.map((t) => [t.slug, t.id]));

  // 2) Prompts base
  const prompts = [
    {
      title: "Resumen ejecutivo de reunión",
      description: "Convierte notas en un resumen claro con acciones y pendientes.",
      type: PromptType.texto,
      isFree: true,
      priceMx: 0,
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
      isFree: false,
      priceMx: 20,
      contentPreview: "Describe producto, fondo, iluminación, lente y estilo.",
      contentFull:
        "Genera un prompt para imagen e-commerce hiperrealista con:\n- Producto: {{PRODUCTO}}\n- Materiales: {{MATERIALES}}\n- Fondo: {{FONDO}}\n- Iluminación: softbox\n- Lente: 85mm\n- Calidad: ultra\nDevuelve 3 variantes.",
      isPublished: true,
      aiSlugs: ["midjourney", "sora"],
    },
  ];

  for (const p of prompts) {
    const created = await prisma.prompt.upsert({
      where: { title: p.title },
      update: {
        description: p.description,
        type: p.type,
        isFree: p.isFree,
        priceMx: p.priceMx,
        contentPreview: p.contentPreview,
        contentFull: p.contentFull,
        isPublished: p.isPublished,
        aiTools: {
          deleteMany: {},
          create: p.aiSlugs
            .map((slug) => toolId.get(slug))
            .filter(Boolean)
            .map((aiToolId) => ({ aiToolId: aiToolId as string })),
        },
      },
      create: {
        title: p.title,
        description: p.description,
        type: p.type,
        isFree: p.isFree,
        priceMx: p.priceMx,
        contentPreview: p.contentPreview,
        contentFull: p.contentFull,
        isPublished: p.isPublished,
        aiTools: {
          create: p.aiSlugs
            .map((slug) => toolId.get(slug))
            .filter(Boolean)
            .map((aiToolId) => ({ aiToolId: aiToolId as string })),
        },
      },
      select: { id: true },
    });

    console.log("✅ prompt:", p.title, created.id);
  }

  console.log("✅ Seed terminado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

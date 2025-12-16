import { PrismaClient, PromptType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedPrompt = {
  title: string;
  description: string;
  type: PromptType;
  isFree: boolean;
  priceMx: number;
  contentPreview: string;
  contentFull: string;
  isPublished: boolean;
  aiSlugs: string[];
};

async function upsertAiTools(): Promise<Map<string, string>> {
  const tools = [
    { slug: "chatgpt", name: "ChatGPT" },
    { slug: "claude", name: "Claude" },
    { slug: "gemini", name: "Gemini" },
    { slug: "deepseek", name: "DeepSeek" },
    { slug: "midjourney", name: "Midjourney" },
    { slug: "dalle", name: "DALL·E" },
    { slug: "stable-diffusion", name: "Stable Diffusion" },
    { slug: "runway", name: "Runway" },
  ];

  for (const t of tools) {
    await prisma.aiTool.upsert({
      where: { slug: t.slug },
      update: { name: t.name, isActive: true },
      create: { slug: t.slug, name: t.name, isActive: true },
    });
  }

  const all = await prisma.aiTool.findMany({
    where: { isActive: true },
    select: { id: true, slug: true },
  });

  return new Map(all.map((x) => [x.slug, x.id]));
}

async function upsertPromptAndRelations(p: SeedPrompt, aiMap: Map<string, string>) {
  // ✅ upsert por title (requiere Prompt.title @unique)
  const prompt = await prisma.prompt.upsert({
    where: { title: p.title },
    update: {
      description: p.description,
      type: p.type,
      isFree: p.isFree,
      priceMx: p.priceMx,
      contentPreview: p.contentPreview,
      contentFull: p.contentFull,
      isPublished: p.isPublished,
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
    },
  });

  // Sync relaciones
  await prisma.promptAiTool.deleteMany({ where: { promptId: prompt.id } });

  const aiToolIds = p.aiSlugs
    .map((slug) => aiMap.get(slug))
    .filter((id): id is string => typeof id === "string");

  if (aiToolIds.length) {
    await prisma.promptAiTool.createMany({
      data: aiToolIds.map((aiToolId) => ({
        promptId: prompt.id,
        aiToolId,
      })),
      skipDuplicates: true,
    });
  }

  return prompt.id;
}

async function main() {
  console.log("🌱 Seed: AiTools + Prompts + relations");

  const aiMap = await upsertAiTools();

  const prompts: SeedPrompt[] = [
    {
      title: "Resumen ejecutivo de reunión",
      description: "Convierte notas en un resumen claro con acciones, riesgos y pendientes.",
      type: PromptType.texto,
      isFree: true,
      priceMx: 0,
      contentPreview:
        "Eres un asistente que resume reuniones. Entrega: resumen, acuerdos, pendientes, responsables y fechas...",
      contentFull:
        `Eres un asistente experto en productividad. A partir de las notas/transcripción, genera:
1) Resumen (máx 8 bullets)
2) Acuerdos
3) Pendientes (tabla: tarea, responsable, fecha)
4) Riesgos/alertas
5) Próximos pasos

Notas:
{{NOTAS_AQUI}}`,
      isPublished: true,
      aiSlugs: ["chatgpt", "claude", "gemini", "deepseek"],
    },
    {
      title: "Prompt para imagen estilo product shot",
      description: "Crea un prompt detallado para render tipo e-commerce.",
      type: PromptType.imagen,
      isFree: false,
      priceMx: 20,
      contentPreview:
        "Product shot en estudio: luz suave, fondo neutro, 85mm, ultra detallado...",
      contentFull:
        `Actúa como director creativo. Crea un prompt para IA de imagen con:
- sujeto (producto) + materiales
- fondo (color/gradiente)
- iluminación (key/fill/rim)
- lente/cámara (85mm, f/2.8, ISO)
- composición (centrado / thirds)
- calidad (ultra detailed, 8k)

Producto:
{{PRODUCTO_AQUI}}`,
      isPublished: true,
      aiSlugs: ["midjourney", "dalle", "stable-diffusion"],
    },
  ];

  for (const p of prompts) {
    const id = await upsertPromptAndRelations(p, aiMap);
    console.log(`✅ ${p.title} -> ${id}`);
  }

  console.log("🎉 Seed completado");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

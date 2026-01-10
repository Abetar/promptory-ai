// app/api/tools/prompt-optimizer/run/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription, hasUnlimitedSubscription, getSubscriptionTier } from "@/lib/subscription";
import { logEvent } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Free limits
 */
const FREE_DAILY_LIMIT = Number(
  process.env.PROMPT_OPTIMIZER_FREE_DAILY_LIMIT ?? "10"
);

/**
 * OpenAI config (Tier 1 / Pro)
 */
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type TargetAI = "chatgpt" | "claude" | "gemini" | "deepseek";

type OptimizerMode = "standard" | "unlimited";

type Body = {
  input: string;
  targetAI?: TargetAI;
  mode?: OptimizerMode; // ✅ nuevo
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function forbidden(message: string, code: string, extra?: Record<string, any>) {
  return NextResponse.json(
    { ok: false, message, code, ...(extra ?? {}) },
    { status: 403 }
  );
}

function startOfTodayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

/**
 * =========================
 * ✅ Mock optimizer (Free) — V2 (decide + supuestos)
 * =========================
 */

function normalizeText(s: string) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksSpanish(input: string) {
  const t = normalizeText(input).toLowerCase();

  const spanishHits = [
    " que ",
    " para ",
    " con ",
    " sin ",
    " necesito ",
    " quiero ",
    " dame ",
    " haz ",
    " crea ",
    " resumen ",
    " lista ",
    " pasos ",
    " objetivo ",
    " contexto ",
    " por favor",
  ];

  let score = 0;
  for (const k of spanishHits) if (t.includes(k)) score++;

  const hasAccents = /[áéíóúñ]/i.test(t);
  if (hasAccents) score += 2;

  return score >= 2;
}

type Detected = {
  language: "es" | "en";
  category:
    | "content"
    | "marketing"
    | "coding"
    | "design"
    | "analysis"
    | "productivity"
    | "general";
  platform:
    | "YouTube"
    | "TikTok"
    | "Instagram"
    | "X"
    | "LinkedIn"
    | "Blog"
    | "Web"
    | "App"
    | "General";
  outputType:
    | "Guion"
    | "Post"
    | "Carrusel"
    | "Anuncio"
    | "Email"
    | "Ticket"
    | "Código"
    | "Checklist"
    | "Plan"
    | "Resumen"
    | "Respuesta";
  tone: "Profesional" | "Casual" | "Persuasivo" | "Técnico" | "Amigable";
  audience: "General" | "Principiantes" | "Intermedio" | "Avanzado";
  deliverables: string[];
  assumptions: string[];
};

function detectIntent(input: string): Detected {
  const raw = normalizeText(input);
  const t = raw.toLowerCase();

  const language: "es" | "en" = looksSpanish(raw) ? "es" : "en";

  let platform: Detected["platform"] = "General";
  if (t.includes("tiktok") || t.includes("tik tok")) platform = "TikTok";
  else if (t.includes("youtube") || t.includes("yt")) platform = "YouTube";
  else if (t.includes("instagram") || t.includes("ig")) platform = "Instagram";
  else if (t.includes("linkedin")) platform = "LinkedIn";
  else if (t.includes("twitter") || t.includes("x.com") || t.includes(" en x "))
    platform = "X";
  else if (t.includes("blog") || t.includes("artículo") || t.includes("articulo"))
    platform = "Blog";
  else if (t.includes("web") || t.includes("landing") || t.includes("site"))
    platform = "Web";
  else if (t.includes("app") || t.includes("android") || t.includes("ios"))
    platform = "App";

  let outputType: Detected["outputType"] = "Respuesta";
  if (t.includes("guion") || t.includes("script")) outputType = "Guion";
  else if (t.includes("post") || t.includes("publicación") || t.includes("publicacion"))
    outputType = "Post";
  else if (t.includes("carrusel") || t.includes("carousel")) outputType = "Carrusel";
  else if (t.includes("anuncio") || t.includes("ads") || t.includes("copy"))
    outputType = "Anuncio";
  else if (t.includes("email") || t.includes("correo")) outputType = "Email";
  else if (t.includes("ticket") || t.includes("zendesk") || t.includes("servicenow"))
    outputType = "Ticket";
  else if (
    t.includes("código") ||
    t.includes("codigo") ||
    t.includes("typescript") ||
    t.includes("javascript") ||
    t.includes("python") ||
    t.includes("kotlin") ||
    t.includes("sql") ||
    t.includes("next.js") ||
    t.includes("nextjs")
  )
    outputType = "Código";
  else if (t.includes("checklist") || t.includes("lista de verificación"))
    outputType = "Checklist";
  else if (t.includes("plan") || t.includes("roadmap") || t.includes("ruta"))
    outputType = "Plan";
  else if (t.includes("resumen") || t.includes("summary")) outputType = "Resumen";

  let category: Detected["category"] = "general";
  if (outputType === "Código") category = "coding";
  else if (
    t.includes("vender") ||
    t.includes("conversion") ||
    t.includes("marketing") ||
    t.includes("copy") ||
    t.includes("ventas")
  )
    category = "marketing";
  else if (
    outputType === "Guion" ||
    outputType === "Post" ||
    outputType === "Carrusel" ||
    platform === "TikTok" ||
    platform === "YouTube" ||
    platform === "Instagram"
  )
    category = "content";
  else if (t.includes("diseño") || t.includes("ux") || t.includes("ui"))
    category = "design";
  else if (t.includes("analiza") || t.includes("comparar") || t.includes("data"))
    category = "analysis";
  else if (t.includes("organiza") || t.includes("prioriza") || t.includes("tareas"))
    category = "productivity";

  let tone: Detected["tone"] = "Profesional";
  if (t.includes("casual") || t.includes("informal")) tone = "Casual";
  else if (t.includes("persuas") || t.includes("vende") || t.includes("convencer"))
    tone = "Persuasivo";
  else if (category === "coding") tone = "Técnico";
  else if (t.includes("amigable") || t.includes("simple")) tone = "Amigable";

  let audience: Detected["audience"] = "General";
  if (t.includes("principiante") || t.includes("novato")) audience = "Principiantes";
  else if (t.includes("avanzado") || t.includes("senior")) audience = "Avanzado";
  else if (t.includes("intermedio")) audience = "Intermedio";
  else if (t.includes("no sé") || t.includes("no se") || t.includes("no idea"))
    audience = "Principiantes";

  const deliverables: string[] = [];
  if (outputType === "Guion") {
    deliverables.push(
      "Hook de 1–2 líneas",
      "Estructura por secciones (inicio → desarrollo → cierre)",
      "Call-to-action final",
      "Versión corta y versión extendida",
      "Lista de tomas/visuals sugeridos (si aplica)"
    );
  } else if (outputType === "Carrusel") {
    deliverables.push(
      "Titular principal (slide 1)",
      "Estructura de 6–8 slides con texto por slide",
      "Cierre con CTA",
      "Variantes de copy (2 opciones)"
    );
  } else if (outputType === "Post") {
    deliverables.push(
      "Texto final listo para publicar",
      "Variación alternativa (opción B)",
      "Hashtags sugeridos (si aplica)",
      "CTA no agresivo"
    );
  } else if (outputType === "Email") {
    deliverables.push(
      "Asunto",
      "Cuerpo del correo",
      "Versión corta (máximo 6–8 líneas)"
    );
  } else if (outputType === "Ticket") {
    deliverables.push(
      "Título del ticket",
      "Descripción clara con pasos para reproducir (si aplica)",
      "Resultado esperado vs actual",
      "Prioridad sugerida"
    );
  } else if (outputType === "Código") {
    deliverables.push(
      "Cambios por archivo (ruta exacta)",
      "Código completo del archivo afectado (cuando aplique)",
      "Notas de integración (comandos y pasos)"
    );
  } else if (outputType === "Checklist") {
    deliverables.push("Checklist accionable", "Criterios de éxito", "Siguiente paso sugerido");
  } else if (outputType === "Plan") {
    deliverables.push(
      "Plan por fases (Fase 1/2/3)",
      "Prioridades (P0/P1/P2)",
      "Riesgos y mitigaciones"
    );
  } else if (outputType === "Resumen") {
    deliverables.push(
      "Resumen en 5–8 bullets",
      "Acciones siguientes",
      "Riesgos/pendientes (si aplica)"
    );
  } else {
    deliverables.push(
      "Respuesta directa",
      "Pasos accionables",
      "Ejemplo mínimo (si aplica)"
    );
  }

  const assumptions: string[] = [];
  if (platform === "General") {
    assumptions.push(
      language === "es"
        ? "No se especificó plataforma, asumiré un formato genérico adaptable."
        : "No platform was specified; I'll assume a general, adaptable format."
    );
  }
  if (audience === "General") {
    assumptions.push(
      language === "es"
        ? "No se especificó nivel; asumiré un nivel principiante–intermedio."
        : "No experience level specified; I'll assume beginner-to-intermediate."
    );
  }
  if (!/guion|script|post|carrusel|email|correo|ticket|código|codigo|plan|resumen/i.test(raw)) {
    assumptions.push(
      language === "es"
        ? `No se especificó formato de salida; asumiré: ${outputType}.`
        : `No output format specified; I'll assume: ${outputType}.`
    );
  }

  return {
    language,
    category,
    platform,
    outputType,
    tone,
    audience,
    deliverables,
    assumptions,
  };
}

function buildMockOutput(input: string, targetAI: string) {
  const raw = normalizeText(input);
  const d = detectIntent(raw);

  const lang = d.language;

  const role =
    lang === "es"
      ? `Eres un experto senior en ingeniería de prompts y ${d.category === "coding" ? "arquitectura de software" : d.category === "marketing" ? "marketing/copywriting" : d.category === "content" ? "creación de contenido" : d.category === "analysis" ? "análisis" : d.category === "design" ? "UX/UI" : "resolución de tareas"}. Tu especialidad es generar resultados concretos en ${targetAI.toUpperCase()}.`
      : `You are a senior prompt engineer and ${d.category === "coding" ? "software architect" : d.category === "marketing" ? "marketing/copywriting expert" : d.category === "content" ? "content creator" : d.category === "analysis" ? "analyst" : d.category === "design" ? "UX/UI specialist" : "problem solver"}. You produce concrete outputs in ${targetAI.toUpperCase()}.`;

  const context =
    lang === "es"
      ? `El usuario te dio una petición breve/ambigua. Tu trabajo es convertirla en un prompt listo para copiar/pegar, tomando decisiones razonables cuando falten datos, y declarando SUPUESTOS explícitos. El resultado debe funcionar bien en ${targetAI.toUpperCase()} y estar orientado a ${d.outputType} para ${d.platform}.`
      : `The user gave a brief/ambiguous request. Your job is to convert it into a copy/paste-ready prompt by making reasonable decisions when info is missing, and declaring explicit ASSUMPTIONS. The result must work well in ${targetAI.toUpperCase()} and be oriented to a ${d.outputType} for ${d.platform}.`;

  const objective =
    lang === "es"
      ? `Generar una respuesta final que cumpla la intención del usuario y entregue: ${d.deliverables.join(", ")}.`
      : `Generate a final response that matches the user's intent and delivers: ${d.deliverables.join(", ")}.`;

  const suppositions =
    d.assumptions.length === 0
      ? lang === "es"
        ? "No se requieren supuestos adicionales."
        : "No additional assumptions are required."
      : d.assumptions.map((a) => `- ${a}`).join("\n");

  const inputsBlock =
    lang === "es"
      ? `- Prompt original del usuario: "${raw}"
- Plataforma (inferida): ${d.platform}
- Tipo de salida (inferido): ${d.outputType}
- Tono (inferido): ${d.tone}
- Audiencia (inferida): ${d.audience}`
      : `- User's original prompt: "${raw}"
- Platform (inferred): ${d.platform}
- Output type (inferred): ${d.outputType}
- Tone (inferred): ${d.tone}
- Audience (inferred): ${d.audience}`;

  const steps =
    lang === "es"
      ? [
          "1) Interpreta la intención real del usuario (qué quiere lograr).",
          "2) Decide el formato exacto de salida y estructura, sin pedirle al usuario que rellene huecos.",
          "3) Produce una versión final lista para usar, con entregables concretos.",
          "4) Mantén claridad, concisión y orientación a acción.",
          "5) Si falta info, usa SUPUESTOS explícitos (sin inventar datos específicos).",
          "6) Cierra con PREGUNTAS MÍNIMAS (máximo 7) solo para refinar.",
        ].join("\n")
      : [
          "1) Interpret the user's true intent (what they want to achieve).",
          "2) Decide the exact output format and structure without asking the user to fill blanks.",
          "3) Produce a final, ready-to-use version with concrete deliverables.",
          "4) Keep it clear, concise, and action-oriented.",
          "5) If info is missing, use explicit ASSUMPTIONS (do not invent specific facts).",
          "6) End with MINIMAL QUESTIONS (max 7) only to refine.",
        ].join("\n");

  const outputFormat =
    lang === "es"
      ? `Entrega el resultado como ${d.outputType} listo para usar, respetando el tono "${d.tone}". Incluye secciones y bullets cuando haga sentido.`
      : `Deliver the result as a ready-to-use ${d.outputType} respecting the "${d.tone}" tone. Use sections and bullets when appropriate.`;

  const rules =
    lang === "es"
      ? [
          "- Devuelve SOLO el resultado final (sin explicación externa).",
          "- No uses placeholders ni campos vacíos.",
          "- No inventes información específica (nombres, precios, métricas) si no fue dada.",
          "- Si necesitas inventar para completar, conviértelo en SUPUESTO explícito.",
          `- Optimiza para ${targetAI.toUpperCase()} (estilo de instrucción claro y accionable).`,
          "- Mantén el idioma original del usuario.",
        ].join("\n")
      : [
          "- Return ONLY the final result (no extra explanation).",
          "- Do not use placeholders or empty fields.",
          "- Do not invent specific facts (names, prices, metrics) not provided by the user.",
          "- If you must assume to complete, make it an explicit ASSUMPTION.",
          `- Optimize for ${targetAI.toUpperCase()} (clear, actionable instruction style).`,
          "- Keep the user's original language.",
        ].join("\n");

  const checklist =
    lang === "es"
      ? [
          "- ¿Está listo para copiar/pegar sin editar nada?",
          "- ¿Convierte intención vaga en entregables concretos?",
          "- ¿Los supuestos están explícitos y no “inventados” como hechos?",
          "- ¿El formato es claro y estructurado?",
          `- ¿Está optimizado para ${targetAI.toUpperCase()}?`,
        ].join("\n")
      : [
          "- Is it copy/paste ready with no edits required?",
          "- Does it turn a vague intent into concrete deliverables?",
          "- Are assumptions explicit (not presented as facts)?",
          "- Is the structure clear?",
          `- Is it optimized for ${targetAI.toUpperCase()}?`,
        ].join("\n");

  const questions =
    lang === "es"
      ? [
          "1) ¿Cuál es la plataforma exacta (si no es la asumida)?",
          "2) ¿Quién es tu público objetivo principal?",
          "3) ¿Qué tono prefieres (neutral, casual, persuasivo, técnico)?",
          "4) ¿Tienes un ejemplo de referencia (link o descripción)?",
          "5) ¿Qué restricción NO se puede romper (tiempo, formato, longitud, políticas)?",
        ].join("\n")
      : [
          "1) What is the exact platform (if not the assumed one)?",
          "2) Who is the primary target audience?",
          "3) What tone do you prefer (neutral, casual, persuasive, technical)?",
          "4) Do you have a reference example (link or description)?",
          "5) What is the non-negotiable constraint (time, format, length, policies)?",
        ].join("\n");

  return `
ROL:
${role}

CONTEXTO:
${context}

OBJETIVO:
${objective}

SUPUESTOS (solo si faltan datos):
${suppositions}

INPUTS (solo los dados por el usuario + inferencias marcadas):
${inputsBlock}

PASOS:
${steps}

FORMATO DE SALIDA:
${outputFormat}

REGLAS Y RESTRICCIONES:
${rules}

CHECKLIST DE CALIDAD:
${checklist}

PREGUNTAS MÍNIMAS (máximo 7):
${questions}
`.trim();
}

async function runOpenAI(input: string, targetAI: string) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const system = `
Eres un experto senior en ingeniería de prompts.

OBJETIVO:
Convertir el prompt del usuario en un PROMPT FINAL listo para copiar/pegar, específico y accionable.

REGLAS OBLIGATORIAS:
- Devuelve SOLO el prompt final optimizado (sin explicaciones).
- No inventes datos. Si falta información, agrega una sección "SUPUESTOS" y marca claramente que son supuestos.
- Incluye entregables concretos cuando el tema lo amerite (planes, listas, pasos, ejemplos).
- Mantén el idioma original del usuario.
- Formato requerido:

ROL:
CONTEXTO:
OBJETIVO:
SUPUESTOS (solo si faltan datos):
INPUTS (solo los dados por el usuario):
PASOS:
FORMATO DE SALIDA:
REGLAS Y RESTRICCIONES:
CHECKLIST DE CALIDAD:
PREGUNTAS MÍNIMAS (máximo 7):
`.trim();

  const user = `
Optimiza el siguiente prompt para ${targetAI.toUpperCase()}.

PROMPT ORIGINAL:
${input}
`.trim();

  const resp = await client.responses.create({
    model: OPENAI_MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = resp.output_text?.trim() ?? "";
  return text || buildMockOutput(input, targetAI);
}

function buildInputPreview(input: string, max = 240) {
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email ?? undefined;

  if (!userId) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return badRequest("Body inválido.");
  }

  const input = String(body.input ?? "").trim();
  const targetAI = (body.targetAI ?? "chatgpt") as TargetAI;
  const mode: OptimizerMode = (body.mode ?? "standard") as OptimizerMode;

  if (!input || input.length < 10) {
    return badRequest("Input demasiado corto.");
  }

  if (!["chatgpt", "claude", "gemini", "deepseek"].includes(targetAI)) {
    return badRequest("targetAI inválido.");
  }

  if (!["standard", "unlimited"].includes(mode)) {
    return badRequest("mode inválido.");
  }

  // =========================
  // ✅ Tier gating
  // =========================
  const tier = await getSubscriptionTier(); // "none" | "basic" | "unlimited"

  // Tier 2 requerido para modo unlimited
  if (mode === "unlimited") {
    const okUnlimited = await hasUnlimitedSubscription();
    if (!okUnlimited) {
      return forbidden(
        "Necesitas Pro Unlimited para usar este modo.",
        "UNLIMITED_REQUIRED",
        { requiredTier: "unlimited" }
      );
    }
  }

  // Para modo standard: Pro Basic o Unlimited cuentan como Pro
  const hasPro = tier !== "none";
  const plan: "free" | "pro" = hasPro ? "pro" : "free";

  // =========================
  // ✅ Free daily limit (solo standard)
  // =========================
  if (plan === "free") {
    const from = startOfTodayUTC();
    const usedToday = await prisma.promptOptimizerRun.count({
      where: { userId, plan: "free", createdAt: { gte: from } },
    });

    if (usedToday >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        {
          ok: false,
          message: `Límite diario alcanzado (${FREE_DAILY_LIMIT}/día).`,
          code: "FREE_LIMIT_REACHED",
        },
        { status: 429 }
      );
    }
  }

  // =========================
  // ✅ Engine decision
  // =========================
  // Nota: aquí NO conecto “unlimited” a otro engine por razones de policy.
  // Tú puedes cambiar esta lógica para usar tu API cuando mode === "unlimited".
  const canUseOpenAI = plan === "pro" && Boolean(process.env.OPENAI_API_KEY);
  const engine: "openai" | "mock" = canUseOpenAI ? "openai" : "mock";

  const t0 = Date.now();
  let output = "";
  let model: string | null = null;

  try {
    if (engine === "openai") {
      model = OPENAI_MODEL;
      output = await runOpenAI(input, targetAI);
    } else {
      output = buildMockOutput(input, targetAI);
    }
  } catch {
    output = buildMockOutput(input, targetAI);
    model = null;
  }

  const latencyMs = Date.now() - t0;

  const run = await prisma.promptOptimizerRun.create({
    data: {
      userId,
      targetAI,
      plan,
      engine,
      model,
      input,
      output,
    },
    select: { id: true },
  });

  // ===========================
  // ✅ Audit event: optimizer.run
  // ===========================
  const storeFullEnv =
    String(process.env.AUDIT_STORE_OPTIMIZER_INPUT ?? "").toLowerCase() ===
    "true";

  // ✅ Unlimited: SIEMPRE guardar fullInput
  const storeFull = mode === "unlimited" ? true : storeFullEnv;

  await logEvent({
    userId,
    email: email ?? null,
    event: "optimizer.run",
    entityType: "tool",
    entityId: run.id,
    meta: {
      runId: run.id,
      mode, // ✅
      subscriptionTier: tier, // ✅ "none" | "basic" | "unlimited"
      targetAI,
      plan,
      engine,
      model: model ?? undefined,
      latencyMs,
      inputLen: input.length,
      inputPreview: buildInputPreview(input, 240),
      ...(storeFull ? { fullInput: input } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    mode,
    subscriptionTier: tier,
    plan,
    engine,
    model,
    latencyMs,
    output,
  });
}

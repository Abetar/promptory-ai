// app/api/tools/prompt-optimizer/run/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasUnlimitedSubscription, getSubscriptionTier } from "@/lib/subscription";
import { logEvent } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Free limits
 */
const FREE_DAILY_LIMIT = Number(process.env.PROMPT_OPTIMIZER_FREE_DAILY_LIMIT ?? "10");

/**
 * OpenAI config (Tier Pro -> OpenAI)
 */
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type TargetAI = "chatgpt" | "claude" | "gemini" | "deepseek";
type OptimizerMode = "standard" | "unlimited";

type Body = {
  input: string;
  targetAI?: TargetAI;
  mode?: OptimizerMode;
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function forbidden(message: string, code: string, extra?: Record<string, any>) {
  return NextResponse.json({ ok: false, message, code, ...(extra ?? {}) }, { status: 403 });
}

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * -----------------------------
 * Helpers
 * -----------------------------
 */

function normalizeText(s: string) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function buildInputPreview(input: string, max = 240) {
  const clean = normalizeText(input);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + "…";
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

type DetectedType = "post" | "guion" | "ticket" | "codigo" | "plan" | "checklist" | "email" | "general";

function detectType(input: string): DetectedType {
  const t = normalizeText(input).toLowerCase();

  if (t.includes("ticket") || t.includes("bug") || t.includes("zendesk") || t.includes("servicenow")) {
    return "ticket";
  }
  if (t.includes("guion") || t.includes("script") || t.includes("youtube") || t.includes("tiktok") || t.includes("shorts")) {
    return "guion";
  }
  if (t.includes("post") || t.includes("linkedin") || t.includes("instagram") || t.includes("facebook") || t.includes("x") || t.includes("twitter")) {
    return "post";
  }
  if (
    t.includes("código") ||
    t.includes("codigo") ||
    t.includes("endpoint") ||
    t.includes("api") ||
    t.includes("prisma") ||
    t.includes("next.js") ||
    t.includes("nextjs") ||
    t.includes("typescript") ||
    t.includes("javascript") ||
    t.includes("python") ||
    t.includes("kotlin") ||
    t.includes("sql")
  ) {
    return "codigo";
  }
  if (t.includes("roadmap") || t.includes("plan") || t.includes("estrategia") || t.includes("prioriza") || t.includes("sprint")) {
    return "plan";
  }
  if (t.includes("checklist") || t.includes("lista de verificación") || t.includes("paso a paso") || t.includes("steps")) {
    return "checklist";
  }
  if (t.includes("email") || t.includes("correo") || t.includes("asunto") || t.includes("redacta")) {
    return "email";
  }

  return "general";
}

function detectPlatform(input: string) {
  const t = normalizeText(input).toLowerCase();
  if (t.includes("linkedin")) return "LinkedIn";
  if (t.includes("tiktok") || t.includes("tik tok")) return "TikTok";
  if (t.includes("youtube") || t.includes("shorts")) return "YouTube";
  if (t.includes("instagram") || t.includes("ig")) return "Instagram";
  if (t.includes("facebook")) return "Facebook";
  if (t.includes("twitter") || t.includes("x.com") || t.includes(" en x ")) return "X";
  return "General";
}

/**
 * -----------------------------
 * ✅ Bulletproof Prompt Maestro (PRO / OpenAI)
 * -----------------------------
 * 1) Siempre produce PROMPT FINAL primero
 * 2) Solo usa SUPUESTOS si hace falta
 * 3) No hace preguntas antes
 */
function buildBulletproofPromptMaster(input: string, targetAI: TargetAI): string {
  const userInput = String(input ?? "").trim();
  const isEs = looksSpanish(userInput);

  if (isEs) {
    return `
Eres un experto senior en ingeniería de prompts.

TAREA:
Convierte el INPUT del usuario en un único PROMPT FINAL listo para copiar/pegar y ejecutar en ${targetAI.toUpperCase()}.

REGLAS OBLIGATORIAS:
- Debes entregar primero el PROMPT FINAL.
- NO hagas preguntas antes del PROMPT FINAL.
- NO uses placeholders vacíos tipo [PEGA AQUÍ], [X], etc.
- NO inventes datos específicos (nombres, precios, métricas).
- Si falta información, agrega SUPUESTOS explícitos (solo los necesarios).
- El PROMPT FINAL debe forzar estructura de salida y entregables concretos.

FORMATO OBLIGATORIO DE TU RESPUESTA (SOLO ESTO):
PROMPT FINAL:
...

SUPUESTOS (solo si aplican):
- ...

INPUT DEL USUARIO:
${userInput}
`.trim();
  }

  return `
You are a senior prompt engineer.

TASK:
Turn the user's INPUT into a single copy/paste-ready FINAL PROMPT for ${targetAI.toUpperCase()}.

MANDATORY RULES:
- Output the FINAL PROMPT first.
- Do NOT ask questions before the FINAL PROMPT.
- Do NOT use empty placeholders like [PASTE HERE], [X], etc.
- Do NOT invent specific facts (names, prices, metrics).
- If info is missing, add explicit ASSUMPTIONS (only what’s needed).
- The FINAL PROMPT must enforce output structure and concrete deliverables.

MANDATORY OUTPUT FORMAT (ONLY THIS):
FINAL PROMPT:
...

ASSUMPTIONS (only if needed):
- ...

USER INPUT:
${userInput}
`.trim();
}

/**
 * -----------------------------
 * ✅ Mock optimizer (FREE)
 * -----------------------------
 * Aquí SÍ generamos un PROMPT FINAL (no devolvemos el maestro).
 * Heurístico ligero: detecta tipo + plataforma + estructura.
 */
function buildMockFinalPrompt(input: string, targetAI: TargetAI) {
  const raw = normalizeText(input);
  const isEs = looksSpanish(raw);
  const type = detectType(raw);
  const platform = detectPlatform(raw);

  if (!isEs) {
    // English fallback simple
    return `FINAL PROMPT:
You are an expert assistant. Create the best possible output for the user's request below, optimized for ${targetAI.toUpperCase()}.
- Decide the most useful format and structure automatically.
- Do not invent specific facts.
- If critical info is missing, make reasonable assumptions and list them explicitly.
- Output must be well-structured, clear, and directly usable.

USER REQUEST:
${raw}

ASSUMPTIONS (only if needed):
- Platform is ${platform}.
- Audience is beginner-to-intermediate.
`.trim();
  }

  const assumptions: string[] = [];
  if (platform === "General") assumptions.push("No se especificó plataforma; asumo un formato genérico reutilizable.");
  assumptions.push("Asumo audiencia principiante–intermedia.");
  assumptions.push("Asumo tono profesional, claro y directo.");

  const baseHeader = `PROMPT FINAL:
Actúa como un experto senior y genera el mejor resultado posible optimizado para ${targetAI.toUpperCase()}.

CONTEXTO:
- Plataforma: ${platform}
- Idioma: Español

REGLAS:
- No inventes datos específicos.
- Si falta información crítica, usa SUPUESTOS explícitos.
- Entrega un resultado final estructurado, claro y listo para usar.

SOLICITUD DEL USUARIO:
${raw}
`;

  if (type === "ticket") {
    return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
1) Título
2) Descripción / Contexto
3) Pasos para reproducir (numerados)
4) Resultado actual
5) Resultado esperado
6) Impacto / Severidad sugerida
7) Notas técnicas (si aplica)

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
  }

  if (type === "codigo") {
    return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
- Cambios por archivo (ruta exacta)
- Código completo de cada archivo afectado (no snippets sueltos)
- Consideraciones (edge cases / validaciones)
- Pasos para ejecutar / probar (comandos)
- Si hay migraciones o Prisma: incluir comandos exactos

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
  }

  if (type === "guion") {
    return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
- Hook (0–3s)
- Desarrollo (3–25s)
- Cierre + CTA (25–35s)
- Texto en pantalla (subtítulos clave)
- B-roll / tomas sugeridas (genéricas)
- 2 variantes de hook (A/B)

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
  }

  if (type === "post") {
    return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
- Post final listo para publicar
- 1 variante alternativa (más corta o más directa)
- CTA suave al final
- Hashtags (si aplica según plataforma)

RESTRICCIONES:
- Evita tecnicismos innecesarios.
- Mantén claridad y utilidad.

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
  }

  if (type === "plan") {
    return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
- Objetivo
- Plan por fases (P0/P1/P2)
- Lista de tareas accionables
- Riesgos y mitigaciones
- Siguiente paso recomendado (1)

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
  }

  if (type === "checklist") {
    return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
- Checklist accionable (bullets)
- Criterio de éxito
- Errores comunes a evitar
- Siguiente paso recomendado (1)

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
  }

  if (type === "email") {
    return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
- Subject (2 opciones)
- Cuerpo (versión normal)
- Cuerpo (versión corta)
- CTA claro (si aplica)

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
  }

  // general
  return `
${baseHeader}

FORMATO DE SALIDA (OBLIGATORIO):
- Resultado final claro y accionable
- Estructura con secciones si hace sentido
- Un ejemplo mínimo si aplica

SUPUESTOS (solo si aplican):
- ${assumptions.join("\n- ")}
`.trim();
}

/**
 * -----------------------------
 * OpenAI output (Pro)
 * -----------------------------
 */
async function runOpenAI(input: string, targetAI: TargetAI) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const system = `
You are a senior prompt engineer.
You MUST output ONLY in the required format and nothing else.
Do NOT explain reasoning.
Do NOT ask questions before producing the final prompt.
If info is missing, include explicit ASSUMPTIONS (do not invent specific facts).
`.trim();

  const master = buildBulletproofPromptMaster(input, targetAI);

  const resp = await client.responses.create({
    model: OPENAI_MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: master },
    ],
  });

  const text = resp.output_text?.trim() ?? "";
  return text || buildMockFinalPrompt(input, targetAI);
}

/**
 * -----------------------------
 * Route
 * -----------------------------
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email ?? undefined;

  if (!userId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
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

  if (!input || input.length < 10) return badRequest("Input demasiado corto.");
  if (!["chatgpt", "claude", "gemini", "deepseek"].includes(targetAI)) return badRequest("targetAI inválido.");
  if (!["standard", "unlimited"].includes(mode)) return badRequest("mode inválido.");

  // ✅ Tier gating
  const tier = await getSubscriptionTier(); // "none" | "basic" | "unlimited"

  if (mode === "unlimited") {
    const okUnlimited = await hasUnlimitedSubscription();
    if (!okUnlimited) {
      return forbidden("Necesitas Pro Unlimited para usar este modo.", "UNLIMITED_REQUIRED", {
        requiredTier: "unlimited",
      });
    }
  }

  const hasPro = tier !== "none";
  const plan: "free" | "pro" = hasPro ? "pro" : "free";

  // ✅ Free daily limit
  if (plan === "free") {
    const from = startOfTodayUTC();
    const usedToday = await prisma.promptOptimizerRun.count({
      where: { userId, plan: "free", createdAt: { gte: from } },
    });

    if (usedToday >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { ok: false, message: `Límite diario alcanzado (${FREE_DAILY_LIMIT}/día).`, code: "FREE_LIMIT_REACHED" },
        { status: 429 }
      );
    }
  }

  // ✅ Engine decision
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
      // ✅ Free: ahora sí devolvemos PROMPT FINAL (no maestro)
      output = buildMockFinalPrompt(input, targetAI);
    }
  } catch {
    output = buildMockFinalPrompt(input, targetAI);
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

  // ✅ Audit
  const storeFullEnv = String(process.env.AUDIT_STORE_OPTIMIZER_INPUT ?? "").toLowerCase() === "true";
  const storeFull = mode === "unlimited" ? true : storeFullEnv;

  await logEvent({
    userId,
    email: email ?? null,
    event: "optimizer.run",
    entityType: "tool",
    entityId: run.id,
    meta: {
      runId: run.id,
      mode,
      subscriptionTier: tier,
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

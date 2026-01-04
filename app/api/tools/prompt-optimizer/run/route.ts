// app/api/tools/prompt-optimizer/run/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";
import { logEvent } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * Free limits
 */
const FREE_DAILY_LIMIT = Number(
  process.env.PROMPT_OPTIMIZER_FREE_DAILY_LIMIT ?? "10"
);

/**
 * OpenAI config
 */
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type TargetAI = "chatgpt" | "claude" | "gemini" | "deepseek";

type Body = {
  input: string;
  targetAI?: TargetAI;
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
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
 * Mock optimizer (Free)
 */
function buildMockOutput(input: string, targetAI: string) {
  return `
PROMPT OPTIMIZADO (PLANTILLA):

Rol:
Eres un asistente experto en ${targetAI.toUpperCase()}.

Objetivo:
[Describe claramente el objetivo principal del prompt.]

Contexto:
[Agrega el contexto mínimo necesario para entender la tarea.]

Instrucciones:
1. Analiza el problema paso a paso.
2. Aplica buenas prácticas de ${targetAI.toUpperCase()}.
3. Evita respuestas genéricas.

Formato de salida:
- Usa secciones claras
- Responde en español
- Sé concreto y accionable

Restricciones:
- No inventes datos
- No incluyas explicaciones externas

PROMPT ORIGINAL:
${input}
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

FORMATO DEL PROMPT FINAL:
ROL:
CONTEXTO:
OBJETIVO:
INPUTS (si faltan, supuestos):
PASOS:
FORMATO DE SALIDA:
REGLAS Y RESTRICCIONES:
CHECKLIST DE CALIDAD:
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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email ?? null;

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

  if (!input || input.length < 10) {
    return badRequest("Input demasiado corto.");
  }

  if (!["chatgpt", "claude", "gemini", "deepseek"].includes(targetAI)) {
    return badRequest("targetAI inválido.");
  }

  const hasSub = await hasActiveSubscription();
  const plan: "free" | "pro" = hasSub ? "pro" : "free";

  // Free daily limit
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
    // fallback seguro
    output = buildMockOutput(input, targetAI);
    model = null;
  }

  const latencyMs = Date.now() - t0;

  // ✅ Guarda run (fuente de verdad)
  await prisma.promptOptimizerRun.create({
    data: {
      userId,
      targetAI,
      plan,
      engine,
      model,
      input,
      output,
    },
  });

  // ✅ Analytics: tool usage real (no guarda input/output)
  logEvent({
    userId,
    email,
    event: "optimizer.run",
    entityType: "tool",
    entityId: "prompt-optimizer",
    meta: {
      plan,
      engine,
      targetAI,
      latencyMs,
      model,
    },
  });

  return NextResponse.json({
    ok: true,
    plan,
    engine,
    model,
    latencyMs,
    output,
  });
}

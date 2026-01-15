import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionSnapshot } from "@/lib/subscription";
import { logEvent } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * =========
 * CONFIG
 * =========
 */
const GROK_MODEL = process.env.GROK_MODEL ?? "grok-4";
const GROK_API_KEY = process.env.GROK_API_KEY;
const DAILY_LIMIT = 20;

/**
 * =========
 * TYPES
 * =========
 */
type Body = {
  input: string;
};

type Extracted = {
  finalPrompt: string;
  variables: Record<string, string>;
};

/**
 * =========
 * HELPERS
 * =========
 */
function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

async function checkDailyLimit(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.auditEvent.count({
    where: {
      userId,
      event: "optimizer.ultimate.run",
      createdAt: { gte: startOfDay },
    },
  });

  return {
    count,
    remaining: Math.max(0, DAILY_LIMIT - count),
    allowed: count < DAILY_LIMIT,
  };
}

/**
 * =========
 * GROK CALL
 * =========
 */
async function runGrokOptimizer(masterPrompt: string) {
  if (!GROK_API_KEY) throw new Error("Missing GROK_API_KEY");

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are a professional prompt optimizer. Return ONLY the optimized prompt in the required format.",
        },
        { role: "user", content: masterPrompt },
      ],
    }),
  });

  const raw = await res.text();

  if (!res.ok) {
    console.error("🔥 GROK API ERROR:", res.status, raw);
    throw new Error(`Grok API error ${res.status}: ${raw}`);
  }

  const data = JSON.parse(raw);
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * =========
 * PARSERS
 * =========
 */

function safeTrim(s: string) {
  return String(s ?? "").replace(/\r/g, "").trim();
}

function extractBlock(text: string, header: string) {
  // header e.g. "VARIABLES:" or "FINAL IMAGE PROMPT:"
  const t = safeTrim(text);
  const idx = t.toLowerCase().indexOf(header.toLowerCase());
  if (idx === -1) return "";
  const after = t.slice(idx + header.length);
  return safeTrim(after);
}

function parseVariablesBlock(block: string): Record<string, string> {
  // Esperamos líneas tipo: KEY: value
  const vars: Record<string, string> = {};
  const lines = safeTrim(block).split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // corta si empieza el siguiente header
    if (/^final image prompt\s*:/i.test(line)) break;

    const m = line.match(/^([A-Z0-9_]+)\s*:\s*(.+)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    if (key && value) vars[key] = value;
  }

  return vars;
}

function extractFinalPromptFromWholeOutput(output: string): string {
  const t = safeTrim(output);
  const markers = ["FINAL IMAGE PROMPT:", "FINAL IMAGE PROMPT"];
  for (const marker of markers) {
    const idx = t.toLowerCase().indexOf(marker.toLowerCase());
    if (idx !== -1) {
      return safeTrim(
        t
          .slice(idx + marker.length)
          .replace(/^[:\n\r\s]+/, "")
      );
    }
  }
  return safeTrim(output);
}

function extractVariablesAndPrompt(rawOutput: string): Extracted {
  const t = safeTrim(rawOutput);

  // 1) Intentar extraer VARIABLES:
  const variablesBlockRaw = (() => {
    const markers = ["VARIABLES:", "EDITABLE VARIABLES:", "VARIABLES"];
    for (const mk of markers) {
      const idx = t.toLowerCase().indexOf(mk.toLowerCase());
      if (idx !== -1) return safeTrim(t.slice(idx + mk.length));
    }
    return "";
  })();

  // Si existe VARIABLES, recortamos hasta antes de FINAL IMAGE PROMPT:
  let variablesBlock = variablesBlockRaw;
  const cutIdx = variablesBlock.toLowerCase().indexOf("final image prompt");
  if (cutIdx !== -1) variablesBlock = safeTrim(variablesBlock.slice(0, cutIdx));

  const variables = variablesBlock ? parseVariablesBlock(variablesBlock) : {};

  // 2) Prompt final
  const finalPrompt = extractFinalPromptFromWholeOutput(t);

  return { finalPrompt, variables };
}

/**
 * =========
 * ROUTE
 * =========
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email ?? null;

  if (!userId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getSubscriptionSnapshot();
  if (snapshot.tier !== "unlimited") {
    return NextResponse.json(
      { ok: false, message: "Pro Unlimited required", code: "UNLIMITED_REQUIRED" },
      { status: 403 }
    );
  }

  const limit = await checkDailyLimit(userId);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Daily limit reached", code: "DAILY_LIMIT_REACHED", limit: DAILY_LIMIT },
      { status: 429 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return badRequest("Invalid body.");
  }

  const input = String(body.input ?? "").trim();
  if (input.length < 10) return badRequest("Input too short.");

  /**
   * ============================
   * MASTER PROMPT (INVISIBLE)
   * ============================
   * Objetivo: el usuario NO ve reglas, solo recibe:
   * - VARIABLES (editables)
   * - FINAL IMAGE PROMPT (con placeholders {{VAR}})
   */
  const MASTER_PROMPT = `
You are the world's best NSFW Image Prompt Optimizer for Grok Imagine (Spicy Mode) and uncensored generators.

TASK:
Convert the USER IDEA into:
1) a compact set of EDITABLE VARIABLES (KEY: value),
2) ONE copy-paste-ready FINAL IMAGE PROMPT that uses placeholders like {{STYLE}}, {{SCENE}}, {{SUBJECT_1}}, etc.

STRICT RULES:
- Output ONLY in the exact format below. No extra text.
- Assume all characters are consenting adults 18+.
- Single frozen scene (no story sequence).
- English only.
- Include quality boosters and a negative prompt at the end.

MANDATORY OUTPUT FORMAT:

VARIABLES:
STYLE: (anime hentai | photorealistic | cinematic | 3d render | disney)
SCENE: (1-2 lines describing location + atmosphere)
SUBJECT_1: (1-2 lines physical description + vibe)
SUBJECT_2: (optional, if applicable)
COMPOSITION: (camera angle, framing, focal length)
LIGHTING: (lighting style)
MOOD: (1 line)
QUALITY_TAGS: (short booster tags)
NEGATIVE_PROMPT: (short negative prompt list)

FINAL IMAGE PROMPT:
Write ONE standalone image prompt using the variables placeholders exactly like:
{{STYLE}}, {{SCENE}}, {{SUBJECT_1}}, {{SUBJECT_2}}, {{COMPOSITION}}, {{LIGHTING}}, {{MOOD}}, {{QUALITY_TAGS}}
End with: Negative prompt: {{NEGATIVE_PROMPT}}

USER IDEA:
"${input}"
`.trim();

  const t0 = Date.now();
  let rawOutput = "";

  try {
    rawOutput = await runGrokOptimizer(MASTER_PROMPT);
  } catch (e: any) {
    console.error("❌ Optimizer Unlimited failed:", e?.message ?? e);
    return NextResponse.json({ ok: false, message: "Error running optimizer." }, { status: 500 });
  }

  const latencyMs = Date.now() - t0;

  const { finalPrompt, variables } = extractVariablesAndPrompt(rawOutput);

  // Fallback: si por alguna razón quedó vacío
  const safeFinalPrompt = finalPrompt || rawOutput.trim();

  /**
   * =========
   * STORE RUN
   * =========
   * schema: engine solo acepta mock|openai, guardamos Grok en model + audit meta
   */
  const run = await prisma.promptOptimizerRun.create({
    data: {
      userId,
      targetAI: "chatgpt",
      plan: "pro",
      engine: "openai",
      model: GROK_MODEL,
      input,
      output: safeFinalPrompt,
    },
    select: { id: true },
  });

  /**
   * =========
   * AUDIT
   * =========
   */
  await logEvent({
    userId,
    email,
    event: "optimizer.ultimate.run",
    entityType: "tool",
    entityId: run.id,
    meta: {
      engine: "grok",
      model: GROK_MODEL,
      latencyMs,
      inputLength: input.length,
      // guardamos variables para debug sin tocar schema
      variables,
    },
  });

  return NextResponse.json({
    ok: true,
    tier: "unlimited",
    engine: "grok",
    model: GROK_MODEL,
    latencyMs,
    remaining: limit.remaining - 1,
    output: safeFinalPrompt, // lo que el usuario copia/pega
    variables,               // lo que tu UI puede renderizar como inputs editables
  });
}

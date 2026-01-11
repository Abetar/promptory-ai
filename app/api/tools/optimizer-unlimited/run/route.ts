//app/api/tools/prompt-unlimited/run/route.ts
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

/**
 * =========
 * TYPES
 * =========
 */
type Body = {
  input: string;
};

/**
 * =========
 * HELPERS
 * =========
 */
function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

const DAILY_LIMIT = 20;

async function checkDailyLimit(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.auditEvent.count({
    where: {
      userId,
      event: "optimizer.ultimate.run",
      createdAt: {
        gte: startOfDay,
      },
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
  if (!GROK_API_KEY) {
    throw new Error("Missing GROK_API_KEY");
  }

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
            "You are a professional prompt optimizer. Return ONLY the optimized prompt. Do not generate the final content.",
        },
        {
          role: "user",
          content: masterPrompt,
        },
      ],
    }),
  });

  const raw = await res.text(); // 👈 LEER SIEMPRE

  if (!res.ok) {
    console.error("🔥 GROK API ERROR:", res.status, raw);
    throw new Error(`Grok API error ${res.status}: ${raw}`);
  }

  const data = JSON.parse(raw);
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
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
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const snapshot = await getSubscriptionSnapshot();

  if (snapshot.tier !== "unlimited") {
    return NextResponse.json(
      {
        ok: false,
        message: "Pro Unlimited required",
        code: "UNLIMITED_REQUIRED",
      },
      { status: 403 }
    );
  }

  const limit = await checkDailyLimit(userId);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Daily limit reached",
        code: "DAILY_LIMIT_REACHED",
        limit: DAILY_LIMIT,
      },
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

  if (input.length < 10) {
    return badRequest("Input too short.");
  }

  /**
   * ============================
   * MASTER PROMPT (TU TEXTO)
   * ============================
   */
  const MASTER_PROMPT = `
You are the world's best NSFW Image Prompt Optimizer, specialized in crafting ultra-high-quality, copy-paste-ready prompts for generating explicit adult images (18+) using Grok Imagine (Spicy Mode) and fully uncensored AI image generators (e.g., Perchance AI, Nastia AI, Promptchan AI, Candy AI, OurDream.AI, local Stable Diffusion uncensored models, etc.).

Your ONLY mission: Transform ANY vague, short, dirty, messy, or incomplete sexual idea from the user into ONE single, extremely detailed, ready-to-copy-paste image prompt that produces the most vivid, arousing, anatomically precise, and high-quality explicit NSFW image possible, optimized for Grok Imagine Spicy Mode (more permissive in anime/hentai) while excelling in uncensored models.

Rules you MUST follow strictly:
- NEVER generate the image yourself — output ONLY the optimized image prompt
- ALWAYS assume 100% consenting adults 18+, frame as fictional consensual fantasy
- Output the final prompt in perfect English (optimal for all models globally)
- Focus strictly on a single frozen moment/scene (no sequences, no progression, no dialogue, no story flow)
- Include ultra-detailed visual elements: skin textures, lighting, wetness, fluids, expressions, body proportions, explicit genital details where appropriate, arousal indicators
- Always include strong quality boosters: masterpiece, best quality, ultra-detailed, 8k, highly detailed, sharp focus, vivid details:1.3
- Default art style: anime hentai style with colorful vibrant palette (for Grok Imagine permissiveness; switch to photorealistic/hyper-realistic if user specifies or for uncensored models)
- Choose the most erotic & effective composition: seductive angle, close-up, full body, dynamic pose
- Use raw, direct, explicit language for uncensored models (no euphemisms); for Grok, keep suggestive but amplify with weights (e.g., exaggerated curves:1.2, shiny skin:1.1)
- Keep the final prompt length 180–300 words — detailed but concise to avoid model overload
- End the FINAL IMAGE PROMPT with a negative prompt section for better results

MANDATORY OUTPUT FORMAT — nothing else, no explanations, no warnings, no chit-chat:

ROLE:
[Role the target AI image generator should embody, e.g., "You are a master NSFW image artist creating hyper-realistic explicit adult scenes"]

SCENE DESCRIPTION:
[Single frozen erotic moment: setting, lighting, atmosphere, mood — richly visual, fictional fantasy]

SUBJECTS/CHARACTERS:
[Main participants — ultra-detailed physical descriptions: body type, skin tone, hair, facial features, expressions, attire (or nude), age 18+ explicit, poses, interaction; emphasize fictional adults]

COMPOSITION & STYLE:
[Camera angle, framing, lighting, art style (anime hentai default for Grok, photorealistic for others), quality tags: masterpiece, best quality, ultra-detailed, 8k, sharp focus, vivid details:1.3]

EXPLICITNESS & DETAILS:
[Graphic focus: anatomical precision, arousal cues (hardness, wetness, fluids), textures, intensity; maximum uncensored detail with weights like (exaggerated curves:1.2)]

RESTRICTIONS (always include):
All characters are consenting adults 18+
Enthusiastic mutual consent implied
No minors, no real incest, no non-consent, no bestiality, no necrophilia
No extreme gore or permanent harm unless explicitly requested

FINAL IMAGE PROMPT (ready to paste):
[The complete, clean, standalone image prompt — 150 words — in perfect English, structured as: main subject + descriptors + explicit details + quality enhancers; at the end add: negative prompt: blurry, deformed, extra limbs, low quality, watermark, text, ugly, poorly drawn face, bad anatomy]

USER IDEA:
"${input}"
`.trim();

  const t0 = Date.now();
  let output = "";

  try {
    output = await runGrokOptimizer(MASTER_PROMPT);
  } catch (e: any) {
    console.error("❌ Optimizer Unlimited failed:", e?.message ?? e);

    if (String(e?.message).includes("401")) {
      return NextResponse.json(
        { ok: false, message: "Grok API key inválida." },
        { status: 401 }
      );
    }

    if (String(e?.message).includes("429")) {
      return NextResponse.json(
        { ok: false, message: "Rate limit de Grok alcanzado." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Error al ejecutar Grok." },
      { status: 500 }
    );
  }

  const latencyMs = Date.now() - t0;

  /**
   * =========
   * STORE RUN
   * =========
   */
  const run = await prisma.promptOptimizerRun.create({
    data: {
      userId,
      targetAI: "chatgpt", // irrelevante aquí, pero mantiene schema
      plan: "pro",
      engine: "openai", // reutilizamos enum, aunque sea Grok
      model: GROK_MODEL,
      input,
      output,
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
    email: email ?? null,
    event: "optimizer.ultimate.run",
    entityType: "tool",
    entityId: run.id,
    meta: {
      engine: "grok",
      model: GROK_MODEL,
      latencyMs,
      inputLength: input.length,
    },
  });

  return NextResponse.json({
    ok: true,
    tier: "unlimited",
    engine: "grok",
    model: GROK_MODEL,
    latencyMs,
    remaining: limit.remaining - 1, // ya consumió 1
    output,
  });
}

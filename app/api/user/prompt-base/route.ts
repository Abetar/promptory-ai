// app/api/user/prompt-base/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; message: string };

function json<T>(body: Ok<T> | Err, status = 200) {
  return NextResponse.json(body, { status });
}

async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!session?.user?.email || !userId) {
    return { session: null, userId: null };
  }

  return { session, userId };
}

// ✅ GET: trae el Prompt Base actual
export async function GET() {
  const { userId } = await requireUser();
  if (!userId) return json({ ok: false, message: "Unauthorized" }, 401);

  const row = await prisma.userPromptBase.findUnique({
    where: { userId },
    select: { content: true, updatedAt: true, createdAt: true },
  });

  return json({
    ok: true,
    data: row ?? { content: "", createdAt: null, updatedAt: null },
  });
}

// ✅ PUT: crea o actualiza el Prompt Base (1 por usuario)
export async function PUT(req: Request) {
  const { userId } = await requireUser();
  if (!userId) return json({ ok: false, message: "Unauthorized" }, 401);

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Invalid JSON body" }, 400);
  }

  const content = String(body?.content ?? "").trim();

  // Reglas mínimas (ajustables)
  if (!content) {
    return json({ ok: false, message: "El Prompt Base no puede ir vacío." }, 400);
  }
  if (content.length > 20000) {
    return json(
      { ok: false, message: "El Prompt Base excede el límite (20,000 caracteres)." },
      400
    );
  }

  const saved = await prisma.userPromptBase.upsert({
    where: { userId },
    create: { userId, content },
    update: { content },
    select: { content: true, updatedAt: true, createdAt: true },
  });

  return json({ ok: true, data: saved });
}

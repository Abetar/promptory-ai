import { prisma } from "@/lib/prisma";

/**
 * Un usuario puede acceder al contentFull de un prompt premium si:
 * - tiene un UserPromptAccess vigente (no expirado), o
 * - el prompt pertenece a un pack publicado que el usuario tiene en UserPack.
 *
 * Nota: aquí NO consideramos isFree; eso se evalúa afuera (más barato).
 */
export async function canAccessPrompt(params: {
  userId: string | null | undefined;
  promptId: string;
}): Promise<boolean> {
  const { userId, promptId } = params;
  if (!userId) return false;

  const now = new Date();

  // 1) Acceso individual directo (vigente)
  const direct = await prisma.userPromptAccess.findUnique({
    where: { userId_promptId: { userId, promptId } },
    select: { expiresAt: true },
  });

  if (direct) {
    if (!direct.expiresAt) return true;
    if (direct.expiresAt > now) return true;
  }

  // 2) Acceso por pack (prompt está en pack del user)
  const viaPack = await prisma.userPack.findFirst({
    where: {
      userId,
      pack: {
        isPublished: true,
        prompts: { some: { promptId } },
      },
    },
    select: { packId: true },
  });

  return Boolean(viaPack);
}

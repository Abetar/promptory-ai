"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { AccessSource } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

/**
 * Parsea fecha de expiración desde <input type="date">
 * - null / vacío → acceso permanente
 * - YYYY-MM-DD → fin del día en UTC
 */
function parseExpiresAt(input: FormDataEntryValue | null): Date | null {
  if (!input) return null;

  const value = String(input).trim();
  if (!value) return null;

  const date = new Date(`${value}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

/**
 * ✅ Otorgar o actualizar acceso a un prompt premium
 * Usa userId (preferido) o email como fallback
 */
export async function grantPromptAccessAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const userId = String(formData.get("userId") || "").trim();
  const userEmail = String(formData.get("userEmail") || "")
    .trim()
    .toLowerCase();

  const promptId = String(formData.get("promptId") || "").trim();
  const sourceRaw = String(formData.get("source") || "manual").trim();
  const expiresAt = parseExpiresAt(formData.get("expiresAt"));

  if (!userId && !userEmail) {
    return { ok: false, message: "Selecciona un usuario." };
  }

  if (!promptId) {
    return { ok: false, message: "Selecciona un prompt." };
  }

  const source = sourceRaw as AccessSource;

  // Buscar usuario (por id o email)
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      })
    : await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true, email: true },
      });

  if (!user) {
    return { ok: false, message: "Usuario no encontrado." };
  }

  // Buscar prompt
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { id: true, title: true, isFree: true },
  });

  if (!prompt) {
    return { ok: false, message: "Prompt no encontrado." };
  }

  if (prompt.isFree) {
    return {
      ok: false,
      message: "Este prompt es gratuito. No requiere acceso especial.",
    };
  }

  // Crear o actualizar acceso
  await prisma.userPromptAccess.upsert({
    where: {
      userId_promptId: {
        userId: user.id,
        promptId: prompt.id,
      },
    },
    create: {
      userId: user.id,
      promptId: prompt.id,
      source,
      expiresAt,
    },
    update: {
      source,
      expiresAt,
    },
  });

  revalidatePath("/dashboard/admin/access");

  return {
    ok: true,
    message: `Acceso otorgado a ${user.email ?? user.id} → "${prompt.title}"`,
  };
}

/**
 * ❌ Revocar acceso a un prompt
 */
export async function revokePromptAccessAction(
  userId: string,
  promptId: string
): Promise<ActionState> {
  await requireAdmin();

  try {
    await prisma.userPromptAccess.delete({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });

    revalidatePath("/dashboard/admin/access");
    return { ok: true, message: "Acceso revocado correctamente." };
  } catch {
    return {
      ok: false,
      message: "No se pudo revocar el acceso (quizá ya no existe).",
    };
  }
}

/**
 * ❌ Revocar acceso por PACK (UserPack)
 * (Esto afecta accesos otorgados por compras o asignación manual de pack)
 */
export async function revokeUserPackAction(
  userId: string,
  packId: string
): Promise<ActionState> {
  await requireAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      // 1) revocar acceso (si no existe, no pasa nada)
      await tx.userPack
        .delete({
          where: { userId_packId: { userId, packId } },
        })
        .catch(() => null);

      // 2) si hay una compra PENDING reciente, marcarla como rechazada
      const lastPending = await tx.packPurchase.findFirst({
        where: { userId, packId, status: "pending" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (lastPending) {
        await tx.packPurchase.update({
          where: { id: lastPending.id },
          data: { status: "rejected", rejectedAt: new Date(), approvedAt: null },
        });
      }
    });

    revalidatePath("/dashboard/admin/access");
    revalidatePath("/dashboard/admin/purchases");

    return { ok: true, message: "Pack revocado y compra pendiente rechazada." };
  } catch {
    return {
      ok: false,
      message: "No se pudo revocar el pack.",
    };
  }
}


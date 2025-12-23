"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function approvePurchaseAction(purchaseId: string) {
  await requireAdmin();

  // 1) marca compra como approved
  const purchase = await prisma.packPurchase.update({
    where: { id: purchaseId },
    data: { status: "approved", approvedAt: new Date() },
    select: { userId: true, packId: true },
  });

  // 2) otorga pack (idempotente)
  await prisma.userPack.upsert({
    where: { userId_packId: { userId: purchase.userId, packId: purchase.packId } },
    update: {},
    create: { userId: purchase.userId, packId: purchase.packId },
  });
}

export async function rejectPurchaseAction(purchaseId: string) {
  await requireAdmin();

  await prisma.packPurchase.update({
    where: { id: purchaseId },
    data: { status: "rejected", rejectedAt: new Date() },
  });

  // Nota: no borramos UserPack aquí porque aún no lo otorgamos en pending.
  // Si más adelante das "acceso temporal", ahí sí revocas temporal.
}

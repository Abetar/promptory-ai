"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approvePurchaseAction(purchaseId: string) {
  await requireAdmin();

  const purchase = await prisma.packPurchase.update({
    where: { id: purchaseId },
    data: { status: "approved", approvedAt: new Date(), rejectedAt: null },
    select: { userId: true, packId: true },
  });

  await prisma.userPack.upsert({
    where: { userId_packId: { userId: purchase.userId, packId: purchase.packId } },
    update: {},
    create: { userId: purchase.userId, packId: purchase.packId },
  });

  revalidatePath("/dashboard/admin/purchases");
}

export async function rejectPurchaseAction(purchaseId: string) {
  await requireAdmin();

  const purchase = await prisma.packPurchase.update({
    where: { id: purchaseId },
    data: { status: "rejected", rejectedAt: new Date(), approvedAt: null },
    select: { userId: true, packId: true },
  });

  await prisma.userPack
    .delete({
      where: { userId_packId: { userId: purchase.userId, packId: purchase.packId } },
    })
    .catch(() => null);

  revalidatePath("/dashboard/admin/purchases");
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createPackPurchasePendingAction(packId: string, mpPaymentId?: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new Error("Not authenticated");

  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { id: true, isFree: true, priceMx: true, isPublished: true },
  });

  if (!pack || !pack.isPublished) throw new Error("Pack not available");
  if (pack.isFree) throw new Error("Pack is free");

  const amountMx = pack.priceMx ?? 0;

  await prisma.packPurchase.create({
    data: {
      userId,
      packId,
      amountMx,
      status: "pending",
      mpPaymentId: mpPaymentId?.trim() || null,
    },
  });
}

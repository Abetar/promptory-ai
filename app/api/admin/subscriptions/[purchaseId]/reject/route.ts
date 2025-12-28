import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ purchaseId: string }> }
) {
  try {
    await requireAdmin();
    const { purchaseId } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.subscriptionPurchase.findUnique({
        where: { id: purchaseId },
        select: { id: true, status: true, userId: true },
      });

      if (!purchase) {
        return { statusCode: 404, body: { ok: false, message: "Purchase not found" } };
      }

      // idempotente
      if (purchase.status === "rejected") {
        return { statusCode: 200, body: { ok: true, status: "rejected" } };
      }

      // regla: no rechazar encima de approved (tu decisión)
      if (purchase.status === "approved") {
        return {
          statusCode: 409,
          body: { ok: false, message: "Purchase already approved" },
        };
      }

      const now = new Date();

      const updatedPurchase = await tx.subscriptionPurchase.update({
        where: { id: purchaseId },
        data: { status: "rejected", rejectedAt: now, approvedAt: null },
        select: { id: true, status: true, rejectedAt: true },
      });

      // Si el usuario tiene una subscripción pending, la marcamos rejected.
      // Si ya tenía approved por otro flujo, NO la tocamos aquí.
      const existing = await tx.userSubscription.findUnique({
        where: { userId: purchase.userId },
        select: { status: true },
      });

      if (!existing) {
        await tx.userSubscription.create({
          data: { userId: purchase.userId, status: "rejected", startsAt: now, endsAt: null },
        });
      } else if (existing.status === "pending") {
        await tx.userSubscription.update({
          where: { userId: purchase.userId },
          data: { status: "rejected" },
        });
      }

      return { statusCode: 200, body: { ok: true, purchase: updatedPurchase } };
    });

    return NextResponse.json(result.body, { status: result.statusCode });
  } catch {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
}

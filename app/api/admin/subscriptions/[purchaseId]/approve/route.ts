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
      if (purchase.status === "approved") {
        await tx.userSubscription.upsert({
          where: { userId: purchase.userId },
          update: { status: "approved", endsAt: null },
          create: {
            userId: purchase.userId,
            status: "approved",
            startsAt: new Date(),
            endsAt: null,
          },
        });

        return { statusCode: 200, body: { ok: true, status: "approved" } };
      }

      // regla: no aprobar encima de rejected (si quieres permitirlo luego, lo cambiamos)
      if (purchase.status === "rejected") {
        return {
          statusCode: 409,
          body: { ok: false, message: "Purchase already rejected" },
        };
      }

      const now = new Date();

      // 1) Update purchase -> approved
      const updatedPurchase = await tx.subscriptionPurchase.update({
        where: { id: purchaseId },
        data: { status: "approved", approvedAt: now, rejectedAt: null, startsAt: now, endsAt: null },
        select: { id: true, status: true, approvedAt: true },
      });

      // 2) Upsert UserSubscription -> approved (fuente real)
      const sub = await tx.userSubscription.upsert({
        where: { userId: purchase.userId },
        update: { status: "approved", startsAt: now, endsAt: null },
        create: { userId: purchase.userId, status: "approved", startsAt: now, endsAt: null },
        select: { id: true, status: true, startsAt: true, endsAt: true, userId: true },
      });

      return {
        statusCode: 200,
        body: { ok: true, purchase: updatedPurchase, subscription: sub },
      };
    });

    return NextResponse.json(result.body, { status: result.statusCode });
  } catch {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
}

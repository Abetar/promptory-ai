import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ purchaseId: string }> }
): Promise<Response> {
  try {
    await requireAdmin();

    const { purchaseId } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.packPurchase.findUnique({
        where: { id: purchaseId },
        select: { id: true, status: true, userId: true, packId: true },
      });

      if (!purchase) {
        return {
          statusCode: 404,
          body: { ok: false, message: "Purchase not found" },
        };
      }

      // Idempotente: si ya está approved, aseguramos entitlement y listo
      if (purchase.status === "approved") {
        await tx.userPack.upsert({
          where: {
            userId_packId: { userId: purchase.userId, packId: purchase.packId },
          },
          update: {},
          create: { userId: purchase.userId, packId: purchase.packId },
        });

        return { statusCode: 200, body: { ok: true, status: "approved" } };
      }

      // Regla clara: si ya fue rechazada, no la aprobamos encima
      if (purchase.status === "rejected") {
        return {
          statusCode: 409,
          body: { ok: false, message: "Purchase already rejected" },
        };
      }

      // pending -> approved
      await tx.userPack.upsert({
        where: {
          userId_packId: { userId: purchase.userId, packId: purchase.packId },
        },
        update: {},
        create: { userId: purchase.userId, packId: purchase.packId },
      });

      const updated = await tx.packPurchase.update({
        where: { id: purchaseId },
        data: { status: "approved", approvedAt: new Date(), rejectedAt: null },
        select: { id: true, status: true, approvedAt: true },
      });

      return { statusCode: 200, body: { ok: true, purchase: updated } };
    });

    return NextResponse.json(result.body, { status: result.statusCode });
  } catch {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: { purchaseId: string } | Promise<{ purchaseId: string }> }
) {
  try {
    await requireAdmin();
    const { purchaseId } = await Promise.resolve(params);

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.packPurchase.findUnique({
        where: { id: purchaseId },
        select: { id: true, status: true, userId: true, packId: true },
      });

      if (!purchase) {
        return { statusCode: 404, body: { ok: false, message: "Purchase not found" } };
      }

      // Si ya está rechazada, idempotente
      if (purchase.status === "rejected") {
        // aseguramos que NO tenga acceso
        await tx.userPack
          .delete({
            where: { userId_packId: { userId: purchase.userId, packId: purchase.packId } },
          })
          .catch(() => null);

        return { statusCode: 200, body: { ok: true, status: "rejected" } };
      }

      // Si ya está aprobada, no la puedes rechazar encima
      if (purchase.status === "approved") {
        return {
          statusCode: 409,
          body: { ok: false, message: "Purchase already approved" },
        };
      }

      // pending -> rejected
      const updated = await tx.packPurchase.update({
        where: { id: purchaseId },
        data: { status: "rejected", rejectedAt: new Date(), approvedAt: null },
        select: { id: true, status: true, rejectedAt: true, userId: true, packId: true },
      });

      // Revocar acceso
      await tx.userPack
        .delete({
          where: { userId_packId: { userId: updated.userId, packId: updated.packId } },
        })
        .catch(() => null);

      return { statusCode: 200, body: { ok: true, purchase: updated } };
    });

    return NextResponse.json(result.body, { status: result.statusCode });
  } catch {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
}

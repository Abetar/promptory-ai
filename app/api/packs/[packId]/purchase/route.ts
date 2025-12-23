// app/api/packs/[packId]/purchase/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: { packId: string } | Promise<{ packId: string }> }
) {
  const { packId } = await Promise.resolve(params);

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const mpUrl = process.env.MERCADOPAGO_PAYMENT_URL;
  if (!mpUrl) {
    return NextResponse.json(
      { ok: false, message: "MercadoPago URL no configurada" },
      { status: 500 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1) validar pack
    const pack = await tx.pack.findUnique({
      where: { id: packId },
      select: { id: true, isFree: true, isPublished: true, priceMx: true },
    });

    if (!pack || !pack.isPublished) {
      return { statusCode: 404, body: { ok: false, message: "Pack no encontrado" } };
    }

    if (pack.isFree) {
      return {
        statusCode: 400,
        body: { ok: false, message: "Pack gratis usa flujo de claim" },
      };
    }

    // 2) crear o reutilizar purchase pending
    let purchase = await tx.packPurchase.findFirst({
      where: { userId, packId, status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    if (!purchase) {
      purchase = await tx.packPurchase.create({
        data: {
          userId,
          packId,
          amountMx: pack.priceMx,
          status: "pending",
        },
      });
    }

    // 3) otorgar acceso temporal (UserPack)
    await tx.userPack.upsert({
      where: { userId_packId: { userId, packId } },
      update: {},
      create: { userId, packId },
    });

    return {
      statusCode: 200,
      body: {
        ok: true,
        purchaseId: purchase.id,
        redirectUrl: mpUrl,
      },
    };
  });

  return NextResponse.json(result.body, { status: result.statusCode });
}

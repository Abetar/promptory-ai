import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const mpUrl = process.env.MERCADOPAGO_SUBSCRIPTION_URL;
  if (!mpUrl) return badRequest("Falta MERCADOPAGO_SUBSCRIPTION_URL en env.");

  // ✅ Aquí decides el precio (MVP fijo)
  const amountMx = 199; // cambia cuando quieras

  // Creamos compra pending + “desbloqueo temporal” = UserSubscription pending
  await prisma.$transaction(async (tx) => {
    await tx.subscriptionPurchase.create({
      data: {
        userId,
        amountMx,
        status: "pending",
      },
    });

    // “acceso temporal” en lo que el admin valida
    await tx.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "pending",
        startsAt: new Date(),
        endsAt: null, // MVP: indefinida mientras sea pending (admin decide)
      },
      update: {
        status: "pending",
        startsAt: new Date(),
        endsAt: null,
      },
    });
  });

  return NextResponse.json({ ok: true, url: mpUrl }, { status: 200 });
}

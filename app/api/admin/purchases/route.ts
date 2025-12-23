import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const status = (url.searchParams.get("status") ?? "pending") as
      | "pending"
      | "approved"
      | "rejected";

    const purchases = await prisma.packPurchase.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        status: true,
        amountMx: true,
        mpPaymentId: true,
        note: true,
        createdAt: true,
        approvedAt: true,
        rejectedAt: true,
        user: { select: { id: true, email: true, name: true } },
        pack: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ ok: true, purchases }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
}

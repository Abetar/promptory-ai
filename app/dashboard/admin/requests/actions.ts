// app/dashboard/admin/requests/actions.ts
"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleResolvedAction(requestId: string) {
  await requireAdmin();

  const req = await prisma.promptRequest.findUnique({
    where: { id: requestId },
    select: { resolvedAt: true },
  });
  if (!req) throw new Error("Request no encontrado");

  await prisma.promptRequest.update({
    where: { id: requestId },
    data: { resolvedAt: req.resolvedAt ? null : new Date() },
  });

  revalidatePath("/dashboard/admin/requests");
  revalidatePath(`/dashboard/admin/requests/${requestId}`);
}

export async function deleteRequestAction(requestId: string) {
  await requireAdmin();

  await prisma.promptRequest.delete({ where: { id: requestId } });

  revalidatePath("/dashboard/admin/requests");
  revalidatePath(`/dashboard/admin/requests/${requestId}`);
}

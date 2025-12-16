"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) redirect("/login");
  return user;
}

export async function toggleSavePromptAction(promptId: string) {
  const user = await requireUser();

  const existing = await prisma.promptSave.findUnique({
    where: { userId_promptId: { userId: user.id, promptId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.promptSave.delete({
      where: { userId_promptId: { userId: user.id, promptId } },
    });
  } else {
    await prisma.promptSave.create({
      data: { userId: user.id, promptId },
    });
  }

  // revalida pantallas relevantes
  revalidatePath("/dashboard/prompts");
  revalidatePath(`/dashboard/prompts/${promptId}`);
  revalidatePath("/dashboard/my-prompts");
}

export async function getSavedPromptIdsForCurrentUser() {
  const user = await requireUser();
  const rows = await prisma.promptSave.findMany({
    where: { userId: user.id },
    select: { promptId: true },
  });
  return new Set(rows.map((r) => r.promptId));
}

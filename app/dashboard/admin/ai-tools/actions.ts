"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

function cleanSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function friendlyError(e: unknown) {
  const msg = String((e as any)?.message || e);
  if (msg.includes("Unique constraint") || msg.includes("P2002")) {
    return "Ese slug ya existe. Usa otro (ej: sora-2).";
  }
  return "No se pudo guardar la AI. Revisa los campos e intenta de nuevo.";
}

export async function createAiToolAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const slugRaw = String(formData.get("slug") ?? "").trim();

    if (!name) return { ok: false, message: "El nombre es obligatorio." };
    if (!slugRaw) return { ok: false, message: "El slug es obligatorio." };

    const slug = cleanSlug(slugRaw);
    if (!slug) return { ok: false, message: "Slug inválido." };

    await prisma.aiTool.create({
      data: { name, slug, isActive: true },
    });

    revalidatePath("/dashboard/admin/ai-tools");
    revalidatePath("/dashboard/prompts"); // filtros
    return { ok: true, message: "AI agregada ✅" };
  } catch (e) {
    return { ok: false, message: friendlyError(e) };
  }
}

export async function toggleAiToolActiveAction(id: string) {
  await requireAdmin();

  const current = await prisma.aiTool.findUnique({
    where: { id },
    select: { isActive: true },
  });

  await prisma.aiTool.update({
    where: { id },
    data: { isActive: !current?.isActive },
  });

  revalidatePath("/dashboard/admin/ai-tools");
  revalidatePath("/dashboard/prompts");
}

export async function deleteAiToolAction(id: string) {
  await requireAdmin();

  await prisma.aiTool.delete({ where: { id } });

  revalidatePath("/dashboard/admin/ai-tools");
  revalidatePath("/dashboard/prompts");
}

export async function updateAiToolNameAction(
  id: string,
  nameRaw: string
): Promise<ActionState> {
  try {
    await requireAdmin();

    const name = String(nameRaw ?? "").trim();
    if (!name) return { ok: false, message: "El nombre es obligatorio." };

    await prisma.aiTool.update({
      where: { id },
      data: { name },
    });

    revalidatePath("/dashboard/admin/ai-tools");
    revalidatePath("/dashboard/prompts"); // filtros y listados donde se usan
    return { ok: true, message: "Nombre actualizado ✅" };
  } catch (e) {
    return { ok: false, message: "No se pudo actualizar el nombre." };
  }
}


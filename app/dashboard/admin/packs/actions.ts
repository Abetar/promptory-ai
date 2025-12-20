// app/dashboard/admin/packs/actions.ts
"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

function toIntSafe(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number(v ?? fallback);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

export async function createPackAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  try {
    const slug = String(formData.get("slug") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const isFree = formData.get("isFree") === "on";
    const isPublished = formData.get("isPublished") === "on";
    const priceMx = toIntSafe(formData.get("priceMx"), 0);

    if (!slug || !title || !description)
      return { ok: false, message: "Completa slug, título y descripción." };

    await prisma.pack.create({
      data: {
        slug,
        title,
        description,
        isFree,
        priceMx: isFree ? 0 : priceMx,
        isPublished,
      },
    });

    revalidatePath("/dashboard/admin/packs");
    revalidatePath("/dashboard/packs");
    return { ok: true, message: "redirect" };
  } catch (e: any) {
    const msg =
      typeof e?.message === "string" ? e.message : "No se pudo crear el pack.";
    return { ok: false, message: msg };
  }
}

export async function updatePackAction(
  packId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  try {
    const slug = String(formData.get("slug") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const isFree = formData.get("isFree") === "on";
    const isPublished = formData.get("isPublished") === "on";
    const priceMx = toIntSafe(formData.get("priceMx"), 0);

    if (!slug || !title || !description)
      return { ok: false, message: "Completa slug, título y descripción." };

    await prisma.pack.update({
      where: { id: packId },
      data: {
        slug,
        title,
        description,
        isFree,
        priceMx: isFree ? 0 : priceMx,
        isPublished,
      },
    });

    revalidatePath("/dashboard/admin/packs");
    revalidatePath(`/dashboard/admin/packs/${packId}/edit`);
    revalidatePath("/dashboard/packs");
    revalidatePath(`/dashboard/packs/${slug}`);
    return { ok: true, message: "redirect" };
  } catch (e: any) {
    const msg =
      typeof e?.message === "string" ? e.message : "No se pudo actualizar el pack.";
    return { ok: false, message: msg };
  }
}

export async function togglePackPublishAction(packId: string) {
  await requireAdmin();

  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { isPublished: true, slug: true },
  });
  if (!pack) throw new Error("Pack no encontrado");

  await prisma.pack.update({
    where: { id: packId },
    data: { isPublished: !pack.isPublished },
  });

  revalidatePath("/dashboard/admin/packs");
  revalidatePath("/dashboard/packs");
  revalidatePath(`/dashboard/packs/${pack.slug}`);
}

export async function deletePackAction(packId: string) {
  await requireAdmin();

  // cascade se encarga de PackPrompt/UserPack
  await prisma.pack.delete({ where: { id: packId } });

  revalidatePath("/dashboard/admin/packs");
  revalidatePath("/dashboard/packs");
}

// app/dashboard/admin/prompts/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import type { PromptType } from "@prisma/client";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

function getString(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function getBool(fd: FormData, key: string) {
  return fd.get(key) === "on" || fd.get(key) === "true";
}

function getAiSlugs(fd: FormData) {
  const raw = fd.getAll("aiSlugs").map((x) => String(x));
  return Array.from(new Set(raw.filter(Boolean)));
}

function friendlyError(e: unknown) {
  const msg = String((e as any)?.message || e);
  if (msg.includes("Unique constraint") || msg.includes("P2002")) {
    return "Ya existe un prompt con ese título. Usa otro título.";
  }
  return "No se pudo guardar el prompt. Revisa los campos e intenta de nuevo.";
}

/**
 * ✅ CREATE (firma compatible con useActionState)
 */
export async function createPromptAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getString(formData, "description");
    const type = getString(formData, "type") as PromptType;

    const isFree = getBool(formData, "isFree");

    const contentPreview = getString(formData, "contentPreview");
    const contentFull = getString(formData, "contentFull");
    const isPublished = getBool(formData, "isPublished");

    const aiSlugs = getAiSlugs(formData);

    // Validaciones
    if (!title) return { ok: false, message: "El título es obligatorio." };
    if (!description)
      return { ok: false, message: "La descripción es obligatoria." };
    if (!contentPreview)
      return { ok: false, message: "El preview es obligatorio." };
    if (!contentFull)
      return { ok: false, message: "El contenido full es obligatorio." };
    if (aiSlugs.length === 0)
      return { ok: false, message: "Selecciona al menos una AI objetivo." };

    const aiTools = await prisma.aiTool.findMany({
      where: { slug: { in: aiSlugs } },
      select: { id: true },
    });

    await prisma.prompt.create({
      data: {
        title,
        description,
        type,
        isFree,
        contentPreview,
        contentFull,
        isPublished,
        aiTools: {
          create: aiTools.map((t) => ({ aiToolId: t.id })),
        },
      },
    });

    revalidatePath("/dashboard/admin/prompts");
    revalidatePath("/dashboard/prompts");

    return { ok: true, message: "Prompt creado correctamente." };
  } catch (e) {
    return { ok: false, message: friendlyError(e) };
  }
}

/**
 * ✅ UPDATE (firma compatible con useActionState)
 * IMPORTANTE: 3 argumentos (promptId, prevState, formData)
 */
export async function updatePromptAction(
  promptId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const title = getString(formData, "title");
    const description = getString(formData, "description");
    const type = getString(formData, "type") as PromptType;

    const isFree = getBool(formData, "isFree");

    const contentPreview = getString(formData, "contentPreview");
    const contentFull = getString(formData, "contentFull");
    const isPublished = getBool(formData, "isPublished");

    const aiSlugs = getAiSlugs(formData);

    // Validaciones
    if (!title) return { ok: false, message: "El título es obligatorio." };
    if (!description)
      return { ok: false, message: "La descripción es obligatoria." };
    if (!contentPreview)
      return { ok: false, message: "El preview es obligatorio." };
    if (!contentFull)
      return { ok: false, message: "El contenido full es obligatorio." };
    if (aiSlugs.length === 0)
      return { ok: false, message: "Selecciona al menos una AI objetivo." };

    const aiTools = await prisma.aiTool.findMany({
      where: { slug: { in: aiSlugs } },
      select: { id: true },
    });

    await prisma.prompt.update({
      where: { id: promptId },
      data: {
        title,
        description,
        type,
        isFree,
        contentPreview,
        contentFull,
        isPublished,
        aiTools: {
          deleteMany: {},
          create: aiTools.map((t) => ({ aiToolId: t.id })),
        },
      },
    });

    revalidatePath("/dashboard/admin/prompts");
    revalidatePath(`/dashboard/prompts/${promptId}`);
    revalidatePath("/dashboard/prompts");

    return { ok: true, message: "Cambios guardados." };
  } catch (e) {
    return { ok: false, message: friendlyError(e) };
  }
}

/**
 * ✅ Toggle publish (server action simple)
 */
export async function togglePublishAction(promptId: string) {
  await requireAdmin();

  const current = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { isPublished: true },
  });

  await prisma.prompt.update({
    where: { id: promptId },
    data: { isPublished: !current?.isPublished },
  });

  revalidatePath("/dashboard/admin/prompts");
  revalidatePath("/dashboard/prompts");
}

/**
 * ✅ Delete (server action simple)
 */
export async function deletePromptAction(promptId: string) {
  await requireAdmin();

  await prisma.prompt.delete({
    where: { id: promptId },
  });

  revalidatePath("/dashboard/admin/prompts");
  revalidatePath("/dashboard/prompts");
}

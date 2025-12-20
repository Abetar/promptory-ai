// app/dashboard/admin/packs/PackForm.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export default function PackForm({
  action,
  submitLabel,
  redirectTo,
  defaultValues,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  redirectTo: string;
  defaultValues?: {
    slug?: string;
    title?: string;
    description?: string;
    isFree?: boolean;
    priceMx?: number;
    isPublished?: boolean;
  };
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    { ok: true }
  );

  useEffect(() => {
    if (state.ok && state.message === "redirect") {
      router.push(redirectTo);
      router.refresh();
    }
  }, [state, redirectTo, router]);

  return (
    <form action={formAction} className="space-y-4">
      {/* Banner error */}
      {!state.ok ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <div className="font-semibold">Error</div>
          <p className="mt-1 text-sm text-red-200/80">{state.message}</p>
        </div>
      ) : null}

      <div>
        <label className="text-sm text-neutral-300">Slug (unique)</label>
        <input
          name="slug"
          defaultValue={defaultValues?.slug ?? ""}
          placeholder="ej: starters-chatgpt"
          className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-neutral-700"
          required
        />
        <p className="mt-1 text-xs text-neutral-500">
          Se usa en la URL: /dashboard/packs/[slug]
        </p>
      </div>

      <div>
        <label className="text-sm text-neutral-300">Título</label>
        <input
          name="title"
          defaultValue={defaultValues?.title ?? ""}
          placeholder="Pack para empezar con..."
          className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-neutral-700"
          required
        />
      </div>

      <div>
        <label className="text-sm text-neutral-300">Descripción</label>
        <textarea
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          placeholder="Colección curada para..."
          rows={4}
          className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-neutral-700"
          required
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-neutral-200">
          <input
            type="checkbox"
            name="isFree"
            defaultChecked={!!defaultValues?.isFree}
            className="accent-neutral-200"
          />
          Pack gratis
        </label>

        <div>
          <label className="text-sm text-neutral-300">Precio MXN</label>
          <input
            name="priceMx"
            type="number"
            min={0}
            defaultValue={defaultValues?.priceMx ?? 0}
            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Si el pack es gratis, el precio se ignora.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-200">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={defaultValues?.isPublished ?? true}
          className="accent-neutral-200"
        />
        Publicado
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}

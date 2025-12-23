"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// ✅ No dependas de Prisma aquí (evita broncas en Vercel)
type PromptType = "texto" | "imagen" | "video";

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

type AiTool = { slug: string; name: string };

function Alert({
  variant,
  message,
}: {
  variant: "error" | "success";
  message: string;
}) {
  const styles =
    variant === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-200"
      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{variant === "error" ? "⚠️" : "✅"}</span>
        <div className="leading-snug">{message}</div>
      </div>
    </div>
  );
}

export default function PromptForm({
  action,
  aiTools,
  defaultValues,
  submitLabel,
  redirectTo,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  aiTools: AiTool[];
  submitLabel: string;
  redirectTo?: string;
  defaultValues?: {
    title?: string;
    description?: string;
    type?: PromptType;
    isFree?: boolean;
    contentPreview?: string;
    contentFull?: string;
    isPublished?: boolean;
    aiSlugs?: string[];
  };
}) {
  const router = useRouter();

  const dv = defaultValues ?? {};
  const selected = useMemo(() => new Set(dv.aiSlugs ?? []), [dv.aiSlugs]);

  // ✅ Evita redirect al cargar (solo después de submit)
  const [didSubmit, setDidSubmit] = useState(false);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    { ok: true, message: "" }
  );

  useEffect(() => {
    if (didSubmit && state.ok && redirectTo) {
      router.push(redirectTo);
    }
  }, [didSubmit, state.ok, redirectTo, router]);

  // ✅ Estado local solo para UX
  const [isFreeLocal, setIsFreeLocal] = useState<boolean>(dv.isFree ?? false);

  async function onSubmit(formData: FormData) {
    // Si es gratis y no llenaron preview, copia full -> preview (para no forzar duplicado)
    const isFree = formData.get("isFree") === "on" || formData.get("isFree") === "true";
    if (isFree) {
      const preview = String(formData.get("contentPreview") ?? "").trim();
      const full = String(formData.get("contentFull") ?? "").trim();
      if (!preview && full) formData.set("contentPreview", full);
    }
    setDidSubmit(true);
    return formAction(formData);
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {state.ok === false ? <Alert variant="error" message={state.message} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Título</label>
          <input
            name="title"
            defaultValue={dv.title ?? ""}
            className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
            placeholder="Ej. Guion TikTok (Hook + CTA)"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Tipo</label>
          <select
            name="type"
            defaultValue={(dv.type ?? "texto") as PromptType}
            className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
          >
            <option value="texto">texto</option>
            <option value="imagen">imagen</option>
            <option value="video">video</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm text-neutral-300">Descripción</label>
          <textarea
            name="description"
            defaultValue={dv.description ?? ""}
            className="min-h-24 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm text-neutral-200 outline-none"
            placeholder="Qué hace este prompt y para qué sirve"
            required
          />
        </div>

        {/* ✅ Acceso (free/premium) SIN precio */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Acceso</label>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                name="isFree"
                defaultChecked={dv.isFree ?? false}
                onChange={(e) => setIsFreeLocal(e.target.checked)}
              />
              Gratis
            </label>

            <span className="text-xs text-neutral-500">
              {isFreeLocal
                ? "Gratis: visible para todos."
                : "Premium: se desbloquea por pack o por acceso manual."}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Publicación</label>
          <label className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={dv.isPublished ?? true}
            />
            Publicado
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-neutral-300">AIs objetivo</label>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {aiTools.map((t) => (
            <label
              key={t.slug}
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200"
            >
              <input
                type="checkbox"
                name="aiSlugs"
                value={t.slug}
                defaultChecked={selected.has(t.slug)}
              />
              {t.name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Preview</label>
          <textarea
            name="contentPreview"
            defaultValue={dv.contentPreview ?? ""}
            className="min-h-44 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm text-neutral-200 outline-none"
            placeholder={isFreeLocal ? "Opcional (si lo dejas vacío, se copiará desde Full)" : ""}
            required={!isFreeLocal}
          />
          {isFreeLocal ? (
            <p className="text-xs text-neutral-500">
              Si está vacío, se usará automáticamente el contenido Full.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Full</label>
          <textarea
            name="contentFull"
            defaultValue={dv.contentFull ?? ""}
            className="min-h-44 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm text-neutral-200 outline-none"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-neutral-950 disabled:opacity-60"
        >
          {isPending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

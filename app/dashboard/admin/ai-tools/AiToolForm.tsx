"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import { createAiToolAction } from "./actions";

function Alert({ state }: { state: ActionState }) {
  if (state.ok) {
    if (!state.message) return null;
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        ✅ {state.message}
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      ⚠️ {state.message}
    </div>
  );
}

export default function AiToolForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createAiToolAction,
    { ok: true }
  );

  return (
    <div className="space-y-4">
      <Alert state={state} />

      <form action={action} className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Nombre</label>
          <input
            name="name"
            placeholder="Sora"
            className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-neutral-300">Slug</label>
          <input
            name="slug"
            placeholder="sora"
            className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
            required
          />
          <p className="text-xs text-neutral-500">
            minúsculas + guiones. ej: nano-banana
          </p>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-950 hover:opacity-90 transition disabled:opacity-60"
          >
            {pending ? "Agregando…" : "+ Agregar AI"}
          </button>
        </div>
      </form>
    </div>
  );
}

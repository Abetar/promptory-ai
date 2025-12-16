"use client";

import { useState, useTransition } from "react";

export default function RowActions({
  promptId,
  isPublished,
  onTogglePublish,
  onDelete,
}: {
  promptId: string;
  isPublished: boolean;
  onTogglePublish: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    startTransition(async () => {
      await onTogglePublish(promptId);
    });
  };

  const confirmDelete = () => setOpen(true);

  const doDelete = () => {
    startTransition(async () => {
      await onDelete(promptId);
      setOpen(false);
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition disabled:opacity-60"
        >
          {isPending ? "..." : isPublished ? "Ocultar" : "Publicar"}
        </button>

        <button
          type="button"
          onClick={confirmDelete}
          disabled={isPending}
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15 transition disabled:opacity-60"
        >
          Borrar
        </button>
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="text-lg font-semibold text-neutral-100">
              ¿Borrar prompt?
            </div>
            <p className="mt-2 text-sm text-neutral-400">
              Esto eliminará el prompt permanentemente. Esta acción no se puede deshacer.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={doDelete}
                disabled={isPending}
                className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
              >
                {isPending ? "Borrando..." : "Sí, borrar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

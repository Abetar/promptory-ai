"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Power } from "lucide-react";
import {
  updateAiToolNameAction,
  toggleAiToolActiveAction,
  deleteAiToolAction,
} from "./actions";

type Props = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
};

export default function AiToolRow({ id, name, slug, isActive }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [pending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      const res = await updateAiToolNameAction(id, value);
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <div className="grid grid-cols-12 items-center px-4 py-3 bg-neutral-900/30">
      {/* Nombre */}
      <div className="col-span-12 md:col-span-5">
        {!isEditing ? (
          <div className="text-sm font-semibold text-neutral-100">{name}</div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
            />
            <button
              type="button"
              disabled={pending}
              onClick={onSave}
              title="Guardar"
              className="rounded-lg bg-neutral-100 p-2 text-neutral-950 hover:opacity-90 disabled:opacity-60"
            >
              ✓
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setValue(name);
                setIsEditing(false);
              }}
              title="Cancelar"
              className="rounded-lg border border-neutral-800 p-2 text-neutral-200 hover:bg-neutral-900 disabled:opacity-60"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Slug */}
      <div className="col-span-12 md:col-span-4 text-sm text-neutral-400 mt-2 md:mt-0">
        {slug}
      </div>

      {/* Estado */}
      <div className="col-span-6 md:col-span-1 mt-3 md:mt-0">
        {isActive ? (
          <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
            Activa
          </span>
        ) : (
          <span className="text-xs rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-400">
            Inactiva
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="col-span-6 md:col-span-2 flex justify-end gap-2 mt-3 md:mt-0">
        {/* Editar */}
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Editar nombre"
            className="rounded-lg border border-neutral-800 p-2 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100 transition"
          >
            <Pencil size={16} />
          </button>
        )}

        {/* Activar / Desactivar */}
        <button
          type="button"
          title={isActive ? "Desactivar" : "Activar"}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await toggleAiToolActiveAction(id);
              router.refresh();
            })
          }
          className={[
            "rounded-lg border p-2 transition",
            isActive
              ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
              : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10",
          ].join(" ")}
        >
          <Power size={16} />
        </button>

        {/* Borrar */}
        <button
          type="button"
          title="Borrar AI"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteAiToolAction(id);
              router.refresh();
            })
          }
          className="rounded-lg border border-red-500/40 p-2 text-red-300 hover:bg-red-500/10 transition disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

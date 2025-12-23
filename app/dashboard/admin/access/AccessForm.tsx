"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  grantPromptAccessAction,
  revokePromptAccessAction,
  revokeUserPackAction,
} from "./actions";

type UserOption = { id: string; email: string | null; name: string | null };
type PromptOption = { id: string; title: string };

// ✅ Ahora soporta filas de Prompt y de Pack
type RecentRow =
  | {
      kind: "prompt";
      userId: string;
      itemId: string; // promptId
      userEmail: string | null;
      itemTitle: string; // promptTitle
      source: string;
      status: string; // "active" | etc
      expiresAt: string | null;
      createdAt: string;
    }
  | {
      kind: "pack";
      userId: string;
      itemId: string; // packId
      userEmail: string | null;
      itemTitle: string; // packTitle
      source: string; // "purchase"
      status: string; // pending/approved/rejected/unknown
      expiresAt: null;
      createdAt: string;
    };

type Props = {
  users: UserOption[];
  prompts: PromptOption[];
  recent: RecentRow[];
};

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export default function AccessForm({ users, prompts, recent }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | null>(null);

  // Search inputs
  const [userQuery, setUserQuery] = useState("");
  const [promptQuery, setPromptQuery] = useState("");

  // Selected ids
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState("");

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const email = (u.email || "").toLowerCase();
      const name = (u.name || "").toLowerCase();
      return email.includes(q) || name.includes(q);
    });
  }, [users, userQuery]);

  const filteredPrompts = useMemo(() => {
    const q = promptQuery.trim().toLowerCase();
    if (!q) return prompts;
    return prompts.filter((p) => p.title.toLowerCase().includes(q));
  }, [prompts, promptQuery]);

  async function onSubmit(formData: FormData) {
    setState(null);

    formData.set("userId", selectedUserId);
    formData.set("promptId", selectedPromptId);

    startTransition(async () => {
      const res = await grantPromptAccessAction({ ok: true }, formData);
      setState(res);
      router.refresh();
    });
  }

  async function onRevokePrompt(userId: string, promptId: string) {
    setState(null);
    startTransition(async () => {
      const res = await revokePromptAccessAction(userId, promptId);
      setState(res);
      router.refresh();
    });
  }

  async function onRevokePack(userId: string, packId: string) {
    setState(null);
    startTransition(async () => {
      const res = await revokeUserPackAction(userId, packId);
      setState(res);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      {state ? (
        <div
          className={[
            "rounded-2xl border p-4 text-sm",
            state.ok
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200",
          ].join(" ")}
        >
          <div className="font-semibold">{state.ok ? "Listo" : "Error"}</div>
          {state.message ? (
            <div className="mt-1 opacity-90">{state.message}</div>
          ) : null}
        </div>
      ) : null}

      {/* Form (solo PromptAccess manual, se queda igual) */}
      <form
        action={onSubmit}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4"
      >
        <div>
          <div className="text-sm font-semibold text-neutral-100">
            Otorgar acceso a prompt premium
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Selecciona usuario y prompt. Esto crea/actualiza{" "}
            <span className="text-neutral-200">UserPromptAccess</span>.
          </p>
        </div>

        {/* User picker */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Buscar usuario</label>
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="filtra por email o nombre..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Usuario</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
            >
              <option value="" disabled>
                Selecciona un usuario…
              </option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {(u.email || "sin-email") + (u.name ? ` — ${u.name}` : "")}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              Se cargan los últimos {users.length} usuarios (ajustable).
            </p>
          </div>
        </div>

        {/* Prompt picker */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Buscar prompt</label>
            <input
              value={promptQuery}
              onChange={(e) => setPromptQuery(e.target.value)}
              placeholder="filtra por título..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Prompt premium</label>
            <select
              value={selectedPromptId}
              onChange={(e) => setSelectedPromptId(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
            >
              <option value="" disabled>
                Selecciona un prompt…
              </option>
              {filteredPrompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              Solo se listan prompts premium (isFree = false).
            </p>
          </div>
        </div>

        {/* Source + expires */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Fuente (source)</label>
            <select
              name="source"
              defaultValue="manual"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
            >
              <option value="manual">manual</option>
              <option value="promo">promo</option>
              <option value="payment">payment</option>
              <option value="support">support</option>
              <option value="temp">temp</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400">Expira (opcional)</label>
            <input
              name="expiresAt"
              type="date"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
            />
            <p className="text-xs text-neutral-500">Vacío = permanente.</p>
          </div>
        </div>

        {/* Hidden fallbacks */}
        <input type="hidden" name="userEmail" value="" />
        <input type="hidden" name="promptId" value={selectedPromptId} />
        <input type="hidden" name="userId" value={selectedUserId} />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              pending
                ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-100 text-neutral-950 hover:opacity-90",
            ].join(" ")}
          >
            {pending ? "Guardando..." : "Otorgar acceso"}
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-neutral-950 px-4 py-3 text-xs text-neutral-400">
          <div className="col-span-4">Usuario</div>
          <div className="col-span-4">Acceso</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-neutral-800">
          {recent.map((r) => {
            const key = `${r.kind}-${r.userId}-${r.itemId}`;

            const badge =
              r.kind === "pack"
                ? r.status === "approved"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : r.status === "rejected"
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                : "border-neutral-800 bg-neutral-950 text-neutral-300";

            const statusText =
              r.kind === "pack"
                ? (r.status === "approved"
                    ? "Compra aprobada"
                    : r.status === "rejected"
                    ? "Compra rechazada"
                    : r.status === "pending"
                    ? "Compra pendiente"
                    : "Estado desconocido")
                : r.expiresAt
                ? `Expira ${r.expiresAt}`
                : "Permanente";

            return (
              <div
                key={key}
                className="grid grid-cols-12 items-center gap-0 px-4 py-3 bg-neutral-900/30"
              >
                <div className="col-span-12 md:col-span-4">
                  <div className="text-sm font-semibold text-neutral-100">
                    {r.userEmail ?? r.userId}
                  </div>
                  <div className="text-xs text-neutral-500">{r.createdAt}</div>
                </div>

                <div className="col-span-12 md:col-span-4 mt-3 md:mt-0">
                  <div className="text-sm text-neutral-200">
                    {r.kind === "pack" ? "Pack: " : "Prompt: "}
                    {r.itemTitle}
                  </div>
                  <div className="text-xs text-neutral-500">source: {r.source}</div>
                </div>

                <div className="col-span-6 md:col-span-2 mt-3 md:mt-0">
                  <span className={`text-xs rounded-full border px-2 py-1 ${badge}`}>
                    {statusText}
                  </span>
                </div>

                <div className="col-span-6 md:col-span-2 mt-3 md:mt-0 flex justify-end">
                  {r.kind === "prompt" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onRevokePrompt(r.userId, r.itemId)}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15 transition disabled:opacity-60"
                    >
                      Revocar
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onRevokePack(r.userId, r.itemId)}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15 transition disabled:opacity-60"
                    >
                      Revocar pack
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {recent.length === 0 ? (
            <div className="px-4 py-10 text-center text-neutral-400">
              Aún no hay accesos otorgados.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

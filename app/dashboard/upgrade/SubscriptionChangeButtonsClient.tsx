// app/dashboard/upgrade/SubscriptionChangeButtonsClient.tsx
"use client";

import { useState } from "react";

type Tier = "none" | "basic" | "unlimited";
type ChangeType = "cancel" | "downgrade";

type Props = {
  currentTier: Tier;
  showAdminLink?: boolean;
};

export default function SubscriptionChangeButtonsClient({
  currentTier,
  showAdminLink = false,
}: Props) {
  // ✅ Si no tiene Pro, no mostramos nada
  if (currentTier === "none") return null;

  const [pending, setPending] = useState<ChangeType | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function send(type: ChangeType) {
    setErr(null);
    setInfo(null);
    setPending(type);

    try {
      const res = await fetch("/api/subscription/change-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ type }),
      });

      const data = (await res.json().catch(() => ({}))) as any;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message ?? "No se pudo enviar la solicitud.");
      }

      setInfo(data?.message ?? "Solicitud enviada.");
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo conectar con el servidor.");
    } finally {
      setPending(null);
    }
  }

  const buttonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
  const buttonDisabled = "bg-neutral-800 text-neutral-400 cursor-not-allowed";

  const btnDanger =
    "border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/15";
  const btnFuchsia = "bg-fuchsia-500 text-neutral-950 hover:opacity-90";
  const btnNeutral =
    "border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900";

  const isUnlimited = currentTier === "unlimited";
  const isBusy = pending !== null;

  return (
    <div className="space-y-2">
      <div className="text-xs text-neutral-500">
        Cambios manuales: esto crea un request para Admin (Mercado Pago se ajusta manual).
      </div>

      <div className="flex flex-wrap gap-2">
        {/* ✅ Downgrade: SOLO si es unlimited */}
        {isUnlimited ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => send("downgrade")}
            className={[buttonBase, isBusy ? buttonDisabled : btnFuchsia].join(" ")}
          >
            {pending === "downgrade" ? "Enviando..." : "Solicitar downgrade a Basic"}
          </button>
        ) : null}

        {/* ✅ Cancel: disponible para Basic y Unlimited */}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => send("cancel")}
          className={[buttonBase, isBusy ? buttonDisabled : btnDanger].join(" ")}
        >
          {pending === "cancel" ? "Enviando..." : "Solicitar cancelación"}
        </button>

        {showAdminLink ? (
          <a
            href="/dashboard/admin/subscriptions"
            target="_blank"
            rel="noreferrer"
            className={[buttonBase, btnNeutral].join(" ")}
          >
            Ver en Admin →
          </a>
        ) : null}
      </div>

      {info ? <div className="text-xs text-emerald-300">{info}</div> : null}
      {err ? <div className="text-xs text-red-300">{err}</div> : null}
    </div>
  );
}

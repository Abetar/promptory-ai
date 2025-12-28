// app/dashboard/upgrade/UpgradeRequestCardClient.tsx
"use client";

import { useState } from "react";

type Props = {
  mode: "request" | "pro-already";
};

export default function UpgradeRequestCardClient({ mode }: Props) {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onRequest() {
    setErr(null);
    setPending(true);

    try {
      // 1) crear request en DB
      const res = await fetch("/api/subscription/request", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message ?? "No se pudo crear la solicitud.");
        setPending(false);
        return;
      }

      // 2) redirigir a link de pago (MercadoPago o lo que uses)
      const url = process.env.NEXT_PUBLIC_SUBSCRIPTION_PAYMENT_URL;
      if (!url) {
        // si no existe env, al menos no rompemos
        setErr("Falta NEXT_PUBLIC_SUBSCRIPTION_PAYMENT_URL en .env.local");
        setPending(false);
        return;
      }

      window.location.href = url;
    } catch {
      setErr("No se pudo conectar con el servidor.");
      setPending(false);
    }
  }

  function onOpenPaymentLink() {
    const url = process.env.NEXT_PUBLIC_SUBSCRIPTION_PAYMENT_URL;
    if (!url) {
      setErr("Falta NEXT_PUBLIC_SUBSCRIPTION_PAYMENT_URL en .env.local");
      return;
    }
    window.location.href = url;
  }

  // Si ya es Pro, este botón solo re-abre el link (por si quiere pagar otra vez)
  if (mode === "pro-already") {
    return (
      <button
        type="button"
        onClick={onOpenPaymentLink}
        className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
      >
        Abrir link de pago
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onRequest}
        disabled={pending}
        className={[
          "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
          pending
            ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
            : "bg-amber-500 text-neutral-950 hover:opacity-90",
        ].join(" ")}
      >
        {pending ? "Redirigiendo..." : "Solicitar suscripción Pro"}
      </button>

      {err ? <div className="text-xs text-red-300">{err}</div> : null}
    </div>
  );
}

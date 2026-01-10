// app/dashboard/upgrade/UpgradeRequestCardClient.tsx
"use client";

import { useState } from "react";

type SubscriptionTier = "basic" | "unlimited";

type Props = {
  mode: "request" | "pro-already";
  tier?: SubscriptionTier;
};

type ApiResponse =
  | {
      ok: true;
      status: "pending" | "approved";
      tier: SubscriptionTier;
      checkoutUrl: string | null;
      message?: string;
      purchaseId?: string;
    }
  | { ok: false; message: string };

export default function UpgradeRequestCardClient({
  mode,
  tier = "basic",
}: Props) {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function createRequestAndGetCheckoutUrl(): Promise<string | null> {
    const res = await fetch(`/api/subscription/request?tier=${tier}`, {
      method: "POST",
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as ApiResponse;

    if (!res.ok || !("ok" in data) || data.ok === false) {
      throw new Error((data as any)?.message ?? "No se pudo crear la solicitud.");
    }

    // ✅ Si ya está approved, el backend puede regresar checkoutUrl: null
    //    En ese caso no redirigimos y mostramos mensaje.
    if (data.status === "approved") {
      setInfo(
        data.message ??
          (tier === "unlimited"
            ? "Ya tienes Pro Unlimited activo."
            : "Ya tienes Pro Basic activo.")
      );
      return null;
    }

    const checkoutUrl = data.checkoutUrl;
    if (!checkoutUrl) {
      // pending pero sin link = error de configuración (env faltante, etc.)
      throw new Error("No se recibió checkoutUrl desde el servidor.");
    }

    return checkoutUrl;
  }

  async function onRequest() {
    setErr(null);
    setInfo(null);
    setPending(true);

    try {
      const checkoutUrl = await createRequestAndGetCheckoutUrl();

      if (!checkoutUrl) {
        // approved: no redirigimos
        setPending(false);
        return;
      }

      // redirigir
      window.location.href = checkoutUrl;
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo conectar con el servidor.");
      setPending(false);
    }
  }

  async function onOpenPaymentLink() {
    setErr(null);
    setInfo(null);
    setPending(true);

    try {
      // idempotente: si ya hay pending para ese tier, lo regresa; si no, lo crea
      const checkoutUrl = await createRequestAndGetCheckoutUrl();

      if (!checkoutUrl) {
        // approved: no redirigimos
        setPending(false);
        return;
      }

      window.location.href = checkoutUrl;
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo abrir el link de pago.");
      setPending(false);
    }
  }

  const buttonBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";

  const buttonDisabled = "bg-neutral-800 text-neutral-400 cursor-not-allowed";

  const buttonRequest =
    tier === "unlimited"
      ? "bg-fuchsia-500 text-neutral-950 hover:opacity-90"
      : "bg-amber-500 text-neutral-950 hover:opacity-90";

  const buttonOpen =
    "border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900";

  const label =
    mode === "pro-already"
      ? tier === "unlimited"
        ? "Abrir link Pro Unlimited"
        : "Abrir link Pro Basic"
      : tier === "unlimited"
      ? "Solicitar Pro Unlimited"
      : "Solicitar Pro Basic";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={mode === "pro-already" ? onOpenPaymentLink : onRequest}
        disabled={pending}
        className={[
          buttonBase,
          pending
            ? buttonDisabled
            : mode === "pro-already"
            ? buttonOpen
            : buttonRequest,
        ].join(" ")}
      >
        {pending ? "Redirigiendo..." : label}
      </button>

      {info ? <div className="text-xs text-emerald-300">{info}</div> : null}
      {err ? <div className="text-xs text-red-300">{err}</div> : null}
    </div>
  );
}

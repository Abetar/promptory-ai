// app/dashboard/packs/[slug]/PurchasePackButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  packId: string;
  isFree: boolean;
  alreadyHasAccess: boolean;
};

export default function PurchasePackButton({ packId, isFree, alreadyHasAccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (alreadyHasAccess) {
    return (
      <button
        disabled
        className="w-full sm:w-auto rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-300"
      >
        Ya tienes acceso
      </button>
    );
  }

  if (isFree) {
    return (
      <button
        disabled
        className="w-full sm:w-auto rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-300"
        title="Pendiente: flujo de claim"
      >
        Pack gratis
      </button>
    );
  }

  async function onBuy() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/packs/${packId}/purchase`, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setMsg(data?.message ?? "No se pudo iniciar la compra.");
        return;
      }

      const redirectUrl = data?.redirectUrl as string | undefined;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setMsg("Solicitud creada. Ve a “Mis compras” para ver el estado.");
      router.refresh();
    } catch {
      setMsg("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full sm:w-auto space-y-2">
      <button
        onClick={onBuy}
        disabled={loading}
        className="w-full sm:w-auto rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition disabled:opacity-60"
      >
        {loading ? "Creando solicitud..." : "Comprar pack"}
      </button>

      {msg ? <p className="text-xs text-neutral-400">{msg}</p> : null}

      <a
        href="/dashboard/compras"
        className="block text-xs text-neutral-300 hover:text-neutral-100 underline"
      >
        Ver mis compras →
      </a>
    </div>
  );
}

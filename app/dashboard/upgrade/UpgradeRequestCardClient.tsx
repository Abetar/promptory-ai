// app/dashboard/upgrade/UpgradeRequestCardClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  initialStatus: "pending" | "approved" | "rejected" | "cancelled" | null;
};

type ApiOk = { ok: true };
type ApiErr = { ok: false; message: string };

export default function UpgradeRequestCardClient({ initialStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const label = useMemo(() => {
    if (initialStatus === "pending") return "Solicitud enviada (pendiente de aprobación)";
    if (initialStatus === "rejected") return "Solicitud rechazada";
    if (initialStatus === "cancelled") return "Suscripción cancelada";
    return null;
  }, [initialStatus]);

  async function onRequest() {
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/subscription/request", { method: "POST" });
        const data = (await res.json()) as ApiOk | ApiErr;

        if (!res.ok || !data || (data as any).ok === false) {
          setError((data as ApiErr)?.message ?? "No se pudo solicitar Pro.");
          return;
        }

        // refresca server data (status)
        router.refresh();
      } catch {
        setError("No se pudo conectar con el servidor.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {label ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="font-semibold text-amber-200">{label}</div>
          <p className="mt-1 text-sm text-amber-200/80">
            Si ya realizaste el pago, un admin lo validará manualmente.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRequest}
          disabled={pending || initialStatus === "pending"}
          className={[
            "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
            pending || initialStatus === "pending"
              ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
              : "bg-amber-500 text-neutral-950 hover:opacity-90",
          ].join(" ")}
        >
          {initialStatus === "pending"
            ? "Solicitud enviada"
            : pending
            ? "Enviando..."
            : "Solicitar suscripción Pro"}
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          Volver
        </Link>
      </div>

      <p className="text-xs text-neutral-500">
        En este MVP: aprobación manual tipo “packs”. (Luego lo conectamos a cobro real.)
      </p>
    </div>
  );
}

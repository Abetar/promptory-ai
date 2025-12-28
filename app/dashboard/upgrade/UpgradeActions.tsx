"use client";

import Link from "next/link";

type Props = {
  isLoggedIn: boolean;
};

export default function UpgradeActions({ isLoggedIn }: Props) {
  async function requestPro() {
    const res = await fetch("/api/subscription/request", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message ?? "Error al solicitar Pro");
      return;
    }

    alert("Solicitud enviada. Pendiente de aprobación.");
  }

  return (
    <div className="flex flex-wrap gap-2 pt-4">
      {!isLoggedIn ? (
        <Link
          href="/api/auth/signin"
          className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
        >
          Iniciar sesión
        </Link>
      ) : (
        <button
          onClick={requestPro}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          Solicitar Pro
        </button>
      )}

      <Link
        href="/dashboard"
        className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
      >
        Volver
      </Link>
    </div>
  );
}

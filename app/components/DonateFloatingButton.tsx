"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DonateFloatingButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ESC para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleCopy() {
    const text =
      "Promptory AI me ayudó muchísimo. Aquí está el link para apoyar el proyecto: https://mpago.la/1Q8nSAF";

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback (por si clipboard no está permitido)
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-3 text-sm font-semibold text-neutral-100 shadow-lg backdrop-blur hover:bg-neutral-900 transition"
        aria-label="Apoyar Promptory AI"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950">
          {/* heart icon */}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 21s-7-4.6-9.3-8.5C.6 9 .9 5.8 3.6 4.2 5.6 3 8.1 3.5 9.7 5c.9.9 1.5 2 2.3 3 .8-1 1.4-2.1 2.3-3 1.6-1.5 4.1-2 6.1-.8 2.7 1.6 3 4.8.9 8.3C19 16.4 12 21 12 21z" />
          </svg>
        </span>
        <span>Apoyar</span>
      </button>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-neutral-100">
                  Mantengamos Promptory AI gratuito
                </div>
                <p className="mt-1 text-sm text-neutral-400">
                  Si te ahorra tiempo, una donación ayuda a pagar hosting y a
                  seguir agregando prompts nuevos cada semana.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900 transition"
                aria-label="Cerrar"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {/* CTA principal */}
              <Link
                href="/donar"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              >
                Ver opciones para donar →
              </Link>

              {/* CTA secundario (con feedback) */}
              <button
                type="button"
                onClick={handleCopy}
                className={[
                  "inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                  copied
                    ? "bg-emerald-500 text-neutral-950"
                    : "border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                ].join(" ")}
              >
                {copied ? "✓ Mensaje copiado" : "Copiar mensaje para compartir"}
              </button>

              <p className="mt-2 text-xs text-neutral-500">
                Tip: si no puedes donar, con compartir el proyecto también ayudas 🙌
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

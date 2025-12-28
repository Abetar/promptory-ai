export const runtime = "nodejs";

import Link from "next/link";

export default function PromptGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300">
          Prompt Generator
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Próximamente
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Esta herramienta está en construcción. Muy pronto podrás generar prompts
          profesionales a partir de objetivos y contexto.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-3">
        <div className="text-sm font-semibold text-neutral-100">
          ¿Qué incluirá?
        </div>
        <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
          <li>Inputs guiados (objetivo, audiencia, tono, formato)</li>
          <li>Plantillas por rol (Dev, Marketing, Ventas, QA, etc.)</li>
          <li>Versiones “Short / Standard / Pro”</li>
        </ul>

        <div className="pt-2 flex flex-wrap gap-2">
          <Link
            href="/dashboard/tools"
            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            ← Volver a Tools
          </Link>

          <Link
            href="/dashboard/upgrade"
            className="inline-flex items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/15 transition"
          >
            Ver Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

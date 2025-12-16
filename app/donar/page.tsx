import Link from "next/link";

export const runtime = "nodejs";

export default function DonarPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Donaciones</h1>
        <p className="mt-2 text-neutral-400">
          Promptory AI busca mantener la mayoría del contenido gratuito.
          Las donaciones ayudan a cubrir hosting, base de datos y tiempo de curación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="text-sm font-semibold text-neutral-100">Pequeña</div>
          <div className="mt-2 text-2xl font-semibold text-neutral-100">$20 MXN</div>
          <p className="mt-2 text-sm text-neutral-400">
            Un “gracias”, pero cuenta mucho.
          </p>
          <div className="mt-4">
            <a
              className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              href="https://mpago.la/23ufzeP"
              target="_blank"
              rel="noreferrer"
            >
              Donar $20 →
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="text-sm font-semibold text-neutral-100">Apoyo</div>
          <div className="mt-2 text-2xl font-semibold text-neutral-100">$50 MXN</div>
          <p className="mt-2 text-sm text-neutral-400">
            Ayudas a publicar más prompts cada semana.
          </p>
          <div className="mt-4">
            <a
              className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              href="https://mpago.la/1Q8nSAF"
              target="_blank"
              rel="noreferrer"
            >
              Donar $50 →
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="text-sm font-semibold text-neutral-100">Sponsor</div>
          <div className="mt-2 text-2xl font-semibold text-neutral-100">$100 MXN</div>
          <p className="mt-2 text-sm text-neutral-400">
            Mantienes vivo el proyecto 💛
          </p>
          <div className="mt-4">
            <a
              className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              href="https://mpago.la/19GZES9"
              target="_blank"
              rel="noreferrer"
            >
              Donar $100 →
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-2">
        <div className="text-sm font-semibold text-neutral-100">
          Mensaje sugerido (para compartir)
        </div>
        <p className="text-sm text-neutral-400">
          “Estoy usando Promptory AI para prompts listos para ChatGPT/Midjourney/Claude.
          Si te sirve, apóyalo con una donación para que siga gratis.”
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/prompts"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

// app/donar/page.tsx
import Link from "next/link";

export const runtime = "nodejs";

function Card({
  title,
  amount,
  desc,
  href,
  cta,
}: {
  title: string;
  amount: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {amount}
      </div>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {desc}
      </p>

      <div className="mt-4">
        <a
          className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition dark:bg-neutral-100 dark:text-neutral-950"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {cta} →
        </a>
      </div>
    </div>
  );
}

export default function DonarPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Donaciones
        </h1>

        <p className="text-neutral-700 dark:text-neutral-300">
          Promptory AI busca mantener la mayoría del contenido gratuito. Las
          donaciones ayudan a cubrir hosting, base de datos y tiempo de curación.
        </p>

        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          * Los botones abren MercadoPago en una pestaña nueva.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card
          title="Pequeña"
          amount="$20 MXN"
          desc='Un “gracias”, pero cuenta mucho.'
          href="https://mpago.la/23ufzeP"
          cta="Donar $20"
        />
        <Card
          title="Apoyo"
          amount="$50 MXN"
          desc="Ayudas a publicar más prompts cada semana."
          href="https://mpago.la/1Q8nSAF"
          cta="Donar $50"
        />
        <Card
          title="Sponsor"
          amount="$100 MXN"
          desc="Mantienes vivo el proyecto 💛"
          href="https://mpago.la/19GZES9"
          cta="Donar $100"
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Mensaje sugerido (para compartir)
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          “Estoy usando Promptory AI para prompts listos para
          ChatGPT/Midjourney/Claude. Si te sirve, apóyalo con una donación para
          que siga gratis.”
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/prompts"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Volver al catálogo
        </Link>

        <Link
          href="/dashboard/solicitar-prompt"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition dark:bg-neutral-100 dark:text-neutral-950"
        >
          Solicitar un prompt →
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-32 -left-40 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/95" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Promptory AI" width={36} height={36} priority />
            <span className="font-semibold tracking-tight text-lg">Promptory AI</span>
            <span className="ml-2 hidden sm:inline-flex text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
              beta
            </span>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
            >
              Probar gratis
            </Link>
          </nav>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                Optimiza prompts en segundos (ChatGPT first)
              </p>

              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Mejores respuestas de IA,{" "}
                <span className="text-white/70">sin prueba y error</span>.
              </h1>

              <p className="mt-4 text-white/70 max-w-xl">
                Pega tu prompt y Promptory AI lo mejora automáticamente: más claro, más estructurado y listo para
                obtener resultados consistentes. Ideal para marketing, ventas, RH, soporte y creadores.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
                >
                  Probar Prompt Optimizer
                </Link>
                <a
                  href="#how"
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition text-center"
                >
                  Cómo funciona
                </a>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat title="Más claridad" desc="Prompts con estructura" />
                <MiniStat title="Menos fricción" desc="Sin teoría ni cursos" />
                <MiniStat title="Más rápido" desc="Listo para copiar" />
              </div>

              <p className="mt-6 text-xs text-white/50">
                Promptory AI es un producto SaaS: el valor está en la herramienta, no en vender texto copiable.
              </p>
            </div>

            {/* Right card mock (Prompt Optimizer demo) */}
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
                    Prompt Optimizer
                  </span>
                  <span className="text-xs text-white/50">ChatGPT</span>
                </div>

                <h3 className="mt-4 text-lg font-semibold">Pega tu prompt → recibe una versión mejor</h3>
                <p className="mt-2 text-sm text-white/70">
                  Te devuelve un prompt con objetivos, variables y formato para mejores respuestas.
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                    <p className="text-xs text-white/50 mb-2">Tu prompt</p>
                    Hazme un post para Instagram sobre mi servicio.
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                    <p className="text-xs text-white/50 mb-2">Optimizado</p>
                    Actúa como copywriter. Crea 5 variantes para un post de Instagram sobre{" "}
                    {"{SERVICIO}"} para {"{AUDIENCIA}"}.
                    Incluye: hook, beneficios, objeción y CTA. Tono: {"{TONO}"}.
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-white/50">Optimiza en segundos</span>
                  <Link
                    href="/login"
                    className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
                  >
                    Probar
                  </Link>
                </div>
              </div>

              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] border border-white/5" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
              <p className="mt-2 text-white/70 max-w-2xl">
                No necesitas aprender prompt engineering. Solo pega tu prompt y usa la versión optimizada.
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Probar ahora
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              step="1"
              title="Pega tu prompt"
              desc="Lo que normalmente escribirías en ChatGPT, tal cual."
            />
            <StepCard
              step="2"
              title="Optimiza con un click"
              desc="Estructura, variables y formato para mejores respuestas."
            />
            <StepCard
              step="3"
              title="Copia y ejecuta"
              desc="Úsalo en ChatGPT y obtén resultados más consistentes."
            />
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Planes</h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Empieza gratis. Si lo usas seguido, Pro se paga solo por el tiempo que te ahorra.
                </p>
              </div>
              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
              >
                Probar gratis
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlanCard
                title="Free"
                price="Gratis"
                highlight={false}
                bullets={[
                  "Acceso para probar el Optimizer",
                  "Uso limitado",
                  "Ideal para conocer el flujo",
                ]}
              />
              <PlanCard
                title="Pro"
                price="$99–$149 MXN/mes"
                subtitle="Suscripción"
                highlight={true}
                bullets={[
                  "Prompt Optimizer sin límites",
                  "Mejores resultados con menos esfuerzo",
                  "Pensado para uso recurrente",
                ]}
              />
            </div>

            <p className="mt-6 text-xs text-white/50">
              Nota: el precio final puede ajustarse. La meta es mantenerlo accesible para LATAM.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Promptory AI" width={28} height={28} />
              <div>
                <p className="text-sm font-medium">Promptory AI</p>
                <p className="text-xs text-white/50">© {new Date().getFullYear()}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <Link className="hover:text-white transition" href="/terms">
                Términos
              </Link>
              <Link className="hover:text-white transition" href="/privacy">
                Aviso de privacidad
              </Link>
              <a className="hover:text-white transition" href="mailto:agsolutions96@gmail.com">
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MiniStat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-white/60">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <div className="flex items-center gap-3">
        <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
          Paso {step}
        </span>
        <p className="text-base font-semibold">{title}</p>
      </div>
      <p className="mt-3 text-sm text-white/70">{desc}</p>
    </div>
  );
}

function PlanCard({
  title,
  price,
  subtitle,
  bullets,
  highlight,
}: {
  title: string;
  price: string;
  subtitle?: string;
  bullets: string[];
  highlight: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border p-6",
        highlight ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-white/60">{subtitle}</p> : null}
        </div>

        {highlight ? (
          <span className="text-xs rounded-full bg-white text-black px-2 py-1 font-medium">
            Recomendado
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight">{price}</p>

      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/login"
        className={[
          "mt-6 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition",
          highlight
            ? "bg-white text-black hover:bg-white/90"
            : "border border-white/15 bg-white/5 text-white/85 hover:bg-white/10",
        ].join(" ")}
      >
        {highlight ? "Empezar Pro" : "Probar"}
      </Link>
    </div>
  );
}

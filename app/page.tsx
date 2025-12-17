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
              Empezar
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
                Banco de prompts optimizados
              </p>

              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Mejores resultados con IA, <span className="text-white/70">sin adivinar prompts</span>.
              </h1>

              <p className="mt-4 text-white/70 max-w-xl">
                Promptory AI es tu bóveda de prompts curados para texto, imágenes y video. Encuentra,
                copia y ejecuta prompts listos para producir resultados premium.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
                >
                  Iniciar sesión con Google
                </Link>
                <a
                  href="#features"
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition text-center"
                >
                  Ver beneficios
                </a>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat title="Curado" desc="Prompts probados, no genéricos" />
                <MiniStat title="Rápido" desc="Copia / pega en segundos" />
                <MiniStat title="Escalable" desc="Gratis + premium" />
              </div>
            </div>

            {/* Right card mock */}
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
                    Prompt destacado
                  </span>
                  <span className="text-xs text-white/50">Texto</span>
                </div>

                <h3 className="mt-4 text-lg font-semibold">Resumen ejecutivo profesional</h3>
                <p className="mt-2 text-sm text-white/70">
                  Convierte cualquier texto en bullets, acciones y riesgos, en formato listo para mandar.
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75 whitespace-pre-wrap">
                  Eres un asistente que resume el siguiente texto en:
                  {"\n"}- 5 bullets
                  {"\n"}- 3 acciones recomendadas
                  {"\n"}- 3 riesgos principales
                  {"\n\n"}Texto: {"{TEXTO}"}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-white/50">Listo para copiar</span>
                  <Link
                    href="/login"
                    className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
                  >
                    Acceder
                  </Link>
                </div>
              </div>

              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] border border-white/5" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Hecho para producir</h2>
              <p className="mt-2 text-white/70 max-w-2xl">
                Estructura clara, categorías, y prompts listos para resultados consistentes.
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Entrar al dashboard
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Prompts por tipo"
              desc="Texto, imagen y video. Encuentra rápido lo que necesitas."
            />
            <FeatureCard
              title="Vista previa + Full"
              desc="Preview para decidir; full prompt para ejecutar."
            />
            {/* <FeatureCard
              title="Modelo comercial"
              desc="Gratis, compra por prompt y paquetes. Suscripciones después."
            /> */}
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
              <a className="hover:text-white transition" href="mailto:soporte@promptory.ai">
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

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </div>
  );
}

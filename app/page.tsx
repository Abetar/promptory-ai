import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import LandingHeader from "@/app/components/LandingHeader";

export default function LandingPage() {
  const siteUrl = "https://promptory-ai.vercel.app";

  // ✅ Cierra <details> al hacer click en cualquier item del menú.
  const closeAllDetails = () => {
    if (typeof document === "undefined") return;
    document
      .querySelectorAll("details[data-nav]")
      .forEach((d) => d.removeAttribute("open"));
  };

  /**
   * ✅ FAQ: corto, directo, sin “defensiva”.
   */
  const faq = [
    {
      q: "¿Qué es Promptory AI en una sola frase?",
      a: "Una herramienta para obtener resultados claros de la IA desde el primer intento, convirtiendo prompts vagos en instrucciones accionables.",
    },
    {
      q: "¿Qué hace exactamente el Prompt Optimizer?",
      a: "Estructura tu intención en un prompt listo para ejecutar: objetivo, inputs, restricciones y formato de salida para reducir respuestas genéricas.",
    },
    {
      q: "¿Qué papel tiene el repositorio de prompts?",
      a: "Es el punto de partida: ejemplos reales para no empezar desde cero. El core del producto es optimizar y reutilizar prompts que sí funcionan.",
    },
    {
      q: "¿Qué son los Workflows (Prompt Packs)?",
      a: "Procesos completos para llegar a un resultado específico sin adivinar. No son prompts sueltos: son un sistema de inicio → salida final.",
    },
  ];

  /**
   * ✅ SEO: alineado a “resultados desde el primer intento”.
   * Nota: AggregateOffer solo para suscripciones (Free/Pro/Pro Unlimited).
   */
  const jsonLdSoftwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Promptory AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Herramienta para obtener resultados claros de la IA desde el primer intento: convierte prompts vagos en instrucciones accionables y repetibles.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MXN",
      lowPrice: "0",
      highPrice: "149",
      offerCount: "3",
    },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Script
        id="ld-softwareapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-32 -left-40 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/95" />
      </div>

      {/* NAVBAR */}
      <LandingHeader />

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              {/* ✅ Early access aquí (menos ruido en header) */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 text-xs rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                  Menos ensayo-error. Más resultados concretos.
                </span>
                <span className="inline-flex text-xs rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">
                  early access
                </span>
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Obtén resultados claros de la IA{" "}
                <span className="text-white/70">desde el primer intento</span>.
              </h1>

              <p className="mt-4 text-white/70 max-w-xl">
                Promptory toma tu intención y la vuelve una instrucción
                ejecutable: reduce respuestas genéricas y te evita iteraciones
                inútiles.
              </p>

              <div className="mt-6 grid gap-2 text-sm text-white/75">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
                  Menos respuestas vagas.
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
                  Menos “ajustes” sin rumbo.
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
                  Más prompts repetibles que sí funcionan.
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
                >
                  Optimiza tu primer prompt gratis
                </Link>
                <a
                  href="#optimizer"
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition text-center"
                >
                  Ver antes / después
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <TrustPill>Sin instalar nada</TrustPill>
                <TrustPill>Google login</TrustPill>
                <TrustPill>Optimiza y reutiliza</TrustPill>
                <TrustPill>Menos fricción mental</TrustPill>
              </div>
            </div>

            {/* Right card mock */}
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
                    Prompt Optimizer (core)
                  </span>
                  <span className="text-xs text-white/50">
                    Dentro del Dashboard
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  Aquí es donde tus prompts dejan de fallar
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  Convierte una intención vaga en una instrucción operacional
                  (repetible y con formato de salida).
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                    <p className="text-xs text-white/50 mb-2">Antes</p>
                    Hazme un post para redes sobre mi servicio.
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                    <p className="text-xs text-white/50 mb-2">
                      Después (listo para ejecutar)
                    </p>
                    <div className="space-y-2">
                      <p>
                        <span className="text-white/60">Rol:</span> Copywriter
                        senior
                      </p>
                      <p>
                        <span className="text-white/60">Objetivo:</span> Crear 5
                        variantes de post para {"{AUDIENCIA}"} sobre{" "}
                        {"{SERVICIO}"}.
                      </p>
                      <p>
                        <span className="text-white/60">Inputs:</span> contexto{" "}
                        {"{CONTEXTO}"} / beneficio {"{BENEFICIO}"} / objeción{" "}
                        {"{OBJECION}"}.
                      </p>
                      <p>
                        <span className="text-white/60">Restricciones:</span>{" "}
                        sin jerga, máx. 120 palabras, tono {"{TONO}"}.
                      </p>
                      <p>
                        <span className="text-white/60">
                          Formato (obligatorio):
                        </span>{" "}
                        lista numerada con Hook → Beneficio → Objeción → CTA.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-white/50">
                    Login → Optimizer
                  </span>
                  <Link
                    href="/login"
                    className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
                  >
                    Probar
                  </Link>
                </div>
              </div>

              <div
                className="pointer-events-none absolute -inset-6 rounded-[2rem] border border-white/5"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* OPTIMIZER */}
      <section id="optimizer" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Prompt Optimizer
              </h2>
              <p className="mt-2 text-white/70 max-w-2xl">
                Convierte intención vaga → instrucción ejecutable. Menos
                ensayo-error, más resultados concretos.
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Optimizar un prompt
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/60">Qué hace</p>
              <h3 className="mt-2 text-lg font-semibold">
                Hace tu prompt repetible
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Te fuerza a definir lo que normalmente queda ambiguo: objetivo,
                inputs, restricciones y salida.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>Objetivo</Chip>
                <Chip>Inputs</Chip>
                <Chip>Restricciones</Chip>
                <Chip>Salida</Chip>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/60">Lo que cambia</p>
              <h3 className="mt-2 text-lg font-semibold">
                De “prueba y error” → a trabajo real
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Optimiza una vez, reutiliza después. Menos fricción mental cada
                vez que vuelves a pedir algo a la IA.
              </p>
              <div className="mt-5">
                <Link
                  href="/login"
                  className="inline-flex rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition"
                >
                  Optimiza tu primer prompt
                </Link>
              </div>
            </div>
          </div>

          {/* Upsell silencioso (NSFW) */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-white/50">Opcional (upsell)</p>
                <p className="mt-1 font-semibold">
                  Optimizer Ultimate{" "}
                  <span className="ml-2 text-xs rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-fuchsia-200">
                    Pro Unlimited
                  </span>
                </p>
                <p className="mt-2 text-sm text-white/70 max-w-2xl">
                  Tier cerrado con age-gate y uso controlado diario. No es el
                  foco del producto.
                </p>
              </div>
              <Link
                href="/login"
                className="shrink-0 inline-flex rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-5 py-2 text-sm text-fuchsia-200 hover:bg-fuchsia-500/15 transition"
              >
                Ver Pro Unlimited
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Planes simples
                </h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Empieza gratis. Si quieres resultados más limpios y
                  consistentes, sube a Pro.
                </p>
              </div>
              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
              >
                Empezar gratis
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <p className="text-xs text-white/50">Free</p>
                <p className="mt-2 text-base font-semibold">
                  Para probar el flujo
                </p>
                <p className="mt-2 text-sm text-white/70">
                  <span className="font-medium text-white/85">
                    10 optimizaciones/día
                  </span>{" "}
                  (básicas).
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <p className="text-xs text-white/50">Pro</p>
                <p className="mt-2 text-base font-semibold">
                  Resultados más limpios
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Optimización avanzada.{" "}
                  <span className="font-medium text-white/85">
                    Desde $99 MXN/mes
                  </span>
                  .
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <p className="text-xs text-white/50">Pro Unlimited</p>
                <p className="mt-2 text-base font-semibold">
                  Upsell cerrado (NSFW)
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Ultimate + age-gate.{" "}
                  <span className="font-medium text-white/85">
                    Desde $149 MXN/mes
                  </span>
                  .
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-white/50">
              Nota: Promptory entrega prompts listos para ejecutar en tu IA
              favorita (no genera el contenido final dentro de la app).
            </p>
          </div>
        </div>
      </section>

      {/* REPOSITORIO */}
      <section id="repositorio" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Ejemplos para no empezar desde cero
              </h2>
              <p className="mt-2 text-white/70 max-w-2xl">
                Toma un ejemplo real como base y luego optimízalo para tu caso.
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Ver ejemplos
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Explora por caso de uso"
              desc="Encuentra ejemplos por tipo de trabajo (marketing, dev, soporte, etc.)."
              cta="Abrir ejemplos"
            />
            <FeatureCard
              title="Copia, adapta, optimiza"
              desc="Empieza con un ejemplo y conviértelo en una instrucción accionable."
              cta="Optimizar ahora"
            />
            <FeatureCard
              title="Guárdalo y reutiliza"
              desc="Si algo funciona, no lo vuelvas a construir desde cero."
              cta="Guardar prompts"
            />
          </div>
        </div>
      </section>

      {/* PROMPT BASE */}
      <section id="prompt-base" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Tu Prompt Base
                </h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Tus mejores prompts viven aquí. Menos fricción mental cada vez
                  que vuelves a pedir algo a la IA.
                </p>
              </div>

              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
              >
                Guardar mi Prompt Base
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <MiniStat title="Hábito" desc="Un lugar fijo para tus prompts" />
              <MiniStat
                title="Switching cost"
                desc="Más difícil volver atrás"
              />
              <MiniStat
                title="Reutilización"
                desc="Optimiza una vez, usa muchas"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PACKS */}
      <section id="packs" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Workflows (Prompt Packs)
                </h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Sistemas completos para llegar a un resultado específico sin
                  adivinar (no consumibles en 5 minutos).
                </p>
              </div>

              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
              >
                Ver workflows en Dashboard
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <PackCard
                title="Workflows gratis"
                desc="Para probar el enfoque de proceso completo."
                tag="free"
              />
              <PackCard
                title="Workflows premium"
                desc="Para tu trabajo real: proceso completo, reusable, y con resultado claro."
                tag="premium"
              />
              <PackCard
                title="Mis compras"
                desc="Acceso y estado de tus workflows."
                tag="dashboard"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              <p className="text-xs text-white/50 mb-1">Regla simple</p>
              Workflows te dan dirección. El Optimizer es el motor para subir la
              calidad del resultado.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            Preguntas frecuentes
          </h2>
          <p className="mt-2 text-white/70 max-w-2xl">
            Respuestas rápidas para decidir sin fricción.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {faq.map((item) => (
              <div
                key={item.q}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
              >
                <p className="font-medium">{item.q}</p>
                <p className="mt-2 text-sm text-white/70">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="inline-flex justify-center rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition"
            >
              Optimiza tu primer prompt
            </Link>
            <a
              href="#optimizer"
              className="inline-flex justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition"
            >
              Ver antes / después
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpeg"
                alt="Promptory AI"
                width={100}
                height={100}
                priority
              />
              <div>
                <p className="text-sm font-medium">Promptory AI</p>
                <p className="text-xs text-white/50">
                  © {new Date().getFullYear()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <Link className="hover:text-white transition" href="/terms">
                Términos
              </Link>
              <Link className="hover:text-white transition" href="/privacy">
                Aviso de privacidad
              </Link>
              <a
                className="hover:text-white transition"
                href="mailto:agsolutions96@gmail.com"
              >
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA (más compacto en mobile) */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="text-sm text-white/80">
              Optimiza tu prompt y obtén un resultado claro.
              <span className="ml-2 text-white/60 text-xs hidden sm:inline">
                Sin ensayo-error infinito.
              </span>
            </div>
            <div className="flex gap-2">
              <a
                href="#optimizer"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Antes / después
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                Probar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/** Components */
function MiniStat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-white/60">{desc}</p>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  cta,
}: {
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
      <div className="mt-5">
        <Link
          href="/login"
          className="inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
        >
          {cta} →
        </Link>
      </div>
    </div>
  );
}

function PackCard({
  title,
  desc,
  tag,
}: {
  title: string;
  desc: string;
  tag: "free" | "premium" | "dashboard";
}) {
  const badge =
    tag === "free" ? "Gratis" : tag === "premium" ? "Premium" : "Dashboard";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <div className="flex items-start justify-between gap-4">
        <p className="text-base font-semibold">{title}</p>
        <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/70">{desc}</p>

      <Link
        href="/login"
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
      >
        Ver en dashboard
      </Link>
    </div>
  );
}

function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import LandingHeader from "@/app/components/LandingHeader";

export default function LandingPage() {
  const siteUrl = "https://promptory-ai.vercel.app";

  // ✅ Cierra <details> al hacer click en cualquier item del menú.
  // (Actualmente no se usa aquí porque LandingHeader está separado, pero lo dejamos por si lo conectas)
  const closeAllDetails = () => {
    if (typeof document === "undefined") return;
    document
      .querySelectorAll("details[data-nav]")
      .forEach((d) => d.removeAttribute("open"));
  };

  /**
   * ✅ FAQ: directo, sin defensiva, y deja claro el core.
   */
  const faq = [
    {
      q: "¿Qué es Promptory AI en una sola frase?",
      a: "Una herramienta para dejar de iterar con la IA y obtener resultados claros desde el primer intento.",
    },
    {
      q: "¿Qué hace exactamente el Prompt Optimizer?",
      a: "Convierte tu intención en un prompt operativo: objetivo, inputs, restricciones y formato de salida. Eso reduce respuestas genéricas y acelera el resultado.",
    },
    {
      q: "¿El repositorio es lo principal?",
      a: "No. El repositorio es el punto de partida para no empezar desde cero. El core es optimizar y reutilizar prompts que sí funcionan.",
    },
    {
      q: "¿Qué son los Workflows (Prompt Packs)?",
      a: "Workflows completos para llegar a un resultado específico sin improvisar. Dirección + estructura + salida clara.",
    },
    {
      q: "¿Promptory genera el contenido final dentro de la app?",
      a: "No. Promptory entrega prompts listos para ejecutar en tu IA favorita. El valor está en que el prompt llegue a algo concreto rápido.",
    },
  ];

  /**
   * ✅ SEO
   */
  const jsonLdSoftwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Promptory AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Herramienta para obtener resultados claros de la IA desde el primer intento: convierte prompts vagos en instrucciones ejecutables y repetibles.",
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
                Deja de perder tiempo{" "}
                <span className="text-white/70">peleando con la IA</span>.
                <br />
                Obtén resultados claros{" "}
                <span className="text-white/70">desde el primer intento</span>.
              </h1>

              <p className="mt-4 text-white/70 max-w-xl">
                Promptory convierte prompts vagos en instrucciones ejecutables:
                objetivo, inputs, restricciones y formato de salida.{" "}
                <span className="text-white/85 font-medium">
                  Menos respuestas genéricas. Más trabajo real.
                </span>
              </p>

              <div className="mt-6 grid gap-2 text-sm text-white/75">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
                  De “suena bien” → a “sirve y se puede usar”.
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
                  Menos ajustes sin rumbo para “ver si ahora sí”.
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" />
                  Prompts repetibles que puedes guardar y reutilizar.
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition text-center"
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
                <TrustPill>Optimiza una vez, reutiliza</TrustPill>
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
                  No es “hacerlo más bonito”. Es hacerlo operativo para que la
                  IA entregue algo accionable.
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                    <p className="text-xs text-white/50 mb-2">Antes</p>
                    Hazme un post para redes sobre mi servicio, que se vea
                    profesional y que venda.
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                    <p className="text-xs text-white/50 mb-2">
                      Después (listo para ejecutar)
                    </p>
                    <div className="space-y-2">
                      <p>
                        <span className="text-white/60">Rol:</span> Copywriter
                        senior B2C
                      </p>
                      <p>
                        <span className="text-white/60">Objetivo:</span> Crear 5
                        posts con hooks distintos para {"{AUDIENCIA}"} sobre{" "}
                        {"{SERVICIO}"}.
                      </p>
                      <p>
                        <span className="text-white/60">Inputs:</span>{" "}
                        {"{CONTEXTO}"} / {"{BENEFICIO}"} / {"{OBJECION}"} /{" "}
                        {"{PRUEBA_SOCIAL}"}.
                      </p>
                      <p>
                        <span className="text-white/60">Restricciones:</span>{" "}
                        sin jerga, 110–140 palabras, tono {"{TONO}"}, CTA
                        explícito.
                      </p>
                      <p>
                        <span className="text-white/60">
                          Formato obligatorio:
                        </span>{" "}
                        Hook → Beneficio → Objeción → Micro-prueba → CTA.
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-white/50">
                      Resultado: menos “respuestas bonitas”, más salida utilizable.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-white/50">
                    Login → Optimizer
                  </span>
                  <Link
                    href="/login"
                    className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
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

          {/* Problema (identificación) */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-black/40 p-6">
            <p className="text-xs text-white/50">
              Si esto te pasa, estás quemando tiempo
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/75">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Iteras 6 veces para llegar a algo “más o menos”.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                La IA responde “correcto”, pero no entrega algo accionable.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Cambias palabras a ciegas esperando un resultado distinto.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Terminas “hablando” con la IA sin avanzar en trabajo real.
              </div>
            </div>
          </div>

          {/* Cómo se usa (reduce abstracción) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              title="1) Pega tu prompt"
              desc="No importa si está mal. Así lo escriben todos al inicio."
            />
            <StepCard
              title="2) Optimízalo"
              desc="Lo convierte en una instrucción con objetivo, inputs, restricciones y salida."
            />
            <StepCard
              title="3) Ejecuta y guarda"
              desc="Si funcionó, lo guardas y lo reutilizas sin volver a pensar desde cero."
            />
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
                Convierte intención vaga → instrucción ejecutable. Lo que mata
                lo “genérico” es especificar objetivo, inputs, restricciones y
                formato de salida.
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
                Te obliga a definir lo que normalmente queda ambiguo. Eso reduce
                “respuestas bonitas” y aumenta salida utilizable.
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
                De “prueba y error” → a ejecución
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Optimiza una vez, reutiliza después. Cada prompt guardado reduce
                fricción mental en el futuro.
              </p>
              <div className="mt-5">
                <Link
                  href="/login"
                  className="inline-flex rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition"
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
                  Tier cerrado con age-gate y límites diarios. No es el foco del
                  producto.
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
                  Empieza gratis. Si quieres consistencia y menos iteraciones,
                  sube a Pro.
                </p>
              </div>
              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition text-center"
              >
                Empezar gratis
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <p className="text-xs text-white/50">Free</p>
                <p className="mt-2 text-base font-semibold">
                  Sal del prompt genérico
                </p>
                <p className="mt-2 text-sm text-white/70">
                  <span className="font-medium text-white/85">
                    10 optimizaciones/día
                  </span>{" "}
                  para convertir “vago” → “operativo”.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <p className="text-xs text-white/50">Pro</p>
                <p className="mt-2 text-base font-semibold">
                  Resultados más limpios
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Optimización avanzada y mejor consistencia.{" "}
                  <span className="font-medium text-white/85">$99 MXN/mes</span>.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <p className="text-xs text-white/50">Pro Unlimited</p>
                <p className="mt-2 text-base font-semibold">
                  Upsell cerrado (NSFW)
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Ultimate + age-gate.{" "}
                  <span className="font-medium text-white/85">$149 MXN/mes</span>.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-white/50">
              Promptory entrega prompts listos para ejecutar en tu IA favorita.
              El valor está en llegar a algo concreto más rápido.
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
              desc="Ejemplos reales por tipo de trabajo: marketing, dev, soporte, etc."
              cta="Abrir ejemplos"
            />
            <FeatureCard
              title="Copia, adapta, optimiza"
              desc="Empieza con un ejemplo y conviértelo en una instrucción accionable."
              cta="Optimizar ahora"
            />
            <FeatureCard
              title="Guárdalo y reutiliza"
              desc="Si algo funciona, no lo reconstruyas: guárdalo y vuelve cuando lo necesites."
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
                  Aquí viven tus prompts que ya funcionan. Cada prompt guardado
                  es menos fricción mental para tu “yo” del futuro.
                </p>
              </div>

              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition text-center"
              >
                Guardar mi Prompt Base
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <MiniStat title="Hábito" desc="Un lugar fijo para tus prompts" />
              <MiniStat title="Switching cost" desc="Tu librería te ata" />
              <MiniStat title="Reutilización" desc="Optimiza una vez, úsalo muchas" />
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
                  Workflows completos para llegar a un resultado específico sin
                  improvisar: dirección + estructura + salida clara.
                </p>
              </div>

              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition text-center"
              >
                Ver workflows en Dashboard
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <PackCard
                title="Workflows gratis"
                desc="Prueba el sistema de inicio → salida sin pagar."
                tag="free"
              />
              <PackCard
                title="Workflows premium"
                desc="Para trabajo real: proceso completo y reusable, diseñado para llegar a algo concreto."
                tag="premium"
              />
              <PackCard
                title="Mis compras"
                desc="Acceso y estado de tus workflows (sin perder lo que ya funciona)."
                tag="dashboard"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              <p className="text-xs text-white/50 mb-1">Regla simple</p>
              Workflows te dan dirección. El Optimizer es el motor que sube la
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
              className="inline-flex justify-center rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition"
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

      {/* Sticky CTA */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="text-sm text-white/80">
              Deja el ensayo-error y obtén un resultado claro.
              <span className="ml-2 text-white/60 text-xs hidden sm:inline">
                Optimiza una vez, reutiliza después.
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

function StepCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
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
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
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

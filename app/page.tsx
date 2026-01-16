import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import LandingHeader from "@/app/components/LandingHeader";

/**
 * Landing con animaciones:
 * - fadeUp / fadeIn / blurIn (CSS keyframes)
 * - reveal on scroll (IntersectionObserver)
 * - hover lift (microinteractions)
 */
export default function LandingPage() {
  const siteUrl = "https://promptory-ai.vercel.app";

  const faq = [
    {
      q: "¿Esto escribe por mí o solo corrige?",
      a: "Hace ambas: mejora lo que ya tienes y también puede reescribirlo si está muy crudo. El objetivo es que salga claro, profesional y listo para enviar.",
    },
    {
      q: "¿Tengo que saber prompts?",
      a: "No. Pegas tu texto y listo. Promptory se encarga de estructura, tono y claridad sin que tengas que pensar en prompts.",
    },
    {
      q: "¿Sirve para trabajo y para contenido?",
      a: "Sí. El foco es texto útil (mensajes, correos, respuestas, documentos) y también puedes adaptarlo para posts o contenido cuando lo necesites.",
    },
  ];

  const jsonLdSoftwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Promptory AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Promptory AI mejora y profesionaliza tu texto en segundos. Pega un mensaje, correo o post y obtén una versión clara, consistente y lista para enviar.",
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

      {/* --- Animations (no libs) --- */}
      <Script id="reveal-on-scroll" strategy="afterInteractive">{`
        (() => {
          const els = Array.from(document.querySelectorAll('[data-reveal]'));
          if (!('IntersectionObserver' in window) || els.length === 0) {
            els.forEach(el => el.classList.add('is-visible'));
            return;
          }
          const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
              }
            }
          }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
          els.forEach(el => io.observe(el));
        })();
      `}</Script>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-reveal], .hero-fade, .glow-pulse {
            animation: none !important;
            transition: none !important;
          }
        }

        /* Reveal base */
        [data-reveal] {
          opacity: 0;
          transform: translateY(14px);
          filter: blur(6px);
          transition: opacity .65s ease, transform .65s ease, filter .65s ease;
          will-change: opacity, transform, filter;
        }
        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }

        /* Hero stagger */
        .hero-fade {
          opacity: 0;
          transform: translateY(14px);
          filter: blur(6px);
          animation: heroUp .8s ease forwards;
        }
        .d1 { animation-delay: .05s; }
        .d2 { animation-delay: .12s; }
        .d3 { animation-delay: .18s; }
        .d4 { animation-delay: .25s; }
        .d5 { animation-delay: .32s; }

        @keyframes heroUp {
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        /* Soft glow pulse on background or accents */
        .glow-pulse {
          animation: glowPulse 5.5s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-6px) scale(1.03); opacity: .92; }
        }

        /* Micro interactions */
        .lift {
          transition: transform .18s ease, background-color .18s ease, border-color .18s ease;
          will-change: transform;
        }
        .lift:hover { transform: translateY(-2px); }
        .lift:active { transform: translateY(0); }
      `}</style>

      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl glow-pulse" />
        <div className="absolute top-24 -left-44 h-[460px] w-[460px] rounded-full bg-white/5 blur-3xl glow-pulse" />
        <div className="absolute bottom-0 right-0 h-[560px] w-[560px] rounded-full bg-white/5 blur-3xl glow-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/95" />
      </div>

      {/* NAV */}
      <LandingHeader />

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left */}
            <div>
              <div className="hero-fade d1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                Pega → mejora → envía (sin pensar demasiado)
              </div>

              <h1 className="hero-fade d2 mt-5 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Arregla y profesionaliza tu texto.
                <br />
                <span className="text-white/70">En segundos.</span>
              </h1>

              <p className="hero-fade d3 mt-4 text-white/70 max-w-xl">
                Promptory toma tu texto tal cual (correo, mensaje, respuesta, post) y lo
                convierte en una versión{" "}
                <span className="text-white/85 font-medium">
                  clara, profesional y lista para enviar
                </span>
                . Sin pensar en prompts.
              </p>

              <div className="hero-fade d4 mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="lift rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition text-center"
                >
                  Mejorar texto gratis
                </Link>
                <a
                  href="#demo"
                  className="lift rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition text-center"
                >
                  Ver antes vs después
                </a>
              </div>

              <div className="hero-fade d5 mt-6 flex flex-wrap gap-2">
                <TrustPill>Sin instalar nada</TrustPill>
                <TrustPill>Google login</TrustPill>
                <TrustPill>Historial de versiones</TrustPill>
                <TrustPill>Reutiliza tu estilo</TrustPill>
              </div>

              {/* Micro proof */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="lift hero-fade d5">
                  <MiniKpi title="Mejor primera impresión" desc="Texto pulido y claro" />
                </div>
                <div className="lift hero-fade d5" style={{ animationDelay: ".38s" }}>
                  <MiniKpi title="Ahorra tiempo mental" desc="No empieces desde cero" />
                </div>
                <div className="lift hero-fade d5" style={{ animationDelay: ".44s" }}>
                  <MiniKpi title="Consistencia" desc="Mantén tono y estructura" />
                </div>
              </div>
            </div>

            {/* Right: Demo card */}
            <div className="relative hero-fade d3">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 lift">
                <div className="flex items-center justify-between">
                  <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
                    Mejorar texto
                  </span>
                  <span className="text-xs text-white/50">Listo para copiar y enviar</span>
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                  Demo rápido: texto torpe → texto profesional
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  De “se entiende, pero no se ve bien” a “listo para enviar”.
                </p>

                <div className="mt-5 grid gap-3">
                  <DemoBlock
                    label="Antes"
                    text="Hola, te escribo para saber si ya quedó lo mío porque no me han contestado y lo necesito para hoy. Me pueden ayudar por favor?"
                  />
                  <DemoBlock
                    label="Después (versión profesional)"
                    text={`Hola, buen día.

Quisiera dar seguimiento al tema que comentamos, ya que aún no he recibido confirmación.
¿Me podrían indicar el estatus y el siguiente paso para resolverlo hoy?

Gracias.`}
                  />
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/login"
                    className="lift inline-flex justify-center rounded-2xl bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-white/90 transition"
                  >
                    Probar con mi texto
                  </Link>
                  <a
                    href="#pricing"
                    className="lift inline-flex justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/85 hover:bg-white/10 transition"
                  >
                    Ver planes
                  </a>
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

      {/* DEMO */}
      <section id="demo" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div data-reveal className="">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Casos reales: lo que escribes cada semana
                </h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Pega un texto normal y recibe una versión clara, profesional y consistente.
                </p>
              </div>
              <Link
                href="/login"
                className="lift rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Mejorar mi texto
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lift">
                <CaseCard
                  title="Mensajes"
                  before="Hola, te escribo porque sigo esperando respuesta y lo necesito hoy. Me ayudas porfa?"
                  after={`Hola, buen día.

Quisiera dar seguimiento al tema pendiente, ya que aún no he recibido respuesta.
¿Me podrían confirmar el estatus y el siguiente paso para resolverlo hoy?

Gracias.`}
                />
              </div>
              <div className="lift" style={{ transitionDelay: "60ms" }}>
                <CaseCard
                  title="Trabajo"
                  before="Redacta un correo para pedir seguimiento."
                  after={`Subject: Seguimiento — [Tema / Caso]

Hola [Nombre], buen día.

Solo para dar seguimiento a [tema]. ¿Me podrías confirmar el estatus y el siguiente paso?
Si te sirve, puedo [propuesta breve].

Gracias,
[Tu nombre]`}
                />
              </div>
              <div className="lift" style={{ transitionDelay: "120ms" }}>
                <CaseCard
                  title="Contenido"
                  before="Hazme un post para LinkedIn sobre mi servicio. Que se vea profesional y que venda."
                  after={`Escribe un post corto y profesional para LinkedIn sobre {SERVICIO}.

Incluye:
1) Hook (1 línea) con beneficio claro para {AUDIENCIA}
2) 3 bullets con valor práctico (sin jerga)
3) 1 prueba social o ejemplo breve (opcional)
4) 1 CTA simple (comentar / DM / link)

Restricciones: 120–160 palabras, 1 idea central, tono humano y directo.`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div data-reveal className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Así de simple funciona</h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  No es un curso. Es un botón para dejar tu texto listo.
                </p>
              </div>
              <Link
                href="/login"
                className="lift rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition text-center"
              >
                Mejorar texto ahora
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="lift">
                <StepCard title="1) Pega tu texto" desc="Tal cual lo escribiste. Sin pena." />
              </div>
              <div className="lift" style={{ transitionDelay: "60ms" }}>
                <StepCard title="2) Mejorar texto" desc="Lo convierte en una versión profesional." />
              </div>
              <div className="lift" style={{ transitionDelay: "120ms" }}>
                <StepCard title="3) Copia y guarda" desc="Reutilízalo y mantén consistencia." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PACKS (kept for structure, reframed as examples) */}
      <section id="packs" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div data-reveal>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Plantillas y ejemplos (opcional)</h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Si quieres, usa ejemplos listos por objetivo. Pero lo principal es mejorar tu texto.
                </p>
              </div>
              <Link
                href="/login"
                className="lift rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Ver ejemplos en dashboard
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="lift">
                <PackCardV2
                  title="Respuestas y emails"
                  price="Gratis + premium"
                  bullets={[
                    "Seguimientos cortos con contexto",
                    "Tono profesional y claro",
                    "Estructuras reutilizables",
                  ]}
                  badge="Mixto"
                />
              </div>
              <div className="lift" style={{ transitionDelay: "60ms" }}>
                <PackCardV2
                  title="Ventas y WhatsApp"
                  price="Desde $50 MXN"
                  bullets={[
                    "Mensajes con CTA claro",
                    "Objeciones + pruebas",
                    "Tono humano (no robot)",
                  ]}
                  badge="Premium"
                />
              </div>
              <div className="lift" style={{ transitionDelay: "120ms" }}>
                <PackCardV2
                  title="Contenido semanal"
                  price="Desde $50 MXN"
                  bullets={[
                    "Ideas → borrador → versión final",
                    "Variantes por plataforma",
                    "Plantillas reutilizables",
                  ]}
                  badge="Premium"
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70 lift">
              <p className="text-xs text-white/50 mb-1">Regla simple</p>
              Ejemplos te dan dirección. “Mejorar texto” te da calidad.
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div data-reveal className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Planes</h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Empieza gratis. Si lo usas cada semana, Pro se paga solo con el tiempo que te ahorra.
                </p>
              </div>
              <Link
                href="/login"
                className="lift rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition text-center"
              >
                Empezar gratis
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="lift">
                <PriceCard
                  name="Free"
                  price="$0"
                  tagline="Para probar el flujo"
                  items={[
                    "Mejora de texto básica diaria",
                    "Acceso a ejemplos gratuitos",
                    "Guardar versiones (base)",
                  ]}
                  cta="Probar gratis"
                />
              </div>
              <div className="lift" style={{ transitionDelay: "60ms" }}>
                <PriceCard
                  name="Pro"
                  price="$99 MXN/mes"
                  highlight
                  tagline="Si escribes cada semana"
                  items={[
                    "Mejora avanzada (más consistente)",
                    "Mejor salida para trabajo real",
                    "Prioridad para features nuevas",
                  ]}
                  cta="Ir a Pro"
                />
              </div>
              <div className="lift" style={{ transitionDelay: "120ms" }}>
                <PriceCard
                  name="Ejemplos"
                  price="Desde $50 MXN"
                  tagline="Compra puntual (sin suscripción)"
                  items={[
                    "Plantillas listas por objetivo",
                    "Reutilizables",
                    "No expiran",
                  ]}
                  cta="Ver ejemplos"
                />
              </div>
            </div>

            <p className="mt-4 text-xs text-white/50">
              Nota: Promptory no reemplaza tu IA. La vuelve más útil porque tu texto entra mejor y sale listo.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div data-reveal>
            <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
            <p className="mt-2 text-white/70 max-w-2xl">Respuestas cortas. Sin rollo.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {faq.map((item) => (
                <div
                  key={item.q}
                  className="lift rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                  <p className="font-medium">{item.q}</p>
                  <p className="mt-2 text-sm text-white/70">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="lift inline-flex justify-center rounded-2xl bg-white text-black px-6 py-3 font-semibold hover:bg-white/90 transition"
              >
                Mejorar texto gratis
              </Link>
              <a
                href="#pricing"
                className="lift inline-flex justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition"
              >
                Ver planes
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpeg" alt="Promptory AI" width={70} height={70} priority />
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
                Privacidad
              </Link>
              <a className="hover:text-white transition" href="mailto:agsolutions96@gmail.com">
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="lift rounded-2xl border border-white/10 bg-black/70 backdrop-blur px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="text-sm text-white/80">
              Mejora 1 texto y envíalo con confianza.
              <span className="ml-2 text-white/60 text-xs hidden sm:inline">
                Menos vueltas, mejor primera impresión.
              </span>
            </div>
            <div className="flex gap-2">
              <a
                href="#demo"
                className="lift inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Ver antes vs después
              </a>
              <Link
                href="/login"
                className="lift inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                Mejorar gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- UI bits ---------- */

function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function MiniKpi({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-white/60">{desc}</p>
    </div>
  );
}

function DemoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs text-white/50 mb-2">{label}</p>
      <pre className="whitespace-pre-wrap text-sm text-white/75 leading-relaxed">
        {text}
      </pre>
    </div>
  );
}

function StepCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </div>
  );
}

function CaseCard({
  title,
  before,
  after,
}: {
  title: string;
  before: string;
  after: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs text-white/50">Caso</p>
      <p className="mt-1 text-base font-semibold">{title}</p>

      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs text-white/50 mb-2">Antes</p>
          <p className="text-sm text-white/75">{before}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs text-white/50 mb-2">Después</p>
          <pre className="whitespace-pre-wrap text-sm text-white/75 leading-relaxed">
            {after}
          </pre>
        </div>
      </div>
    </div>
  );
}

function PackCardV2({
  title,
  price,
  bullets,
  badge,
}: {
  title: string;
  price: string;
  bullets: string[];
  badge: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold">{title}</p>
          <p className="mt-1 text-sm text-white/70">{price}</p>
        </div>
        <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
          {badge}
        </span>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/login"
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
      >
        Ver ejemplos
      </Link>
    </div>
  );
}

function PriceCard({
  name,
  price,
  tagline,
  items,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  tagline: string;
  items: string[];
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border bg-black/40 p-6 transition",
        highlight ? "border-white/25 bg-white/7" : "border-white/10",
      ].join(" ")}
    >
      <p className="text-xs text-white/50">{name}</p>
      <p className="mt-2 text-xl font-semibold">{price}</p>
      <p className="mt-1 text-sm text-white/70">{tagline}</p>

      <ul className="mt-5 space-y-2 text-sm text-white/75">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" />
            <span>{it}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/login"
        className={[
          "mt-6 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition",
          highlight
            ? "bg-white text-black hover:bg-white/90"
            : "border border-white/15 bg-white/5 text-white/85 hover:bg-white/10",
        ].join(" ")}
      >
        {cta}
      </Link>
    </div>
  );
}

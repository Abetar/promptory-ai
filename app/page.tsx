import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

export default function LandingPage() {
  // Ajusta si cambias dominio
  const siteUrl = "https://promptory-ai.vercel.app";

  const faq = [
    {
      q: "¿Promptory AI es un repositorio o una herramienta?",
      a: "Ambos. Tienes un repositorio de prompts curados, packs (gratis y premium) y herramientas como Prompt Optimizer dentro del dashboard.",
    },
    {
      q: "¿Necesito crear cuenta para ver prompts y packs?",
      a: "Sí. Al iniciar sesión entras al dashboard, donde puedes explorar prompts, ver packs, guardar favoritos, revisar compras y usar las tools.",
    },
    {
      q: "¿Cuánto cuestan los packs premium?",
      a: "En fase early, los packs premium cuestan $50 MXN. El pago se realiza mediante una liga de MercadoPago.",
    },
    {
      q: "¿Qué hace el Prompt Optimizer?",
      a: "Tomas tu prompt tal cual y lo transforma en una versión más clara y accionable: objetivo, variables, restricciones y formato para respuestas más consistentes.",
    },
    {
      q: "¿Qué es Optimizer Ultimate / Unlimited?",
      a: "Es una tool separada dentro del dashboard para usuarios Pro Unlimited. Incluye age-gate y uso controlado diario. Solo entrega prompts optimizados.",
    },
    {
      q: "¿Puedo guardar prompts y acceder rápido después?",
      a: "Sí. Dentro del dashboard puedes guardar prompts y consultar tu sección de favoritos/guardados.",
    },
  ];

  // SEO (sin inventar datos, pero alineado a tu producto)
  const jsonLdSoftwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Promptory AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Repositorio de prompts curados, packs gratis/premium y herramientas como Prompt Optimizer para mejorar prompts en segundos.",
    offers: [{ "@type": "Offer", name: "Acceso", price: "0", priceCurrency: "MXN" }],
  };

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Packs de Prompts Premium (Early)",
    description:
      "Colecciones curadas de prompts listos para usar. En fase early, packs premium a $50 MXN mediante MercadoPago.",
    offers: {
      "@type": "Offer",
      price: "50",
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/login`,
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
        id="ld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
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
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Ir al inicio">
            <Image src="/logo.png" alt="Promptory AI" width={36} height={36} priority />
            <span className="font-semibold tracking-tight text-lg">Promptory AI</span>
            <span className="ml-2 hidden sm:inline-flex text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
              early access
            </span>
          </Link>

          <nav className="flex items-center gap-3" aria-label="Navegación principal">
            <a
              href="#producto"
              className="hidden md:inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Qué incluye
            </a>
            <a
              href="#packs"
              className="hidden md:inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Packs
            </a>
            <a
              href="#tools"
              className="hidden md:inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Tools
            </a>
            <a
              href="#faq"
              className="hidden md:inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              FAQ
            </a>

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
              Entrar al Dashboard
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
                Repositorio de prompts + Packs + Tools (Optimizer / Ultimate)
              </p>

              <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                De “prompts vagos” a{" "}
                <span className="text-white/70">instrucciones claras y repetibles</span>.
              </h1>

              <p className="mt-4 text-white/70 max-w-xl">
                Promptory AI vive en un dashboard: exploras prompts curados (free/premium), compras packs early
                y usas tools como <span className="text-white/90 font-medium">Prompt Optimizer</span> para lograr
                resultados más consistentes sin estar probando y fallando.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
                >
                  Entrar y explorar Prompts
                </Link>
                <a
                  href="#tools"
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition text-center"
                >
                  Ver demo del Optimizer
                </a>
              </div>

              {/* Trust cues (sin inventar números) */}
              <div className="mt-6 flex flex-wrap gap-2">
                <TrustPill>Sin instalar nada</TrustPill>
                <TrustPill>Google login</TrustPill>
                <TrustPill>Dashboard-first</TrustPill>
                <TrustPill>Early: packs premium $50 MXN</TrustPill>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat title="Prompts curados" desc="Por caso de uso" />
                <MiniStat title="Packs" desc="Gratis y premium" />
                <MiniStat title="Optimizer" desc="Antes / Después" />
              </div>

              <p className="mt-6 text-xs text-white/50">
                Nota: Promptory no genera “contenido final” dentro de la app — entrega prompts listos para ejecutar.
              </p>
            </div>

            {/* Right card mock (Dashboard flow) */}
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/70">
                    Dentro del Dashboard
                  </span>
                  <span className="text-xs text-white/50">Promptory AI</span>
                </div>

                <h3 className="mt-4 text-lg font-semibold">Un solo lugar para prompts, packs y tools</h3>
                <p className="mt-2 text-sm text-white/70">
                  Explora prompts (free/premium), guarda favoritos, revisa compras y abre tools como Optimizer.
                </p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs text-white/50 mb-2">Secciones</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                      <Pill>Explorar prompts</Pill>
                      <Pill>Mis prompts</Pill>
                      <Pill>Packs</Pill>
                      <Pill>Compras</Pill>
                      <Pill>Requests</Pill>
                      <Pill>Tools</Pill>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                    <p className="text-xs text-white/50 mb-2">Tools</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span>Prompt Optimizer</span>
                        <span className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-white/70">
                          Pro
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Optimizer Ultimate</span>
                        <span className="text-xs rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-fuchsia-200">
                          Unlimited / NSFW
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-white/50">Login → Dashboard</span>
                  <Link
                    href="/login"
                    className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
                  >
                    Entrar
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

      {/* PRODUCT */}
      <section id="producto" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Qué incluye Promptory AI</h2>
              <p className="mt-2 text-white/70 max-w-2xl">
                No es “una lista de textos”. Es un sistema: descubres prompts, usas colecciones y optimizas para lograr consistencia.
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Entrar al dashboard
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Repositorio curado"
              desc="Explora prompts por tipo, herramienta y si son free/premium."
              cta="Explorar prompts"
            />
            <FeatureCard
              title="Packs listos"
              desc="Colecciones para ejecutar rápido. Early: premium a $50 MXN."
              cta="Ver packs"
            />
            <FeatureCard
              title="Tools (Optimizer)"
              desc="Convierte prompts vagos en instrucciones claras con variables, restricciones y formato."
              cta="Abrir Optimizer"
            />
          </div>

          {/* Personas (marketing: quién lo usa) */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <PersonaCard
              title="Creadores y marketers"
              bullets={[
                "Hooks + CTAs consistentes",
                "Variantes rápidas por tono",
                "Menos iteraciones fallidas",
              ]}
            />
            <PersonaCard
              title="Devs y builders"
              bullets={[
                "Prompts más técnicos y reproducibles",
                "Formato de salida controlado",
                "Plantillas para debugging / specs",
              ]}
            />
            <PersonaCard
              title="Operación y soporte"
              bullets={[
                "Respuestas claras para tickets",
                "Plantillas por caso de uso",
                "Menos tiempo redactando",
              ]}
            />
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section id="flujo" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
          <p className="mt-2 text-white/70 max-w-2xl">Entras una vez y todo está en el dashboard.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard step="1" title="Inicia sesión" desc="Accede al dashboard y a todas las secciones." />
            <StepCard
              step="2"
              title="Explora o compra packs"
              desc="Encuentra prompts por tipo o compra un pack premium (early $50 MXN)."
            />
            <StepCard
              step="3"
              title="Optimiza y guarda"
              desc="Mejora prompts con Optimizer y guarda favoritos para acceso rápido."
            />
          </div>
        </div>
      </section>

      {/* PACKS */}
      <section id="packs" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Packs de prompts</h2>
                <p className="mt-2 text-white/70 max-w-2xl">
                  Colecciones curadas listas para usar. En fase early, los packs premium cuestan{" "}
                  <span className="text-white/90 font-medium">$50 MXN</span> y se pagan con liga de MercadoPago.
                </p>
              </div>

              <Link
                href="/login"
                className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition text-center"
              >
                Ver packs en Dashboard
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <PackCard title="Packs Gratis" desc="Para probar el estilo y la calidad del contenido." tag="free" />
              <PackCard
                title="Packs Premium"
                desc="Colecciones completas listas para ejecutar en tu trabajo."
                tag="premium"
              />
              <PackCard title="Mis compras" desc="Revisa estado e historial de tus packs comprados." tag="dashboard" />
            </div>

            {/* Mini garantía / reducción de riesgo */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              <p className="text-xs text-white/50 mb-1">Sin letras chiquitas</p>
              Compras un pack y lo ves en tu dashboard. No necesitas instalaciones ni pasos raros.
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS (Optimizer demo) */}
      <section id="tools" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Tools</h2>
              <p className="mt-2 text-white/70 max-w-2xl">
                La idea es simple: menos “adivinar”, más estructura. Optimizer convierte prompts vagos en instrucciones claras.
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Abrir tools en Dashboard
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimizer before/after */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/60">Ejemplo rápido</p>
              <h3 className="mt-2 text-lg font-semibold">Antes / Después con Prompt Optimizer</h3>
              <p className="mt-2 text-sm text-white/70">
                Output estructurado: objetivo, variables, restricciones y formato de salida.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>Objetivo</Chip>
                <Chip>Variables</Chip>
                <Chip>Restricciones</Chip>
                <Chip>Formato</Chip>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                  <p className="text-xs text-white/50 mb-2">Antes</p>
                  Hazme un post para Instagram sobre mi servicio.
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                  <p className="text-xs text-white/50 mb-2">Después</p>
                  Actúa como copywriter. Crea 5 variantes para un post sobre {"{SERVICIO}"} para {"{AUDIENCIA}"}.
                  Incluye: hook, beneficios, objeción y CTA. Tono: {"{TONO}"}. Formato: lista numerada.
                </div>
              </div>

              <div className="mt-5">
                <Link
                  href="/login"
                  className="inline-flex rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition"
                >
                  Probar Optimizer (Dashboard)
                </Link>
              </div>
            </div>

            {/* Ultimate + Generator */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/60">Tier avanzado</p>
              <h3 className="mt-2 text-lg font-semibold flex items-center gap-2">
                Optimizer Ultimate
                <span className="text-xs rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-fuchsia-200">
                  Pro Unlimited / NSFW
                </span>
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Tool separada dentro del dashboard para usuarios Pro Unlimited. Incluye age-gate y uso controlado diario.
                Solo devuelve prompts optimizados.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                  <p className="text-xs text-white/50 mb-2">Incluye</p>
                  <ul className="list-disc pl-5 space-y-1 text-white/70">
                    <li>Optimizer Unlimited (separado del Optimizer normal)</li>
                    <li>Auditoría / métricas para runs</li>
                    <li>Control de uso diario</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/75">
                  <p className="text-xs text-white/50 mb-2">Próximamente</p>
                  Prompt Generator: prompts desde cero por objetivo, industria y formato.
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/login"
                  className="inline-flex rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition"
                >
                  Entrar al Dashboard
                </Link>
                <Link
                  href="/login"
                  className="inline-flex rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-6 py-3 text-fuchsia-200 hover:bg-fuchsia-500/15 transition"
                >
                  Ver Pro Unlimited
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">Preguntas frecuentes</h2>
          <p className="mt-2 text-white/70 max-w-2xl">Respuestas rápidas para decidir sin fricción.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {faq.map((item) => (
              <div key={item.q} className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
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
              Entrar al Dashboard
            </Link>
            <a
              href="#tools"
              className="inline-flex justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition"
            >
              Ver demo del Optimizer
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

      {/* Sticky CTA (simple y sin JS extra) */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-black/70 backdrop-blur px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-white/80">
              Explora prompts, packs y tools dentro del dashboard.
              <span className="ml-2 text-white/60 text-xs">Early packs premium: $50 MXN</span>
            </div>
            <div className="flex gap-2">
              <a
                href="#tools"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Ver demo
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                Entrar al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function MiniStat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
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

function FeatureCard({ title, desc, cta }: { title: string; desc: string; cta: string }) {
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
  const badge = tag === "free" ? "Gratis" : tag === "premium" ? "Premium" : "Dashboard";

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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
      {children}
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

function PersonaCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <p className="text-base font-semibold">{title}</p>
      <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-white/70">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

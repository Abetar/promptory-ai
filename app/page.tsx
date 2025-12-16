import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Promptory AI"
            width={36}
            height={36}
          />
          <span className="font-semibold text-lg">Promptory AI</span>
        </div>

        <Link
          href="/login"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white hover:text-black transition"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6 mt-24">
        <h1 className="text-4xl md:text-5xl font-bold max-w-3xl">
          La bóveda de prompts optimizados para Inteligencia Artificial
        </h1>

        <p className="mt-6 text-white/70 max-w-xl">
          Accede a prompts probados para generar mejores resultados en
          texto, imágenes y video con herramientas de IA.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition"
          >
            Empezar ahora
          </Link>

          <a
            href="#features"
            className="rounded-xl border border-white/20 px-6 py-3 hover:bg-white/10 transition"
          >
            Ver cómo funciona
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mt-32 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        <Feature
          title="Prompts curados"
          description="Nada de prompts genéricos. Solo prompts probados y optimizados para resultados reales."
        />
        <Feature
          title="Para múltiples IA"
          description="Texto, imágenes y video. Compatible con las principales herramientas de IA."
        />
        <Feature
          title="Gratis y premium"
          description="Empieza gratis y desbloquea prompts premium cuando los necesites."
        />
      </section>

      {/* CTA FINAL */}
      <section className="mt-32 px-6 pb-24 text-center">
        <h2 className="text-3xl font-semibold">
          Empieza a obtener mejores resultados hoy
        </h2>
        <p className="mt-4 text-white/70">
          Inicia sesión y accede a la colección completa de Promptory AI.
        </p>

        <Link
          href="/login"
          className="inline-block mt-8 rounded-xl bg-white text-black px-8 py-4 font-medium hover:bg-white/90 transition"
        >
          Iniciar sesión con Google
        </Link>
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </div>
  );
}

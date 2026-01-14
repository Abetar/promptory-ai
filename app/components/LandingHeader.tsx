"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingHeader() {
  const closeAllDetails = () => {
    document
      .querySelectorAll("details[data-nav]")
      .forEach((d) => d.removeAttribute("open"));
  };

  return (
    <header className="relative z-50 isolate">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Ir al inicio"
        >
          <div className="flex items-center gap-4">
            <Image
              src="/logo.jpeg"
              alt="Promptory AI"
              width={100}
              height={100}
              priority
            />
            <span className="font-semibold tracking-tight text-xl leading-none">
              Promptory AI
            </span>
          </div>{" "}
        </Link>

        <nav
          className="flex items-center gap-2"
          aria-label="Navegación principal"
        >
          {/* Links principales */}
          <a
            href="#optimizer"
            className="hidden lg:inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Prompt Optimizer
          </a>

          <a
            href="#packs"
            className="hidden lg:inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Workflows
          </a>

          {/* Dropdown "Más" */}
          <details data-nav className="hidden lg:block relative">
            <summary
              className="list-none cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <span className="inline-flex items-center gap-2">
                Más <span className="text-white/50">▾</span>
              </span>
            </summary>

            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-black/90 backdrop-blur p-2 shadow-lg z-50">
              <a
                href="#pricing"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Planes
              </a>
              <a
                href="#repositorio"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Ejemplos
              </a>
              <a
                href="#faq"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                FAQ
              </a>
            </div>
          </details>

          {/* Mobile Menu */}
          <details data-nav className="lg:hidden relative">
            <summary
              className="list-none cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <span className="inline-flex items-center gap-2">
                Menú <span className="text-white/50">▾</span>
              </span>
            </summary>

            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-black/90 backdrop-blur p-2 shadow-lg z-50">
              <a
                href="#optimizer"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Prompt Optimizer
              </a>
              <a
                href="#packs"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Workflows
              </a>
              <a
                href="#pricing"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Planes
              </a>
              <a
                href="#repositorio"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Ejemplos
              </a>
              <a
                href="#faq"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                FAQ
              </a>

              <div className="my-2 h-px bg-white/10" />

              <Link
                href="/login"
                onClick={closeAllDetails}
                className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                Iniciar sesión
              </Link>
            </div>
          </details>

          {/* Auth discreto */}
          <Link
            href="/login"
            className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm text-white/70 hover:text-white transition"
          >
            Iniciar sesión
          </Link>

          {/* CTA principal */}
          <Link
            href="/login"
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
          >
            Optimiza tu primer prompt
          </Link>
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </header>
  );
}

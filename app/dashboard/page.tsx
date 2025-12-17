import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const name =
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "usuario";

  return (
    <div className="space-y-8">
      {/* Header simple (sin navbar interno) */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-400">
          Bienvenido, <span className="text-neutral-200">{name}</span>.
        </p>
      </div>

      {/* Acciones principales */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/prompts"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Explorar prompts
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Encuentra prompts por tipo, AI y free/premium.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Ir a Prompts →
          </div>
        </Link>

        {/* ✅ Mis prompts ahora es link */}
        <Link
          href="/dashboard/mis-prompts"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Mis prompts</div>
          <p className="mt-2 text-sm text-neutral-400">
            Favoritos y prompts guardados para acceso rápido.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition">
            Ver guardados →
          </div>
        </Link>
      </section>

      {/* Sección de estado / roadmap */}
      {/* <section className="rounded-2xl border border-neutral-800 bg-neutral-900/20 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-100">
              Estado del MVP
            </div>
            <p className="mt-1 text-sm text-neutral-400">
              Prompts reales desde DB + gating free/premium + AI targets listos.
            </p>
          </div>

          <Link
            href="/dashboard/prompts"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
          >
            Ver catálogo
          </Link>
        </div>
      </section> */}
    </div>
  );
}

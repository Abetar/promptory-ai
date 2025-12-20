import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export const runtime = "nodejs";

function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allow.includes(email.trim().toLowerCase());
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const name =
    session?.user?.name?.split(" ")[0] ||
    session?.user?.email?.split("@")[0] ||
    "usuario";

  const isAdmin = isAdminEmail(session?.user?.email);

  return (
    <div className="space-y-8">
      {/* Header simple */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-400">
            Bienvenido, <span className="text-neutral-200">{name}</span>.
          </p>
        </div>

        {/* ✅ Botón Admin solo visible para admins */}
        {isAdmin ? (
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
          >
            Admin →
          </Link>
        ) : null}
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

        <Link
          href="/dashboard/packs"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">
            Packs de prompts
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Colecciones curadas de prompts listas para usar.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Ver Packs →
          </div>
        </Link>
      </section>
    </div>
  );
}

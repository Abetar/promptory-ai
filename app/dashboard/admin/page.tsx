import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Gestiona prompts, publicación, precios y AIs objetivo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/admin/prompts"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Prompts</div>
          <p className="mt-2 text-sm text-neutral-400">
            Crear, editar, publicar y asignar AIs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/ai-tools"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">AIs</div>
          <p className="mt-2 text-sm text-neutral-400">
            Crear, editar, publicar y asignar AIs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        {/* ✅ NUEVO: Packs */}
        <Link
          href="/dashboard/admin/packs"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Packs</div>
          <p className="mt-2 text-sm text-neutral-400">
            Crear, editar, publicar y asignar prompts a packs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/requests"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Requests</div>
          <p className="mt-2 text-sm text-neutral-400">
            Revisa solicitudes de nuevos prompts enviadas por usuarios.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/access"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Accesos</div>
          <p className="mt-2 text-sm text-neutral-400">
            Otorgar acceso a prompts premium por usuario.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>

        <Link
          href="/dashboard/admin/users"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Usuarios</div>
          <p className="mt-2 text-sm text-neutral-400">
            Ver quién ya tiene cuenta en Promptory AI.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Entrar →
          </div>
        </Link>
        
        <Link
          href="/dashboard/admin/purchases"
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:bg-neutral-900/70 transition"
        >
          <div className="text-sm font-semibold text-neutral-100">Compras</div>
          <p className="mt-2 text-sm text-neutral-400">
            Validar pagos y desbloquear packs.
          </p>
          <div className="mt-4 inline-flex rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950">
            Gestionar →
          </div>
        </Link>

        {/* <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="text-sm font-semibold text-neutral-100">AIs</div>
          <p className="mt-2 text-sm text-neutral-400">
            En el siguiente paso hacemos CRUD de AiTools desde UI.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300 opacity-70">
            Próximamente
          </div>
        </div> */}
      </div>
    </div>
  );
}

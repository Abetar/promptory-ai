import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SupportForm from "./SupportForm";

export const runtime = "nodejs";

export default async function SoportePage() {
  const session = await getServerSession(authOptions);

  const userEmail = session?.user?.email || "";
  const userName =
    session?.user?.name?.trim() || (userEmail ? userEmail.split("@")[0] : "usuario");

  const SUPPORT_EMAIL = "agsolutions96@gmail.com";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Soporte</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Cuéntanos qué pasó y te ayudamos. Normalmente respondemos lo antes posible.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-3">
        <div className="text-sm font-semibold text-neutral-100">Info rápida</div>
        <p className="text-sm text-neutral-400">
          Usuario: <span className="text-neutral-200">{userName}</span>
          {userEmail ? (
            <>
              {" "}
              · Email: <span className="text-neutral-200">{userEmail}</span>
            </>
          ) : null}
        </p>
        <p className="text-xs text-neutral-500">
          Tip: incluye pasos para reproducir el problema y, si puedes, una captura.
        </p>
      </div>

      {/* ✅ Interacción va en Client Component */}
      <SupportForm
        supportEmail={SUPPORT_EMAIL}
        userName={userName}
        userEmail={userEmail}
      />

      <p className="text-xs text-neutral-500">
        Nota: si quieres sugerir un prompt nuevo, usa{" "}
        <Link className="underline hover:text-neutral-300" href="/dashboard/solicitar-prompt">
          Solicitar prompt
        </Link>
        .
      </p>
    </div>
  );
}

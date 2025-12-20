// app/dashboard/soporte/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export default async function SoportePage() {
  const session = await getServerSession(authOptions);

  const email = session?.user?.email || "";
  const name =
    session?.user?.name?.trim() ||
    (email ? email.split("@")[0] : "usuario");

  // ✅ Cambia esto si quieres mandar a otro correo
  const SUPPORT_EMAIL = "agsolutions96@gmail.com";

  // mailto base (sin subject/body para no romper encoding; lo armamos en client)
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
        <div className="text-sm font-semibold text-neutral-100">
          Info rápida
        </div>
        <p className="text-sm text-neutral-400">
          Usuario: <span className="text-neutral-200">{name}</span>
          {email ? (
            <>
              {" "}· Email: <span className="text-neutral-200">{email}</span>
            </>
          ) : null}
        </p>
        <p className="text-xs text-neutral-500">
          Tip: incluye pasos para reproducir el problema y, si puedes, una captura.
        </p>
      </div>

      {/* ✅ Form simple (client-less): arma mailto con querystring */}
      <form
        action={(formData: FormData) => {
          "use server";
          // Este form no “envía” a servidor. Solo existe para UI.
          // El envío real se hace con el botón mailto abajo (client).
        }}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4"
      >
        <div>
          <label className="text-sm text-neutral-300">Tema</label>
          <input
            id="subject"
            name="subject"
            required
            placeholder="Ej. No puedo ver un pack / Error al guardar prompt"
            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-300">Mensaje</label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Describe el problema, qué esperabas que pasara y qué ocurrió…"
            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
          />
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-sm font-semibold text-neutral-100">¿Cómo se envía?</div>
          <p className="mt-1 text-sm text-neutral-400">
            Por ahora el soporte se envía por correo (se abre tu cliente de email).
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Destino: {SUPPORT_EMAIL}
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            onClick={(e) => {
              // armamos subject/body leyendo del DOM (sin hacer esta página client)
              const subjectEl = document.getElementById("subject") as HTMLInputElement | null;
              const messageEl = document.getElementById("message") as HTMLTextAreaElement | null;

              const subject = subjectEl?.value?.trim() || "Soporte Promptory AI";
              const message = messageEl?.value?.trim() || "";

              const meta = [
                `Usuario: ${name}`,
                email ? `Email: ${email}` : "",
                `Página: /dashboard/soporte`,
                "",
                "Mensaje:",
                message,
              ]
                .filter(Boolean)
                .join("\n");

              const qs = new URLSearchParams({
                subject: `[Promptory AI] ${subject}`,
                body: meta,
              }).toString();

              (e.currentTarget as HTMLAnchorElement).href = `mailto:${SUPPORT_EMAIL}?${qs}`;
            }}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
          >
            Enviar por correo →
          </a>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>

      <p className="text-xs text-neutral-500">
        Nota: este canal es para dudas y problemas del producto. Si quieres sugerir un prompt nuevo,
        usa <Link className="underline hover:text-neutral-300" href="/dashboard/solicitar-prompt">Solicitar prompt</Link>.
      </p>
    </div>
  );
}

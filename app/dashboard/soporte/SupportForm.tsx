"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  supportEmail: string;
  userName: string;
  userEmail: string;
};

export default function SupportForm({ supportEmail, userName, userEmail }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const safeSubject = subject.trim() || "Soporte Promptory AI";
    const safeMessage = message.trim() || "";

    const body = [
      `Usuario: ${userName}`,
      userEmail ? `Email: ${userEmail}` : "",
      "",
      "Mensaje:",
      safeMessage,
    ]
      .filter(Boolean)
      .join("\n");

    const qs = new URLSearchParams({
      subject: `[Promptory AI] ${safeSubject}`,
      body,
    }).toString();

    return `mailto:${supportEmail}?${qs}`;
  }, [supportEmail, subject, message, userName, userEmail]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
      <div>
        <label className="text-sm text-neutral-300">Tema</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ej. No puedo ver un pack / Error al guardar prompt"
          className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
        />
      </div>

      <div>
        <label className="text-sm text-neutral-300">Mensaje</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
        <p className="mt-2 text-xs text-neutral-500">Destino: {supportEmail}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={mailtoHref}
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
    </div>
  );
}

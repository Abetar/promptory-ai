"use client";

import { signIn, signOut } from "next-auth/react";

export default function AuthButton({ isAuthed }: { isAuthed: boolean }) {
  return isAuthed ? (
    <button
      onClick={() => signOut()}
      className="rounded-xl border px-4 py-2"
    >
      Cerrar sesión
    </button>
  ) : (
    <button
      onClick={() => signIn("google")}
      className="rounded-xl border px-4 py-2"
    >
      Iniciar sesión con Google
    </button>
  );
}

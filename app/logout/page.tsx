"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-white/70">Cerrando sesión...</p>
    </main>
  );
}

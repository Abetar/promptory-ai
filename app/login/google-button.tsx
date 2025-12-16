"use client";

import { signIn } from "next-auth/react";

export default function GoogleButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="
        w-full
        flex items-center justify-center gap-3
        rounded-xl
        border border-white/20
        bg-white text-black
        py-3
        font-medium
        transition
        hover:bg-white/90
        active:scale-[0.98]
      "
    >
      {/* Google icon */}
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.02 1.53 7.4 2.8l5.4-5.4C33.64 3.9 29.2 2 24 2 14.7 2 6.9 7.96 3.68 15.4l6.6 5.1C12.1 14.6 17.6 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24c0-1.6-.14-2.7-.44-3.9H24v7.4h12.7c-.26 2.1-1.7 5.3-4.9 7.4l7.5 5.8C43.6 36.6 46.5 30.9 46.5 24z"/>
        <path fill="#FBBC05" d="M10.28 28.5c-.44-1.3-.7-2.7-.7-4.5s.26-3.2.68-4.5l-6.6-5.1C1.7 18.3 1 21.1 1 24s.7 5.7 2.66 9.6l6.62-5.1z"/>
        <path fill="#34A853" d="M24 46c5.2 0 9.64-1.7 12.86-4.6l-7.5-5.8c-2 1.4-4.7 2.3-8.36 2.3-6.4 0-11.9-5.1-13.7-12.1l-6.62 5.1C6.9 40 14.7 46 24 46z"/>
      </svg>

      Continuar con Google
    </button>
  );
}

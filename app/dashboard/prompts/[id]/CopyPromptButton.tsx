"use client";

import { useState } from "react";

export default function CopyPromptButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);

  return (
    <button
      type="button"
      className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1200);
      }}
    >
      {ok ? "Copiado ✅" : "Copiar"}
    </button>
  );
}

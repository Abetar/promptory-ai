"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/client-events";

type CopyPromptButtonProps = {
  text: string;

  // 🔎 Opcional: para analytics
  promptId?: string;
  title?: string;
  source?: string; // ej: "dashboard/prompts", "prompt-detail"
};

export default function CopyPromptButton({
  text,
  promptId,
  title,
  source = "unknown",
}: CopyPromptButtonProps) {
  const [ok, setOk] = useState(false);

  return (
    <button
      type="button"
      className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
      onClick={async () => {
        await navigator.clipboard.writeText(text);

        // ✅ UX feedback
        setOk(true);
        setTimeout(() => setOk(false), 1200);

        // ✅ Audit event (no rompe UX si falla)
        trackEvent({
          event: "prompt.copy",
          entityType: "prompt",
          entityId: promptId,
          meta: {
            title,
            source,
            length: text.length,
          },
        });
      }}
    >
      {ok ? "Copiado ✅" : "Copiar"}
    </button>
  );
}

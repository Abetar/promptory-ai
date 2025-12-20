"use client";

import { useMemo, useState } from "react";
import CopyPromptButton from "./CopyPromptButton";
import { translatePromptToEnglishAction } from "./translate-actions";

type Props = {
  text: string;
};

export default function TranslateToEnglishCard({ text }: Props) {
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasTranslated = useMemo(() => Boolean(translated?.trim()), [translated]);

  async function handleTranslate() {
    setError(null);
    setLoading(true);
    try {
      const res = await translatePromptToEnglishAction(text);
      setTranslated(res);
    } catch (e) {
      setError("No se pudo generar la versión en inglés. Intenta otra vez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-neutral-100">
            Versión optimizada en inglés
          </h3>
          <p className="mt-1 text-sm text-neutral-400">
            En prompts técnicos, el inglés suele producir respuestas más consistentes.
            Esta traducción se genera al momento y no se guarda.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTranslate}
          disabled={loading}
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold transition",
            loading
              ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
              : "bg-neutral-100 text-neutral-950 hover:opacity-90",
          ].join(" ")}
        >
          {loading ? "Generando..." : "Generar"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {hasTranslated ? (
        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-neutral-200">English</div>
            <CopyPromptButton text={translated!} />
          </div>

          <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
            {translated}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { toggleSavePromptAction } from "./save-actions";

export default function SaveButton({
  promptId,
  saved,
  variant = "icon",
}: {
  promptId: string;
  saved: boolean;
  variant?: "icon" | "button";
}) {
  const [pending, startTransition] = useTransition();

  const base =
    "inline-flex items-center justify-center rounded-xl border transition";
  const icon =
    "h-9 w-9 border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900";
  const savedCls = saved ? "text-amber-200" : "text-neutral-300";

  return (
    <button
      type="button"
      aria-label={saved ? "Quitar de guardados" : "Guardar prompt"}
      title={saved ? "Guardado" : "Guardar"}
      onClick={(e) => {
        e.preventDefault(); // evita navegación si está cerca de Links
        startTransition(async () => {
          await toggleSavePromptAction(promptId);
        });
      }}
      className={[
        base,
        variant === "icon"
          ? icon
          : "border-neutral-800 bg-neutral-950 px-3 py-2 text-sm hover:bg-neutral-900",
        savedCls,
        pending ? "opacity-60 pointer-events-none" : "",
      ].join(" ")}
    >
      {/* Bookmark icon */}
      <svg
        viewBox="0 0 24 24"
        className={variant === "icon" ? "h-5 w-5" : "h-4 w-4"}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1z" />
      </svg>

      {variant === "button" ? (
        <span className="ml-2">{saved ? "Guardado" : "Guardar"}</span>
      ) : null}
    </button>
  );
}

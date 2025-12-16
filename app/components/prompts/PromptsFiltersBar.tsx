"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PromptType = "texto" | "imagen" | "video";
type PriceFilter = "all" | "free" | "premium";
type SortFilter = "new" | "price_asc" | "price_desc";

type AiTool = { slug: string; name: string };

function buildQuery(params: URLSearchParams, patch: Record<string, string | undefined>) {
  const next = new URLSearchParams(params);
  for (const [k, v] of Object.entries(patch)) {
    if (!v || v === "all") next.delete(k);
    else next.set(k, v);
  }
  return next;
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-900 transition"
      title="Quitar filtro"
    >
      <span>{label}</span>
      <span className="text-neutral-500">×</span>
    </button>
  );
}

export default function PromptsFiltersBar({ aiTools }: { aiTools: AiTool[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = useMemo(() => {
    const type = (sp.get("type") as PromptType | null) ?? null;
    const price = (sp.get("price") as PriceFilter | null) ?? "all";
    const ai = sp.get("ai") ?? null;
    const sort = (sp.get("sort") as SortFilter | null) ?? "new";
    const q = sp.get("q") ?? "";
    return { type, price, ai, sort, q };
  }, [sp]);

  const [qInput, setQInput] = useState(current.q);

  const push = (nextParams: URLSearchParams) => {
    startTransition(() => {
      const qs = nextParams.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; remove: () => void }[] = [];

    if (current.q) {
      chips.push({
        key: "q",
        label: `Búsqueda: "${current.q}"`,
        remove: () => push(buildQuery(sp, { q: undefined })),
      });
    }
    if (current.type) {
      chips.push({
        key: "type",
        label: `Tipo: ${current.type}`,
        remove: () => push(buildQuery(sp, { type: undefined })),
      });
    }
    if (current.price && current.price !== "all") {
      chips.push({
        key: "price",
        label: current.price === "free" ? "Gratis" : "Premium",
        remove: () => push(buildQuery(sp, { price: undefined })),
      });
    }
    if (current.ai) {
      const name = aiTools.find((t) => t.slug === current.ai)?.name ?? current.ai;
      chips.push({
        key: "ai",
        label: `AI: ${name}`,
        remove: () => push(buildQuery(sp, { ai: undefined })),
      });
    }
    if (current.sort && current.sort !== "new") {
      const label =
        current.sort === "price_asc" ? "Precio: menor a mayor" : "Precio: mayor a menor";
      chips.push({
        key: "sort",
        label,
        remove: () => push(buildQuery(sp, { sort: undefined })),
      });
    }

    return chips;
  }, [current, aiTools, sp]);

  const clearAll = () => {
    startTransition(() => router.push(pathname));
    setQInput("");
  };

  return (
    <div className="sticky top-[57px] z-40">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        {/* Top row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="flex-1">
            <label className="sr-only">Buscar</label>
            <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950 px-3 py-2">
              <span className="text-neutral-500 text-sm">⌕</span>
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Buscar por título o descripción…"
                className="w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
              />
              <button
                type="button"
                onClick={() => {
                  const next = buildQuery(sp, { q: qInput.trim() || undefined });
                  push(next);
                }}
                className="rounded-xl border border-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-900 transition"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={current.type ?? "all"}
              onChange={(e) =>
                push(buildQuery(sp, { type: e.target.value === "all" ? undefined : e.target.value }))
              }
              className="h-10 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
            >
              <option value="all">Tipo: Todos</option>
              <option value="texto">Texto</option>
              <option value="imagen">Imagen</option>
              <option value="video">Video</option>
            </select>

            <select
              value={current.price ?? "all"}
              onChange={(e) =>
                push(buildQuery(sp, { price: e.target.value === "all" ? undefined : e.target.value }))
              }
              className="h-10 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
            >
              <option value="all">Precio: Todos</option>
              <option value="free">Gratis</option>
              <option value="premium">Premium</option>
            </select>

            <select
              value={current.ai ?? "all"}
              onChange={(e) =>
                push(buildQuery(sp, { ai: e.target.value === "all" ? undefined : e.target.value }))
              }
              className="h-10 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
            >
              <option value="all">AI: Todas</option>
              {aiTools.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={current.sort ?? "new"}
              onChange={(e) =>
                push(buildQuery(sp, { sort: e.target.value === "new" ? undefined : e.target.value }))
              }
              className="h-10 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none"
            >
              <option value="new">Orden: Nuevos</option>
              <option value="price_asc">Precio: ↑</option>
              <option value="price_desc">Precio: ↓</option>
            </select>

            <button
              type="button"
              onClick={clearAll}
              className="h-10 rounded-xl border border-neutral-800 bg-neutral-950 px-4 text-sm text-neutral-200 hover:bg-neutral-900 transition"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Active chips */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {activeChips.length > 0 ? (
              activeChips.map((c) => <Chip key={c.key} label={c.label} onRemove={c.remove} />)
            ) : (
              <span className="text-xs text-neutral-500">
                Tip: filtra por AI + tipo para encontrar prompts más rápido.
              </span>
            )}
          </div>

          {isPending ? (
            <span className="text-xs text-neutral-500">Actualizando…</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

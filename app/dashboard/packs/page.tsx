// app/dashboard/packs/page.tsx
import Link from "next/link";
import { listPacks } from "@/lib/packs";

export const runtime = "nodejs";

type PriceFilter = "all" | "free" | "premium";
type SortFilter = "new" | "price_asc" | "price_desc";

export default async function PacksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const price = (sp.price as PriceFilter | undefined) || "all";
  const sort = (sp.sort as SortFilter | undefined) || "new";
  const q = sp.q || undefined;

  const packs = await listPacks({ price, sort, q });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Packs</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Colecciones curadas de prompts listas para usar.
          </p>
        </div>

        <div className="text-sm text-neutral-400">
          <span className="text-neutral-200 font-semibold">{packs.length}</span>{" "}
          resultados
        </div>
      </div>

      {/* Filters (simple, sin componentes nuevos por ahora) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
        <form className="grid gap-3 md:grid-cols-3" action="/dashboard/packs">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar packs..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-neutral-700"
          />

          <select
            name="price"
            defaultValue={price}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
          >
            <option value="all">Precio: Todos</option>
            <option value="free">Gratis</option>
            <option value="premium">Premium</option>
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-700"
          >
            <option value="new">Orden: Nuevos</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>

          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90"
            >
              Aplicar
            </button>
            <Link
              href="/dashboard/packs"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900"
            >
              Limpiar
            </Link>
          </div>
        </form>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packs.map((p) => {
          const count = p.prompts.length;
          const locked = !p.isFree;

          return (
            <Link
              key={p.id}
              href={`/dashboard/packs/${p.slug}`}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 hover:bg-neutral-900/70 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-neutral-400">
                  Pack
                </span>

                <div className="flex items-center gap-2">
                  {p.isFree ? (
                    <span className="text-xs rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                      Gratis
                    </span>
                  ) : (
                    <span className="text-xs rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200">
                      Premium · ${p.priceMx} MXN
                    </span>
                  )}
                </div>
              </div>

              <h2 className="mt-3 text-lg font-semibold leading-snug text-neutral-100 group-hover:text-white">
                {p.title}
              </h2>

              <p className="mt-2 text-sm text-neutral-400 line-clamp-3">
                {p.description}
              </p>

              <div className="mt-3 text-sm text-neutral-400">
                <span className="text-neutral-200 font-semibold">{count}</span>{" "}
                prompts incluidos
              </div>

              <div className="mt-5">
                {locked ? (
                  <span className="inline-flex items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition group-hover:bg-amber-500/20">
                    Ver contenido del pack
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition group-hover:opacity-90">
                    Explorar pack
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {packs.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-neutral-300">
          <div className="text-lg font-semibold">Sin resultados</div>
          <p className="mt-2 text-sm text-neutral-400">
            Prueba limpiar filtros o cambiar la búsqueda.
          </p>
        </div>
      )}
    </div>
  );
}

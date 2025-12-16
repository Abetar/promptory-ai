"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function labelMap(seg: string) {
  if (seg === "dashboard") return "Dashboard";
  if (seg === "prompts") return "Prompts";
  return seg; // fallback para ids u otros segmentos
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  // Solo mostramos breadcrumbs dentro de /dashboard
  if (!parts.length || parts[0] !== "dashboard") return null;

  const crumbs = parts.map((seg, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    return { seg, href };
  });

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1;

        return (
          <div key={c.href} className="flex items-center gap-2">
            {idx !== 0 && <span className="text-neutral-600">/</span>}

            {isLast ? (
              <span className="text-neutral-200">{labelMap(c.seg)}</span>
            ) : (
              <Link
                href={c.href}
                className="hover:text-neutral-200 transition"
              >
                {labelMap(c.seg)}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

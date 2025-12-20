// app/dashboard/admin/packs/new/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import PackForm from "../PackForm";
import { createPackAction } from "../actions";

export const runtime = "nodejs";

type ActionState =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export default async function NewPackPage() {
  await requireAdmin();

  const action = async (prevState: ActionState, formData: FormData) => {
    "use server";
    return createPackAction(prevState, formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nuevo pack</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Crea un pack y luego asigna prompts.
          </p>
        </div>

        <Link
          href="/dashboard/admin/packs"
          className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          ← Volver
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
        <PackForm
          action={action}
          submitLabel="Crear pack"
          redirectTo="/dashboard/admin/packs"
          defaultValues={{ isPublished: true, isFree: false, priceMx: 0 }}
        />
      </div>
    </div>
  );
}

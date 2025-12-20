import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function SolicitarPromptPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  async function action(formData: FormData) {
    "use server";

    if (!email) throw new Error("No autenticado");

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const aiTool = String(formData.get("aiTool") || "").trim();

    if (!title || !description) {
      throw new Error("Campos requeridos");
    }

    await prisma.promptRequest.create({
      data: {
        userEmail: email,
        title,
        description,
        aiTool: aiTool || null,
      },
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Solicitar nuevo prompt
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Describe el prompt que te gustaría ver en Promptory AI.
        </p>
      </div>

      {/* ⚠️ Disclaimer */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="text-sm font-semibold text-amber-200">
          Importante antes de enviar una solicitud
        </div>

        <p className="mt-2 text-sm text-amber-100/80 leading-relaxed">
          Promptory AI es un proyecto independiente y autofinanciado. Por el
          momento no podemos permitir que los usuarios agreguen prompts
          directamente al sistema, ya que almacenar grandes volúmenes de datos
          implica costos reales de infraestructura (base de datos, servidores,
          mantenimiento).
        </p>

        <p className="mt-2 text-sm text-amber-100/80 leading-relaxed">
          Si te gustaría que en el futuro exista la opción de crear o enviar
          prompts de forma más abierta, puedes apoyarnos con una donación para
          mantener el proyecto activo y escalable.
        </p>

        <div className="mt-3">
          <Link
            href="/donar"
            className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:opacity-90 transition"
          >
            Apoyar con una donación →
          </Link>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label className="text-sm text-neutral-300">Título del prompt</label>
          <input
            name="title"
            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200"
            required
          />
        </div>

        <div>
          <label className="text-sm text-neutral-300">
            ¿Para qué lo necesitas?
          </label>
          <textarea
            name="description"
            rows={4}
            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200"
            required
          />
        </div>

        <div>
          <label className="text-sm text-neutral-300">
            AI objetivo (opcional)
          </label>
          <input
            name="aiTool"
            placeholder="ChatGPT, Midjourney, etc."
            className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950"
          >
            Enviar solicitud
          </button>

          <Link
            href="/dashboard/prompts"
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-neutral-200"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

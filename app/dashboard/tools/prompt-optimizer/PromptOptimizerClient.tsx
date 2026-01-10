"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type TargetAI = "chatgpt" | "claude" | "gemini" | "deepseek";

type ApiOk = {
  ok: true;
  plan: "free" | "pro";
  engine: "mock" | "openai";
  model: string | null;
  latencyMs: number;
  output: string;

  // opcional (si viene del backend)
  subscriptionTier?: "none" | "basic" | "unlimited";
};

type ApiErr = {
  ok: false;
  message: string;
  code?: string;
};

type UsageOk = {
  ok: true;
  plan: "free" | "pro";
  usedToday: number;
  dailyLimit: number | null; // null para pro
  resetsAt: string; // ISO
};

type UsageErr = {
  ok: false;
  message: string;
};

export default function PromptOptimizerClient() {
  const [raw, setRaw] = useState("");
  const [targetAI, setTargetAI] = useState<TargetAI>("chatgpt");

  const [optimized, setOptimized] = useState("");
  const [meta, setMeta] = useState<{
    plan?: string;
    engine?: string;
    model?: string | null;
    latencyMs?: number;
    subscriptionTier?: "none" | "basic" | "unlimited";
  } | null>(null);

  const [state, setState] = useState<ApiErr | null>(null);
  const [pending, startTransition] = useTransition();

  const [copied, setCopied] = useState(false);

  // usage
  const [usage, setUsage] = useState<UsageOk | null>(null);
  const [usageErr, setUsageErr] = useState<string | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const canRunInput = useMemo(() => raw.trim().length >= 10, [raw]);

  const limitReached = useMemo(() => {
    if (!usage) return false;
    if (usage.plan !== "free") return false;
    if (usage.dailyLimit == null) return false;
    return usage.usedToday >= usage.dailyLimit;
  }, [usage]);

  function resetOutput() {
    setOptimized("");
    setMeta(null);
    setState(null);
    setCopied(false);
  }

  async function fetchUsage() {
    setUsageErr(null);
    setUsageLoading(true);

    try {
      const res = await fetch("/api/tools/prompt-optimizer/usage", {
        method: "GET",
      });
      const data = (await res.json()) as UsageOk | UsageErr;

      if (!res.ok || !("ok" in data) || data.ok === false) {
        setUsage(null);
        setUsageErr((data as UsageErr)?.message ?? "No se pudo cargar tu uso.");
        return;
      }

      setUsage(data as UsageOk);
    } catch {
      setUsage(null);
      setUsageErr("No se pudo cargar tu uso (sin conexión).");
    } finally {
      setUsageLoading(false);
    }
  }

  useEffect(() => {
    fetchUsage();
  }, []);

  useEffect(() => {
    setCopied(false);
  }, [optimized]);

  // si cambia targetAI, limpiamos errores/copiado (no tocamos output para no molestar)
  useEffect(() => {
    setState(null);
    setCopied(false);
  }, [targetAI]);

  async function onRun() {
    setState(null);

    if (limitReached) {
      setState({
        ok: false,
        code: "FREE_LIMIT_REACHED",
        message: "Límite diario alcanzado. Activa Pro para ilimitado.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/tools/prompt-optimizer/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // ✅ ya NO mandamos "mode"
          body: JSON.stringify({ input: raw, targetAI }),
        });

        const data = (await res.json()) as ApiOk | ApiErr;

        if (!res.ok || !("ok" in data) || data.ok === false) {
          const err =
            (data as ApiErr) ??
            ({ ok: false, message: "Error desconocido." } as ApiErr);

          setState(err);
          setOptimized("");
          setMeta(null);
          setCopied(false);

          await fetchUsage();
          return;
        }

        const ok = data as ApiOk;
        setOptimized(ok.output);
        setMeta({
          plan: ok.plan,
          engine: ok.engine,
          model: ok.model,
          latencyMs: ok.latencyMs,
          subscriptionTier: ok.subscriptionTier,
        });

        setCopied(false);
        await fetchUsage();
      } catch {
        setState({ ok: false, message: "No se pudo conectar con el servidor." });
        setOptimized("");
        setMeta(null);
        setCopied(false);
      }
    });
  }

  async function onCopy() {
    if (!optimized) return;

    try {
      await navigator.clipboard.writeText(optimized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setState({ ok: false, message: "No se pudo copiar al portapapeles." });
      setCopied(false);
    }
  }

  const usageLabel = useMemo(() => {
    if (usageLoading) return "Cargando uso...";
    if (usageErr) return usageErr;
    if (!usage) return "Uso no disponible";
    if (usage.plan === "pro") return "Pro: ilimitado";
    const limit = usage.dailyLimit ?? 0;
    return `Free: ${usage.usedToday}/${limit} hoy`;
  }, [usageLoading, usageErr, usage]);

  const resetAtDate = useMemo(() => {
    if (!usage?.resetsAt) return null;
    const d = new Date(usage.resetsAt);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [usage?.resetsAt]);

  const resetsLabel = useMemo(() => {
    if (!resetAtDate) return null;
    return `Se reinicia: ${resetAtDate.toLocaleString()}`;
  }, [resetAtDate]);

  // Banner amarillo: solo si FREE y está cerca o alcanzó
  const showLimitBanner = useMemo(() => {
    if (!usage) return false;
    if (usage.plan !== "free") return false;
    if (usage.dailyLimit == null) return false;
    const remaining = usage.dailyLimit - usage.usedToday;
    return remaining <= 2;
  }, [usage]);

  const remainingRuns = useMemo(() => {
    if (!usage) return null;
    if (usage.plan !== "free") return null;
    if (usage.dailyLimit == null) return null;
    return Math.max(0, usage.dailyLimit - usage.usedToday);
  }, [usage]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
      {/* Banner amarillo UX: límite free */}
      {showLimitBanner ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertTriangle className="h-5 w-5 text-amber-200" />
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-200">
                {limitReached
                  ? "Límite diario alcanzado"
                  : "Te estás quedando sin runs"}
              </div>

              <div className="mt-1 text-sm text-amber-200/80">
                {limitReached ? (
                  <>
                    Ya usaste tu límite diario en el plan Free.
                    {resetsLabel ? <> {resetsLabel}.</> : null}
                  </>
                ) : (
                  <>
                    Te quedan{" "}
                    <span className="font-semibold text-amber-200">
                      {remainingRuns}
                    </span>{" "}
                    run(s) hoy en Free.
                    {resetsLabel ? <> {resetsLabel}.</> : null}
                  </>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/upgrade?tier=basic"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
                >
                  Activar Pro Basic
                </Link>

                <button
                  type="button"
                  onClick={fetchUsage}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                >
                  Actualizar contador
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header / meta */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-neutral-100">
            Pega tu prompt → recibe una versión mejor
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-1",
                limitReached
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400",
              ].join(" ")}
              title={resetsLabel ?? undefined}
            >
              {usageLabel}
            </span>

            {resetsLabel ? (
              <span className="text-xs text-neutral-500">{resetsLabel}</span>
            ) : null}
          </div>

          <div className="text-xs text-neutral-500">
            Free usa mock con límite diario. Pro usa OpenAI si hay API key.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ✅ CTA a Unlimited (+18) */}
          <Link
            href="/dashboard/tools/optimizer-unlimited"
            className="inline-flex items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/15 transition"
            title="Optimizer Unlimited (NSFW +18)"
          >
            Ultimate (+18) →
          </Link>

          <label className="text-xs text-neutral-400">Target</label>
          <select
            value={targetAI}
            onChange={(e) => setTargetAI(e.target.value as TargetAI)}
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
          >
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
      </div>

      {/* Input */}
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Pega aquí tu prompt..."
        className="w-full h-40 rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-700"
      />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={!canRunInput || pending || limitReached}
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold transition",
            !canRunInput || pending || limitReached
              ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
              : "bg-neutral-100 text-neutral-950 hover:opacity-90",
          ].join(" ")}
        >
          {pending
            ? "Optimizando..."
            : limitReached
            ? "Límite alcanzado"
            : "Optimizar"}
        </button>

        <button
          type="button"
          onClick={resetOutput}
          disabled={pending && !optimized}
          className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition disabled:opacity-60"
        >
          Limpiar
        </button>

        {optimized ? (
          <button
            type="button"
            onClick={onCopy}
            className={[
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              copied
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
            ].join(" ")}
          >
            {copied ? "Copiado ✅" : "Copiar"}
          </button>
        ) : null}
      </div>

      {/* Error banner */}
      {state?.ok === false ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 space-y-2">
          <div className="font-semibold">No se pudo optimizar</div>
          <div className="opacity-90">{state.message}</div>

          {state.code === "FREE_LIMIT_REACHED" ? (
            <div className="pt-2">
              <Link
                href="/dashboard/upgrade?tier=basic"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              >
                Activar Pro Basic
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Output */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
        <div>
          <div className="text-sm font-semibold text-neutral-100">Optimizado</div>

          {meta ? (
            <div className="mt-1 text-xs text-neutral-500">
              {meta.subscriptionTier ? (
                <>
                  tier:{" "}
                  <span className="text-neutral-300">{meta.subscriptionTier}</span>{" "}
                  ·{" "}
                </>
              ) : null}
              plan: <span className="text-neutral-300">{meta.plan}</span> · engine:{" "}
              <span className="text-neutral-300">{meta.engine}</span>
              {meta.model ? (
                <>
                  {" "}
                  · model: <span className="text-neutral-300">{meta.model}</span>
                </>
              ) : null}
              {typeof meta.latencyMs === "number" ? <> · {meta.latencyMs}ms</> : null}
            </div>
          ) : (
            <div className="mt-1 text-xs text-neutral-600">
              Aquí aparecerá el prompt optimizado.
            </div>
          )}
        </div>

        <pre className="text-sm text-neutral-200 whitespace-pre-wrap">
          {optimized || "—"}
        </pre>
      </div>
    </div>
  );
}

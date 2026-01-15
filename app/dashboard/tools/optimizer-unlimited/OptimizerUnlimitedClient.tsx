// app/dashboard/tools/optimizer-unlimited/OptimizerUnlimitedClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, ExternalLink } from "lucide-react";

const AGE_KEY = "promptory_age_ok";

// ✅ 1 sola fuente de verdad para endpoints
const API = {
  usage: "/api/tools/optimizer-unlimited/usage",
  run: "/api/tools/optimizer-unlimited/run",
};

type ApiOk = {
  ok: true;
  tier: "unlimited";
  engine: "grok";
  model: string;
  latencyMs: number;
  remaining?: number;
  output: string; // ✅ output limpio (idealmente FINAL PROMPT)
  variables?: Record<string, string>; // ✅ variables editables opcionales
};

type ApiErr = {
  ok: false;
  message: string;
  code?: string;
};

type UsageOk = {
  ok: true;
  plan: "pro";
  usedToday: number;
  dailyLimit: number | null;
  resetsAt: string;
  remaining?: number;
};

type UsageErr = {
  ok: false;
  message: string;
};

const AI_TARGETS = [
  {
    label: "Perchance AI",
    href: "https://perchance.org/ai-text-to-image-generator",
  },
  {
    label: "Nastia AI",
    href: "https://www.nastia.ai/tools/uncensored-ai-image-generator",
  },
  { label: "Promptchan AI", href: "https://promptchan.com/" },
  { label: "Candy AI", href: "https://candy.ai/" },
  { label: "OurDream.AI", href: "https://ourdream.ai/" },
  { label: "Secrets AI", href: "https://secretdesires.ai/" },
  { label: "Soulkyn AI", href: "https://soulkyn.com/" },
  { label: "Grok (xAI)", href: "https://grok.x.ai/" },
];

// ---------------------------
// Helpers: variables + template
// ---------------------------
function safeString(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replacePlaceholders(template: string, vars: Record<string, string>) {
  let out = template ?? "";
  for (const [k, v] of Object.entries(vars ?? {})) {
    const key = k.trim();
    if (!key) continue;
    const value = safeString(v).trim();

    const re = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, "g");
    out = out.replace(re, value);
  }
  return out.trim();
}

function detectMissingVars(template: string, vars: Record<string, string>) {
  const matches = template.match(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g) ?? [];
  const keys = matches
    .map((m) => m.replace(/\{\{|\}\}/g, "").trim())
    .filter(Boolean);

  const unique = Array.from(new Set(keys));
  const missing = unique.filter((k) => !safeString(vars[k]).trim());

  return { keys: unique, missing };
}

export default function OptimizerUnlimitedClient() {
  const [ageOk, setAgeOk] = useState(false);

  const [raw, setRaw] = useState("");

  // ✅ Template (lo que viene del backend) + Final (aplicado)
  const [template, setTemplate] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [applied, setApplied] = useState(false);

  // ✅ Variables editables (si backend las manda)
  const [variables, setVariables] = useState<Record<string, string>>({});

  const [meta, setMeta] = useState<{
    engine?: string;
    model?: string;
    latencyMs?: number;
  } | null>(null);

  const [state, setState] = useState<ApiErr | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  // ✅ Usage
  const [usage, setUsage] = useState<UsageOk | null>(null);
  const [usageErr, setUsageErr] = useState<string | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // ✅ Fake progress (simulado)
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<number | null>(null);
  const progressStartRef = useRef<number>(0);
  const progressDoneRef = useRef<boolean>(false);

  // =========
  // EFFECTS
  // =========
  useEffect(() => {
    try {
      setAgeOk(localStorage.getItem(AGE_KEY) === "1");
    } catch {
      setAgeOk(false);
    }
  }, []);

  useEffect(() => {
    setCopied(false);
  }, [finalPrompt, template, applied]);

  useEffect(() => {
    return () => stopProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el usuario edita variables, marcamos como “no aplicado”
  useEffect(() => {
    if (!Object.keys(variables).length) return;
    setApplied(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(variables)]);

  async function fetchUsage() {
    setUsageErr(null);
    setUsageLoading(true);

    try {
      const res = await fetch(API.usage, { method: "GET" });
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

  // ✅ cargar usage cuando acepta age gate
  useEffect(() => {
    if (!ageOk) return;
    fetchUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageOk]);

  // =========
  // COMPUTED
  // =========
  const canRunInput = useMemo(() => raw.trim().length >= 10, [raw]);

  const remainingRuns = useMemo(() => {
    if (!usage) return null;

    if (typeof usage.remaining === "number") {
      return Math.max(0, usage.remaining);
    }

    if (usage.dailyLimit == null) return null; // ilimitado
    return Math.max(0, usage.dailyLimit - usage.usedToday);
  }, [usage]);

  const limitReached = useMemo(() => {
    if (!usage) return false;
    if (usage.dailyLimit == null && typeof usage.remaining !== "number")
      return false;
    const remaining = remainingRuns ?? 0;
    return remaining <= 0;
  }, [usage, remainingRuns]);

  const canRun = useMemo(() => {
    if (!canRunInput) return false;
    if (!usage) return false; // esperamos usage
    if (limitReached) return false;
    return true;
  }, [canRunInput, usage, limitReached]);

  const resetsLabel = useMemo(() => {
    if (!usage?.resetsAt) return null;
    const d = new Date(usage.resetsAt);
    if (Number.isNaN(d.getTime())) return null;
    return `Reinicia: ${d.toLocaleString()}`;
  }, [usage?.resetsAt]);

  // ✅ Mostrar pills SOLO cuando ya terminó y ya existe output
  const showAiPills = useMemo(() => {
    const out = (applied ? finalPrompt : template).trim();
    return out.length > 0 && !pending;
  }, [finalPrompt, template, applied, pending]);

  const hasVariables = useMemo(
    () => Object.keys(variables).length > 0,
    [variables]
  );

  const displayOutput = useMemo(() => {
    const out = applied ? finalPrompt : template;
    return (out ?? "").trim();
  }, [applied, finalPrompt, template]);

  const missingVarsInfo = useMemo(() => {
    if (!template) return { keys: [], missing: [] as string[] };
    return detectMissingVars(template, variables);
  }, [template, variables]);

  // =========
  // ACTIONS
  // =========
  function acceptAgeGate() {
    try {
      localStorage.setItem(AGE_KEY, "1");
    } catch {}
    setAgeOk(true);
  }

  function stopProgress() {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }

  function startFakeProgress() {
    stopProgress();
    setProgress(0);
    progressStartRef.current = Date.now();
    progressDoneRef.current = false;

    // Curva para latencias largas: rápido al inicio, luego se “pega” 90-96
    progressTimerRef.current = window.setInterval(() => {
      if (progressDoneRef.current) return;

      const elapsed = Date.now() - progressStartRef.current;

      // llega a ~90% alrededor de ~45s (ajusta si quieres)
      const t = Math.min(elapsed / 45_000, 1);
      const base = Math.floor(90 * (1 - Math.pow(1 - t, 3))); // ease-out

      setProgress((prev) => {
        if (base > prev) return base;

        // micro avance entre 90 y 96 si tarda mucho
        if (prev >= 90 && prev < 96) {
          if (elapsed % 2800 < 220) return prev + 1;
        }

        return Math.min(prev, 96);
      });
    }, 250);
  }

  function resetAll() {
    setRaw("");
    setTemplate("");
    setFinalPrompt("");
    setVariables({});
    setApplied(false);

    setMeta(null);
    setState(null);
    setCopied(false);

    stopProgress();
    progressDoneRef.current = true;
    setProgress(0);
  }

  function applyVariables() {
    if (!template) return;
    const appliedText = replacePlaceholders(template, variables);
    setFinalPrompt(appliedText);
    setApplied(true);
  }

  async function onRun() {
    setState(null);

    if (!ageOk) {
      setState({
        ok: false,
        message: "Debes confirmar +18 para usar esta tool.",
      });
      return;
    }

    if (!usage) {
      setState({
        ok: false,
        message: "Cargando tu uso... intenta de nuevo en un momento.",
      });
      return;
    }

    if (limitReached) {
      setState({
        ok: false,
        code: "DAILY_LIMIT_REACHED",
        message: "Límite diario alcanzado. Intenta mañana.",
      });
      return;
    }

    // ✅ arranca el porcentaje simulado
    startFakeProgress();

    startTransition(async () => {
      try {
        const res = await fetch(API.run, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: raw }),
        });

        // ✅ Manejo explícito 429
        if (res.status === 429) {
          progressDoneRef.current = true;
          stopProgress();
          setProgress(0);

          setState({
            ok: false,
            code: "DAILY_LIMIT_REACHED",
            message: "Límite diario alcanzado. Intenta mañana.",
          });
          await fetchUsage();
          return;
        }

        const data = (await res.json()) as ApiOk | ApiErr;

        if (!res.ok || !("ok" in data) || data.ok === false) {
          const err = (data as ApiErr) ?? {
            ok: false,
            message: "Error desconocido.",
          };

          progressDoneRef.current = true;
          stopProgress();
          setProgress(0);

          setState(err);
          setTemplate("");
          setFinalPrompt("");
          setVariables({});
          setApplied(false);

          setMeta(null);
          setCopied(false);

          await fetchUsage();
          return;
        }

        const ok = data as ApiOk;

        // ✅ completar progreso al éxito
        progressDoneRef.current = true;
        stopProgress();
        setProgress(100);

        // ✅ Guardar template + variables
        const out = safeString(ok.output).trim();

        setTemplate(out);
        setFinalPrompt(out);
        setApplied(false);

        const apiVars = ok.variables ?? {};
        const detected = detectMissingVars(out, apiVars); // keys = placeholders en el template

        // ✅ Merge: asegura que TODO placeholder exista como input editable
        const mergedVars: Record<string, string> = { ...apiVars };
        for (const k of detected.keys) {
          if (!(k in mergedVars)) mergedVars[k] = "";
        }

        setVariables(mergedVars);

        setMeta({
          engine: ok.engine,
          model: ok.model,
          latencyMs: ok.latencyMs,
        });

        setCopied(false);

        // ✅ refrescar uso post-run
        await fetchUsage();
      } catch {
        progressDoneRef.current = true;
        stopProgress();
        setProgress(0);

        setState({
          ok: false,
          message: "No se pudo conectar con el servidor.",
        });

        setTemplate("");
        setFinalPrompt("");
        setVariables({});
        setApplied(false);

        setMeta(null);
        setCopied(false);
      }
    });
  }

  async function onCopy() {
    const text = displayOutput;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setState({ ok: false, message: "No se pudo copiar al portapapeles." });
      setCopied(false);
    }
  }

  // =========
  // UI
  // =========
  return (
    <div className="relative">
      {/* Age Gate */}
      {!ageOk ? (
        <div className="absolute inset-0 z-20 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <ShieldAlert className="h-5 w-5 text-fuchsia-200" />
              </div>

              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-100">
                  Confirmación +18 requerida
                </div>
                <p className="mt-1 text-sm text-neutral-400">
                  Esta herramienta es{" "}
                  <span className="text-fuchsia-200 font-semibold">NSFW</span> y
                  está reservada para adultos. Al continuar confirmas que tienes{" "}
                  <span className="text-neutral-200 font-semibold">18+</span>.
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Guardamos esta confirmación solo en este navegador
                  (localStorage).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={acceptAgeGate}
                className="inline-flex items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90 transition"
              >
                Soy mayor de 18 · Continuar
              </button>

              <Link
                href="/dashboard/tools"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
              >
                Salir
              </Link>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200/80">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-200" />
                <div>
                  <b>Reglas:</b> solo adultos, consentimiento explícito, nada
                  ilegal.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tool UI */}
      <div
        className={[
          "rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4",
          !ageOk ? "opacity-30 pointer-events-none select-none" : "",
        ].join(" ")}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-neutral-100">
                Optimizer Unlimited
              </div>
              <span className="text-xs rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-200">
                Ultimate / NSFW
              </span>
            </div>

            <div className="text-xs text-neutral-500">
              Esta tool usa Grok. Output: solo prompts optimizados (no genera
              contenido final dentro de Promptory).
            </div>

            {/* Usage line */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {usageLoading ? (
                <span className="text-neutral-500">Cargando uso...</span>
              ) : usageErr ? (
                <span className="text-red-300">{usageErr}</span>
              ) : usage ? (
                <>
                  <span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-950 px-2 py-1 text-neutral-300">
                    Usos hoy:{" "}
                    <span className="ml-1 text-neutral-100 font-semibold">
                      {usage.usedToday}
                      {usage.dailyLimit != null ? `/${usage.dailyLimit}` : ""}
                    </span>
                  </span>

                  {usage.dailyLimit != null ? (
                    <span className="text-neutral-500">
                      Restantes:{" "}
                      <span className="text-neutral-200 font-semibold">
                        {remainingRuns ?? 0}
                      </span>
                    </span>
                  ) : typeof usage.remaining === "number" ? (
                    <span className="text-neutral-500">
                      Restantes:{" "}
                      <span className="text-neutral-200 font-semibold">
                        {remainingRuns ?? 0}
                      </span>
                    </span>
                  ) : (
                    <span className="text-neutral-500">Ilimitado</span>
                  )}

                  {resetsLabel ? (
                    <span className="text-neutral-600">{resetsLabel}</span>
                  ) : null}
                </>
              ) : (
                <span className="text-neutral-500">Uso no disponible</span>
              )}

              <button
                type="button"
                onClick={fetchUsage}
                disabled={usageLoading}
                className={[
                  "ml-0 md:ml-2 inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                  usageLoading
                    ? "border-neutral-800 bg-neutral-950 text-neutral-500 cursor-not-allowed"
                    : "border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                ].join(" ")}
              >
                {usageLoading ? "Actualizando..." : "Actualizar"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Limpiar
            </button>

            {displayOutput ? (
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
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Describe la idea en corto... yo la convierto en un prompt estructurado para Grok."
          className="w-full h-40 rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-700"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRun}
            disabled={!canRun || pending}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              !canRun || pending
                ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-100 text-neutral-950 hover:opacity-90",
            ].join(" ")}
          >
            {pending
              ? "Optimizando..."
              : limitReached
              ? "Límite alcanzado"
              : "Optimizar (Ultimate)"}
          </button>

          <div className="text-xs text-neutral-500">Mínimo 10 caracteres.</div>
        </div>

        {/* ✅ Progress UI */}
        {pending ? (
          <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                <span>
                  Optimizando…{" "}
                  <span className="font-semibold text-neutral-100">
                    {progress}%
                  </span>
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                Grok puede tardar ~1 min
              </div>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/70 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {state?.ok === false ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 space-y-2">
            <div className="font-semibold">No se pudo optimizar</div>
            <div className="opacity-90">{state.message}</div>
          </div>
        ) : null}

        {/* ✅ Pills (solo cuando ya terminó y ya existe output) */}
        {showAiPills ? (
          <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 space-y-3">
            <div className="text-sm font-semibold text-neutral-100">
              Prompt optimizado para las siguientes IAs
            </div>

            {/* Scroll horizontal tipo screenshot */}
            <div className="-mx-1 overflow-x-auto px-1">
              <div className="flex w-max gap-2 whitespace-nowrap">
                {AI_TARGETS.map((ai) => (
                  <a
                    key={ai.label}
                    href={ai.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-500/15 transition"
                  >
                    {ai.label}
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>
                ))}
              </div>
            </div>

            <div className="text-xs text-neutral-500">
              Tip: copia el prompt y pégalo en la IA que prefieras.
            </div>
          </div>
        ) : null}

        {/* ✅ Variables editables (si backend las manda) */}
        {hasVariables ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-100">
                  Variables editables
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Edita lo importante y luego da click en{" "}
                  <b>Aplicar variables</b>.
                </div>
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
              </div>

              {hasVariables && missingVarsInfo.missing.length > 0 ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  Faltan: {missingVarsInfo.missing.join(", ")}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(variables).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    {key}
                  </label>
                  <input
                    value={safeString(value)}
                    onChange={(e) =>
                      setVariables((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
                    placeholder={`Escribe ${key.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={applyVariables}
                disabled={!template || pending}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  !template || pending
                    ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                    : "bg-fuchsia-500 text-neutral-950 hover:opacity-90",
                ].join(" ")}
              >
                Aplicar variables
              </button>

              <div className="text-xs text-neutral-500">
                {applied ? "Aplicadas ✅" : "Aún no aplicadas"}
              </div>
            </div>
          </div>
        ) : null}

        {/* Output */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-neutral-100">
                Optimizado
              </div>

              {meta ? (
                <div className="mt-1 text-xs text-neutral-500">
                  engine:{" "}
                  <span className="text-neutral-300">{meta.engine}</span>
                  {meta.model ? (
                    <>
                      {" "}
                      · model:{" "}
                      <span className="text-neutral-300">{meta.model}</span>
                    </>
                  ) : null}
                  {typeof meta.latencyMs === "number" ? (
                    <> · {meta.latencyMs}ms</>
                  ) : null}
                  {hasVariables ? (
                    <>
                      {" "}
                      · vista:{" "}
                      <span className="text-neutral-300">
                        {applied ? "final" : "template"}
                      </span>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="mt-1 text-xs text-neutral-600">
                  Aquí aparecerá el prompt optimizado.
                </div>
              )}
            </div>

            {/* Toggle simple */}
            {hasVariables && template ? (
              <button
                type="button"
                onClick={() => setApplied((v) => !v)}
                disabled={pending}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  pending
                    ? "border-neutral-800 bg-neutral-900 text-neutral-500 cursor-not-allowed"
                    : "border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                ].join(" ")}
                title="Alterna entre template (con {{VAR}}) y final (aplicado)"
              >
                Ver: {applied ? "Final" : "Template"}
              </button>
            ) : null}
          </div>

          {/* Mejor que <pre> para copiar/pegar + long prompts */}
          <textarea
            value={displayOutput || "—"}
            readOnly
            className="w-full h-64 rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-neutral-200 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type TargetAI = "chatgpt" | "claude" | "gemini" | "deepseek";

// ✅ Mejor naming: “text” vs “prompt”
type OutputMode = "text" | "prompt";
type Preset = "general" | "whatsapp" | "email" | "linkedin";
type Tone = "neutral" | "amable" | "firme";

type ApiOk = {
  ok: true;
  plan: "free" | "pro";
  engine: "mock" | "openai";
  model: string | null;
  latencyMs: number;
  output: string;
  subscriptionTier?: "none" | "basic" | "unlimited";
  outputMode?: OutputMode;
  preset?: Preset;
  tone?: Tone;
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
  dailyLimit: number | null;
  resetsAt: string;
};

type UsageErr = {
  ok: false;
  message: string;
};

type PromptBaseGetOk = {
  ok: true;
  data: { content: string; createdAt: string | null; updatedAt: string | null };
};

type PromptBasePutOk = {
  ok: true;
  data: { content: string; createdAt: string; updatedAt: string };
};

type PromptBaseErr = {
  ok: false;
  message: string;
};

type Props = {
  initialInput?: string; // (puede venir del server, pero ya NO lo metemos a raw)
  isPro?: boolean;
  tier?: "none" | "basic" | "unlimited";
};

const PRESET_LABEL: Record<Preset, string> = {
  general: "General",
  whatsapp: "WhatsApp",
  email: "Email",
  linkedin: "LinkedIn",
};

const PRESET_HELP: Record<Preset, string> = {
  general: "Mejora tu texto para que quede claro, profesional y usable.",
  whatsapp:
    "Mensaje corto y fácil de leer. 1 versión principal + 1 alternativa más corta.",
  email: "Asunto (2) + cuerpo normal + cuerpo corto. Profesional y directo.",
  linkedin: "Post listo para publicar + variante corta. Enfocado en claridad.",
};

const TONE_LABEL: Record<Tone, string> = {
  neutral: "Neutral",
  amable: "Amable",
  firme: "Firme",
};

function splitRecommendedAndShort(output: string): {
  recommended: string;
  short: string | null;
} {
  const text = String(output ?? "").trim();
  if (!text) return { recommended: "", short: null };

  // 1) Caso ideal: separador tipo "---" en una línea
  const parts = text.split(/\n\s*---+\s*\n/g);
  if (parts.length > 1) {
    const recommended = (parts[0] ?? "").trim();
    const shortRaw = parts.slice(1).join("\n---\n").trim();
    return { recommended, short: shortRaw ? shortRaw : null };
  }

  // 2) Fallback: encabezado "Versión corta" (con o sin ":")
  //    Acepta: "Versión corta", "Versión corta:", "VERSION CORTA", etc.
  const m = text.match(/\n\s*(versión\s*corta|version\s*corta)\s*:?\s*\n/i);
  if (m?.index != null) {
    const idx = m.index;
    const headerLen = m[0].length;

    const a = text.slice(0, idx).trim();
    const b = text.slice(idx + headerLen).trim();

    return { recommended: a, short: b ? b : null };
  }

  // 3) Si no se puede separar, todo es recommended
  return { recommended: text, short: null };
}

export default function PromptOptimizerClient({ initialInput = "" }: Props) {
  // ✅ Texto del optimizador (lo que se procesa)
  // ✅ CAMBIO: ya NO iniciamos con initialInput para evitar confusión.
  const [raw, setRaw] = useState("");

  const [targetAI, setTargetAI] = useState<TargetAI>("chatgpt");
  const [preset, setPreset] = useState<Preset>("general");
  const [tone, setTone] = useState<Tone>("neutral");
  const [outputMode, setOutputMode] = useState<OutputMode>("text");

  const [optimized, setOptimized] = useState("");
  const [meta, setMeta] = useState<{
    plan?: string;
    engine?: string;
    model?: string | null;
    latencyMs?: number;
    subscriptionTier?: "none" | "basic" | "unlimited";
    outputMode?: OutputMode;
    preset?: Preset;
    tone?: Tone;
  } | null>(null);

  const [state, setState] = useState<ApiErr | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  // usage
  const [usage, setUsage] = useState<UsageOk | null>(null);
  const [usageErr, setUsageErr] = useState<string | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  // =========================
  // ✅ Prompt Base (EN MODAL)
  // =========================
  const [pbOpen, setPbOpen] = useState(false);
  const [pbLoading, setPbLoading] = useState(false);
  const [pbSaving, setPbSaving] = useState(false);
  const [pbErr, setPbErr] = useState<string | null>(null);
  const [pbUpdatedAt, setPbUpdatedAt] = useState<Date | null>(null);

  // ✅ Valor del Prompt Base separado del textarea principal
  const [pbValue, setPbValue] = useState<string>("");

  // Para detectar cambios sin guardar (prompt base)
  const [pbLastSaved, setPbLastSaved] = useState<string>("");

  // ✅ Collapsibles output
  const [openRecommended, setOpenRecommended] = useState(true);
  const [openShort, setOpenShort] = useState(false);

  // ✅ CAMBIO: ya NO hacemos auto-load del initialInput hacia raw.
  // Si initialInput trae algo (por ejemplo prompt base server-side),
  // lo usamos solo como fallback para PB (si PB aún está vacío).
  useEffect(() => {
    const v = String(initialInput ?? "").trim();
    if (!v) return;

    setPbValue((prev) => (prev.trim().length ? prev : v));
    setPbLastSaved((prev) => (prev.trim().length ? prev : v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInput]);

  const pbHasUnsavedChanges = useMemo(() => {
    return pbValue.trim() !== (pbLastSaved ?? "").trim();
  }, [pbValue, pbLastSaved]);

  function closePromptBaseModal() {
    setPbErr(null);
    setPbOpen(false);
  }

  async function openPromptBaseModal() {
    setPbOpen(true);
    if (!pbLastSaved && !pbValue) {
      await loadPromptBase();
    }
  }

  async function loadPromptBase() {
    setPbErr(null);
    setPbLoading(true);

    try {
      const res = await fetch("/api/user/prompt-base", { method: "GET" });
      const data = (await res.json()) as PromptBaseGetOk | PromptBaseErr;

      if (!res.ok || !("ok" in data) || (data as any).ok === false) {
        setPbErr(
          (data as PromptBaseErr)?.message ??
            "No se pudo cargar tu Prompt Base."
        );
        return;
      }

      const ok = data as PromptBaseGetOk;
      const content = ok.data?.content ?? "";
      setPbValue(content);
      setPbLastSaved(content);

      const updatedAtIso = ok.data?.updatedAt ?? null;
      setPbUpdatedAt(updatedAtIso ? new Date(updatedAtIso) : null);
    } catch {
      setPbErr("No se pudo cargar tu Prompt Base (sin conexión).");
    } finally {
      setPbLoading(false);
    }
  }

  async function savePromptBase() {
    setPbErr(null);

    const content = pbValue.trim();
    if (!content) {
      setPbErr("Tu Prompt Base no puede estar vacío.");
      return;
    }
    if (content.length > 20000) {
      setPbErr("Tu Prompt Base excede el límite (20,000 caracteres).");
      return;
    }

    setPbSaving(true);
    try {
      const res = await fetch("/api/user/prompt-base", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = (await res.json()) as PromptBasePutOk | PromptBaseErr;

      if (!res.ok || !("ok" in data) || (data as any).ok === false) {
        setPbErr(
          (data as PromptBaseErr)?.message ??
            "No se pudo guardar tu Prompt Base."
        );
        return;
      }

      const ok = data as PromptBasePutOk;
      setPbLastSaved(ok.data.content);
      setPbValue(ok.data.content);
      setPbUpdatedAt(new Date(ok.data.updatedAt));
    } catch {
      setPbErr("No se pudo guardar tu Prompt Base (sin conexión).");
    } finally {
      setPbSaving(false);
    }
  }

  function applyPromptBaseToOptimizer() {
    const content = pbValue.trim();
    if (!content) {
      setPbErr("Tu Prompt Base está vacío.");
      return;
    }
    // ✅ SOLO bajo acción explícita del usuario
    setRaw(content);
    closePromptBaseModal();
  }

  // =========================
  // Optimizer actual
  // =========================
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
    setOpenRecommended(true);
    setOpenShort(false);
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

  useEffect(() => {
    setState(null);
    setCopied(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAI, preset, tone, outputMode]);

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
          body: JSON.stringify({
            input: raw,
            targetAI,
            outputMode,
            preset,
            tone,
          }),
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

        // reset accordion defaults para cada run
        setOpenRecommended(true);
        setOpenShort(false);

        setMeta({
          plan: ok.plan,
          engine: ok.engine,
          model: ok.model,
          latencyMs: ok.latencyMs,
          subscriptionTier: ok.subscriptionTier,
          outputMode: ok.outputMode ?? outputMode,
          preset: ok.preset ?? preset,
          tone: ok.tone ?? tone,
        });

        setCopied(false);
        await fetchUsage();
      } catch {
        setState({
          ok: false,
          message: "No se pudo conectar con el servidor.",
        });
        setOptimized("");
        setMeta(null);
        setCopied(false);
      }
    });
  }

  async function onCopyText(text: string) {
    const value = String(text ?? "").trim();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setState({ ok: false, message: "No se pudo copiar al portapapeles." });
      setCopied(false);
    }
  }

  async function onCopy() {
    if (!optimized) return;
    return onCopyText(optimized);
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

  const pbUpdatedLabel = useMemo(() => {
    if (!pbUpdatedAt) return null;
    return `Última edición: ${pbUpdatedAt.toLocaleString()}`;
  }, [pbUpdatedAt]);

  const placeholder = useMemo(() => {
    if (preset === "whatsapp")
      return "Pega el texto que quieres convertir a WhatsApp...";
    if (preset === "email") return "Pega el texto o contexto del email...";
    if (preset === "linkedin")
      return "Pega la idea, borrador o puntos del post...";
    return "Pega aquí tu texto...";
  }, [preset]);

  const outputTitle = useMemo(() => {
    if (outputMode === "prompt") return "PROMPT FINAL";
    return preset === "email" ? "Email optimizado" : "Texto optimizado";
  }, [outputMode, preset]);

  useEffect(() => {
    if (!pbOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closePromptBaseModal();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pbOpen]);

  const split = useMemo(() => {
    if (outputMode !== "text") return null;
    return splitRecommendedAndShort(optimized);
  }, [optimized, outputMode]);

  // ✅ CAMBIO: si NO hay versión corta, NO renderizamos ese card
  const hasShort = useMemo(() => {
    return outputMode === "text" && !!split?.short && split.short.trim().length > 0;
  }, [outputMode, split]);

  const showAccordion = useMemo(() => {
    if (outputMode !== "text") return false;
    if (!split) return false;
    if (!split.recommended) return false;
    return true;
  }, [outputMode, split]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 space-y-4">
      {/* ✅ Presets tabs */}
      <div className="space-y-3">
        <div className="-mx-1 overflow-x-auto">
          <div className="px-1 flex gap-2 min-w-max">
            {(Object.keys(PRESET_LABEL) as Preset[]).map((p) => {
              const active = preset === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPreset(p)}
                  className={[
                    "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                    active
                      ? "border-neutral-200 bg-neutral-100 text-neutral-950"
                      : "border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                  ].join(" ")}
                >
                  {PRESET_LABEL[p]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-neutral-500">{PRESET_HELP[preset]}</div>

        {/* ✅ Controles */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-1 text-xs",
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {/* ✅ Salida tabs */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Salida</span>
              <div className="inline-flex rounded-xl border border-neutral-800 bg-neutral-950 p-1">
                <button
                  type="button"
                  onClick={() => setOutputMode("text")}
                  className={[
                    "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                    outputMode === "text"
                      ? "bg-neutral-100 text-neutral-950"
                      : "text-neutral-200 hover:bg-neutral-900",
                  ].join(" ")}
                  title="Devuelve el texto final listo para usar"
                >
                  Texto listo
                </button>
                <button
                  type="button"
                  onClick={() => setOutputMode("prompt")}
                  className={[
                    "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                    outputMode === "prompt"
                      ? "bg-neutral-100 text-neutral-950"
                      : "text-neutral-200 hover:bg-neutral-900",
                  ].join(" ")}
                  title="Devuelve un prompt final para pegar en otra IA"
                >
                  Prompt
                </button>
              </div>
            </div>

            {/* Tono */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400">Tono</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full sm:w-auto rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
              >
                <option value="neutral">{TONE_LABEL.neutral}</option>
                <option value="amable">{TONE_LABEL.amable}</option>
                <option value="firme">{TONE_LABEL.firme}</option>
              </select>
            </div>

            {/* Target AI */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400">Target</label>
              <select
                value={targetAI}
                onChange={(e) => setTargetAI(e.target.value as TargetAI)}
                className="w-full sm:w-auto rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-700"
              >
                <option value="chatgpt">ChatGPT</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-500">
          {outputMode === "prompt" ? (
            <>
              Devuelve un{" "}
              <span className="text-neutral-300 font-semibold">
                PROMPT FINAL
              </span>{" "}
              (para pegarlo en otra IA).
            </>
          ) : (
            <>
              Devuelve{" "}
              <span className="text-neutral-300 font-semibold">
                texto final listo
              </span>{" "}
              para copiar/pegar.
            </>
          )}
        </div>
      </div>

      {/* ✅ Prompt Base (launcher) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-100">
              Tu Prompt Base
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Guárdalo como tu “texto base” (instrucciones o estilo) y aplícalo
              cuando quieras.
              {pbUpdatedLabel ? <> · {pbUpdatedLabel}</> : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={openPromptBaseModal}
              disabled={pending}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition disabled:opacity-60"
            >
              Abrir Prompt Base
            </button>

            <button
              type="button"
              onClick={applyPromptBaseToOptimizer}
              disabled={pending || !pbValue.trim()}
              className={[
                "w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                pending || !pbValue.trim()
                  ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                  : "bg-neutral-100 text-neutral-950 hover:opacity-90",
              ].join(" ")}
              title={
                !pbValue.trim()
                  ? "Abre el Prompt Base y guarda contenido primero"
                  : "Copiar Prompt Base al optimizador"
              }
            >
              Usar en optimizador
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal Prompt Base inline */}
      {pbOpen ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Prompt Base"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={closePromptBaseModal}
            aria-label="Cerrar"
          />

          <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
            <div className="w-full md:max-w-3xl md:rounded-2xl md:border md:border-neutral-800 md:bg-neutral-950 md:shadow-2xl">
              <div className="rounded-t-2xl border border-neutral-800 bg-neutral-950 md:rounded-2xl md:border-none">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur md:rounded-t-2xl">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-100">
                      Prompt Base
                    </div>
                    <div className="text-xs text-neutral-500">
                      Edita y guarda. Luego puedes “Usar en optimizador”.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closePromptBaseModal}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                    >
                      Cerrar
                    </button>

                    <button
                      type="button"
                      onClick={savePromptBase}
                      disabled={pbSaving || pbLoading || pending}
                      className={[
                        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition",
                        pbSaving || pbLoading || pending
                          ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                          : "bg-neutral-100 text-neutral-950 hover:opacity-90",
                      ].join(" ")}
                    >
                      {pbSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>

                <div className="px-4 py-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-neutral-500">
                      {pbUpdatedLabel
                        ? pbUpdatedLabel
                        : "Sin ediciones previas."}
                      {pbHasUnsavedChanges ? (
                        <span className="ml-2 text-amber-200">
                          • cambios sin guardar
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={loadPromptBase}
                        disabled={pbLoading || pbSaving || pending}
                        className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition disabled:opacity-60"
                      >
                        {pbLoading ? "Cargando..." : "Recargar"}
                      </button>

                      <button
                        type="button"
                        onClick={applyPromptBaseToOptimizer}
                        disabled={pending || !pbValue.trim()}
                        className={[
                          "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition",
                          pending || !pbValue.trim()
                            ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                            : "bg-neutral-100 text-neutral-950 hover:opacity-90",
                        ].join(" ")}
                      >
                        Usar en optimizador
                      </button>
                    </div>
                  </div>

                  {pbErr ? (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                      {pbErr}
                    </div>
                  ) : null}

                  <textarea
                    value={pbValue}
                    onChange={(e) => setPbValue(e.target.value)}
                    placeholder="Escribe tu Prompt Base (instrucciones, estilo, reglas, etc.)..."
                    className="w-full h-[45vh] md:h-[360px] rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-700"
                  />

                  <div className="text-xs text-neutral-500">
                    Tip: aquí puedes guardar tu “estilo” (breve, profesional,
                    con bullets, etc.).
                  </div>
                </div>

                <div className="md:hidden border-t border-neutral-800 bg-neutral-950/95 px-4 py-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={closePromptBaseModal}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={savePromptBase}
                      disabled={pbSaving || pbLoading || pending}
                      className={[
                        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                        pbSaving || pbLoading || pending
                          ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                          : "bg-neutral-100 text-neutral-950 hover:opacity-90",
                      ].join(" ")}
                    >
                      {pbSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Banner límite free */}
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

      {/* Input (solo optimizador) */}
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={placeholder}
        className="w-full h-44 md:h-40 rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-neutral-700"
      />

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={!canRunInput || pending || limitReached}
          className={[
            "w-full sm:w-auto rounded-xl px-4 py-2 text-sm font-semibold transition",
            !canRunInput || pending || limitReached
              ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
              : "bg-neutral-100 text-neutral-950 hover:opacity-90",
          ].join(" ")}
        >
          {pending
            ? "Procesando..."
            : limitReached
            ? "Límite alcanzado"
            : outputMode === "prompt"
            ? "Generar prompt"
            : "Optimizar texto"}
        </button>

        <button
          type="button"
          onClick={resetOutput}
          disabled={pending && !optimized}
          className="w-full sm:w-auto rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition disabled:opacity-60"
        >
          Limpiar salida
        </button>

        {optimized ? (
          <button
            type="button"
            onClick={onCopy}
            className={[
              "w-full sm:w-auto rounded-xl border px-4 py-2 text-sm font-semibold transition",
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
          <div className="font-semibold">No se pudo procesar</div>
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
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-neutral-100">
              {outputTitle}
            </div>

            <div className="text-xs text-neutral-500">
              {PRESET_LABEL[preset]} · {TONE_LABEL[tone]} ·{" "}
              {outputMode === "prompt" ? "Prompt" : "Texto listo"}
            </div>
          </div>

          {meta ? (
            <div className="mt-1 text-xs text-neutral-500">
              {meta.subscriptionTier ? (
                <>
                  tier:{" "}
                  <span className="text-neutral-300">
                    {meta.subscriptionTier}
                  </span>{" "}
                  ·{" "}
                </>
              ) : null}
              plan: <span className="text-neutral-300">{meta.plan}</span> ·
              engine: <span className="text-neutral-300">{meta.engine}</span>
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
            </div>
          ) : (
            <div className="mt-1 text-xs text-neutral-600">
              Aquí aparecerá la salida.
            </div>
          )}
        </div>

        {/* ✅ Accordion SOLO para modo texto */}
        {outputMode === "text" ? (
          <>
            {showAccordion && split ? (
              <div className="space-y-2">
                {/* Recomendado */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950">
                  <button
                    type="button"
                    onClick={() => setOpenRecommended((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-neutral-100">
                        Versión recomendada
                      </div>
                      <div className="text-xs text-neutral-500">
                        Lista para copiar/pegar
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {openRecommended ? "Ocultar" : "Mostrar"}
                    </span>
                  </button>

                  {openRecommended ? (
                    <div className="px-4 pb-4 space-y-3">
                      <pre className="text-sm text-neutral-200 whitespace-pre-wrap">
                        {split.recommended || "—"}
                      </pre>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => onCopyText(split.recommended)}
                          disabled={!split.recommended}
                          className={[
                            "w-full sm:w-auto inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition",
                            copied
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                          ].join(" ")}
                        >
                          {copied ? "Copiado ✅" : "Copiar recomendada"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Corta (solo si existe) */}
                {hasShort ? (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950">
                    <button
                      type="button"
                      onClick={() => setOpenShort((v) => !v)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-neutral-100">
                          Versión corta
                        </div>
                        <div className="text-xs text-neutral-500">
                          Alternativa más breve
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {openShort ? "Ocultar" : "Mostrar"}
                      </span>
                    </button>

                    {openShort ? (
                      <div className="px-4 pb-4 space-y-3">
                        <pre className="text-sm text-neutral-200 whitespace-pre-wrap">
                          {split?.short ?? "—"}
                        </pre>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => onCopyText(split?.short ?? "")}
                            disabled={!split?.short}
                            className={[
                              "w-full sm:w-auto inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition",
                              copied
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                : "border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900",
                            ].join(" ")}
                          >
                            {copied ? "Copiado ✅" : "Copiar corta"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">
                    No se generó versión corta en este run.
                  </div>
                )}
              </div>
            ) : (
              <pre className="text-sm text-neutral-200 whitespace-pre-wrap">
                {optimized || "—"}
              </pre>
            )}
          </>
        ) : (
          <pre className="text-sm text-neutral-200 whitespace-pre-wrap">
            {optimized || "—"}
          </pre>
        )}
      </div>

      {/* Hint */}
      <div className="text-xs text-neutral-500">
        Tip: si quieres consistencia fuerte en outputs,{" "}
        <Link
          className="text-neutral-300 hover:text-neutral-100 transition"
          href="/dashboard/upgrade"
        >
          activa Pro
        </Link>
        .
      </div>
    </div>
  );
}

// app/dashboard/prompts/[id]/translate-actions.ts
"use server";

export async function translatePromptToEnglishAction(text: string) {
  // ✅ MVP: no persistimos nada, solo transformamos respuesta.
  // ⚠️ Placeholder: aquí conectarás tu proveedor de IA.
  // Por ahora devolvemos el mismo texto con un prefijo para validar UI.
  const trimmed = (text || "").trim();
  if (!trimmed) return "";

  return `# English version (placeholder)\n\n${trimmed}`;
}

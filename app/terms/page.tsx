import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Volver
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Términos y Condiciones</h1>
        <p className="mt-2 text-white/70 text-sm">
          Última actualización: {/* pon fecha */} 2025-12-17
        </p>

        <div className="mt-8 space-y-6 text-white/80 leading-relaxed">
          <Section title="1. Descripción del servicio">
            Promptory AI es una plataforma para consultar y adquirir prompts optimizados para herramientas de IA.
          </Section>

          <Section title="2. Cuenta y acceso">
            El acceso requiere inicio de sesión. Eres responsable del uso de tu cuenta.
          </Section>

          <Section title="3. Compras, pagos y reembolsos">
            Los prompts digitales pueden ser no reembolsables una vez entregado el contenido, salvo requerimiento legal aplicable.
          </Section>

          <Section title="4. Uso aceptable">
            No usar el servicio para actividades ilegales, fraude, o violación de derechos de terceros.
          </Section>

          <Section title="5. Contenido y propiedad intelectual">
            Los prompts publicados pueden tener licencias o restricciones. No revendas ni redistribuyas prompts premium sin autorización.
          </Section>

          <Section title="6. Limitación de responsabilidad">
            Los resultados generados por herramientas de IA pueden variar; Promptory AI no garantiza resultados específicos.
          </Section>

          <Section title="7. Cambios">
            Podemos actualizar estos términos. El uso continuado implica aceptación de cambios.
          </Section>

          <Section title="8. Contacto">
            Para dudas: agsolutions96@gmail.com
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/75">{children}</p>
    </section>
  );
}

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Volver
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">Aviso de Privacidad</h1>
        <p className="mt-2 text-white/70 text-sm">
          Última actualización: {/* pon fecha */} 2025-12-17
        </p>

        <div className="mt-8 space-y-6 text-white/80 leading-relaxed">
          <Section title="1. Datos que recopilamos">
            Email, nombre y foto (si aplica) al iniciar sesión con Google. También podemos registrar actividad básica del producto.
          </Section>

          <Section title="2. Finalidad del tratamiento">
            Autenticación, acceso al servicio, soporte, seguridad, y facturación (cuando aplique).
          </Section>

          <Section title="3. Base legal">
            Consentimiento y/o ejecución del servicio.
          </Section>

          <Section title="4. Almacenamiento y proveedores">
            Podemos usar proveedores como hosting, base de datos y analítica. No vendemos tus datos.
          </Section>

          <Section title="5. Derechos ARCO / Contacto">
            Puedes solicitar acceso, rectificación o eliminación escribiendo a agsolutions96@gmail.com
          </Section>

          <Section title="6. Cambios al aviso">
            Podemos actualizar este aviso. Publicaremos la fecha de actualización.
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

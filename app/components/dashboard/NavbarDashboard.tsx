import Link from "next/link";
import Image from "next/image";

export default function NavbarDashboard() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 backdrop-blur" style={{backgroundColor: "#141414"}}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + Brand */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-neutral-800">
            <Image
              src="/logo-icon.png"
              alt="Promptory AI"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold text-neutral-100">
              Promptory AI
            </div>
            <div className="text-xs text-neutral-400">Dashboard</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard/prompts"
            className="rounded-xl px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Prompts
          </Link>

          <Link
            href="/logout"
            className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition"
          >
            Salir
          </Link>
        </nav>
      </div>
    </header>
  );
}

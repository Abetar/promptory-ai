import NavbarDashboard from "@/app/components/dashboard/NavbarDashboard";
import Breadcrumbs from "@/app/components/dashboard/Breadcrumbs";
import DonateFloatingButton from "@/app/components/DonateFloatingButton";

export const runtime = "nodejs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <NavbarDashboard />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
        <Breadcrumbs />
        <div className="mt-4">{children}</div>
        <DonateFloatingButton />
      </main>
    </div>
  );
}

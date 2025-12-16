import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const email = (session.user?.email || "").toLowerCase();
  const admins = parseAdminEmails();
  if (!admins.includes(email)) redirect("/dashboard");

  return { session, email };
}

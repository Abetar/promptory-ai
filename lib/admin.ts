import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  const admins = getAdminEmails();

  if (!email || !admins.includes(email)) {
    throw new Error("Unauthorized");
  }

  return session;
}

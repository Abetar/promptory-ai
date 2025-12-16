import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import GoogleButton from "./google-button";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <Image src="/logo.png" alt="Promptory AI" width={120} height={120} priority />

        <h1 className="mt-6 text-2xl font-semibold">Promptory AI</h1>
        <p className="mt-2 text-sm text-white/70">
          Inicia sesión para acceder a prompts exclusivos
        </p>

        <div className="mt-8 w-full">
          <GoogleButton />
        </div>
      </div>
    </main>
  );
}

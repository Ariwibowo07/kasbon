import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense-in-depth: middleware sudah redirect, ini jaga-jaga kalau
  // middleware ke-skip (mis. dari cache).
  if (!user) redirect("/login");

  return (
    <main className="min-h-dvh bg-neutral-50 pb-16">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Kasbon</h1>
            <p className="text-xs text-neutral-400">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <DashboardClient />
      </div>
    </main>
  );
}

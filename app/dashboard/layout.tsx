import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/dashboard/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminUser?.is_admin) redirect("/dashboard/login?denied=1");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {children}
    </div>
  );
}

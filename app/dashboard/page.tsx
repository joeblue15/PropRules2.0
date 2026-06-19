import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: props },
    { data: updates },
    { data: discounts },
    { data: hero },
    { data: settings },
  ] = await Promise.all([
    supabase.from("props").select("*, challenges(*), discount:discounts(*)").order("order"),
    supabase.from("updates").select("*, prop:props(id,name,slug,logo_url)").order("date", { ascending: false }),
    supabase.from("discounts").select("*, prop:props(id,name,slug)").order("created_at"),
    supabase.from("hero_content").select("*").single(),
    supabase.from("site_settings").select("*").single(),
  ]);

  return (
    <DashboardClient
      initialProps={props ?? []}
      initialUpdates={updates ?? []}
      initialDiscounts={discounts ?? []}
      initialHero={hero}
      initialSettings={settings}
    />
  );
}

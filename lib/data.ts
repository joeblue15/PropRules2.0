import { createClient } from "./supabase/server";
import type { Prop, Challenge, Update, HeroContent, SiteSettings } from "@/types";

export async function getProps(type?: "CFD" | "Futuros"): Promise<Prop[]> {
  const supabase = await createClient();
  let query = supabase
    .from("props")
    .select(`
      *,
      challenges(id, name, slug, active),
      discount:discounts(*)
    `)
    .eq("active", true)
    .order("order", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return (data as Prop[]) ?? [];
}

export async function getProp(slug: string): Promise<Prop | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("props")
    .select(`
      *,
      challenges(id, name, slug, description, tags, active, order, last_updated),
      discount:discounts(*)
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) { console.error(error); return null; }
  return data as Prop;
}

export async function getChallenge(propSlug: string, challengeSlug: string): Promise<Challenge | null> {
  const supabase = await createClient();

  const { data: prop } = await supabase
    .from("props")
    .select("id")
    .eq("slug", propSlug)
    .single();

  if (!prop) return null;

  const { data, error } = await supabase
    .from("challenges")
    .select(`
      *,
      risk:risk_rules(*, alerts:risk_alerts(*), interpretations:risk_interpretations(*), cases:risk_cases(*)),
      targets:target_rules(*, alerts:target_alerts(*), interpretations:target_interpretations(*), cases:target_cases(*)),
      trading:trading_rules(*, alerts:trading_alerts(*), interpretations:trading_interpretations(*), cases:trading_cases(*)),
      special:special_restrictions(*, alerts:special_alerts(*), interpretations:special_interpretations(*), cases:special_cases(*)),
      funded:funded_rules(*, alerts:funded_alerts(*), interpretations:funded_interpretations(*), cases:funded_cases(*)),
      legal:legal_rules(*, alerts:legal_alerts(*), interpretations:legal_interpretations(*), cases:legal_cases(*)),
      quick_summary:quick_summaries(*)
    `)
    .eq("prop_id", prop.id)
    .eq("slug", challengeSlug)
    .eq("active", true)
    .single();

  if (error) { console.error(error); return null; }
  return data as Challenge;
}

export async function getUpdates(limit?: number): Promise<Update[]> {
  const supabase = await createClient();
  let query = supabase
    .from("updates")
    .select(`*, prop:props(id, name, slug, logo_url)`)
    .eq("active", true)
    .order("date", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return (data as Update[]) ?? [];
}

export async function getHeroContent(): Promise<HeroContent | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("hero_content").select("*").single();
  return data as HeroContent | null;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").single();
  return data as SiteSettings | null;
}

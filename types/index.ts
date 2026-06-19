export type PropType = "CFD" | "Futuros";
export type BadgeColor = "success" | "warning" | "danger" | "info";
export type AlertType = "warning" | "danger" | "info";
export type DrawdownType = "static" | "trailing" | "end-of-day";
export type DrawdownBasis = "equity" | "balance";
export type NewsTrading = "allowed" | "forbidden" | "partial";

export interface PropBadge {
  text: string;
  color: BadgeColor;
}

export interface Discount {
  code: string;
  description: string;
  affiliate_url: string;
  active: boolean;
}

export interface Prop {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  type: PropType;
  secondary_info: string | null;
  badge_text: string | null;
  badge_color: BadgeColor | null;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  // joined
  challenges?: Challenge[];
  discount?: Discount | null;
}

export interface Challenge {
  id: string;
  prop_id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  active: boolean;
  order: number;
  last_updated: string | null;
  created_at: string;
  updated_at: string;
  // joined
  risk?: RiskRules | null;
  targets?: TargetRules | null;
  trading?: TradingRules | null;
  special?: SpecialRestriction[];
  funded?: FundedRules | null;
  legal?: LegalRules | null;
  fine_print?: string | null;
  quick_summary?: QuickSummary | null;
}

export interface QuickSummary {
  id: string;
  challenge_id: string;
  allowed: string[];
  not_allowed: string[];
  attention: string[];
  risk_score: number | null;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  order: number;
}

export interface Interpretation {
  id: string;
  positive: boolean;
  text: string;
  order: number;
}

export interface PracticalCase {
  id: string;
  category: string;
  title: string;
  story: string;
  lesson: string;
  amount_lost: string | null;
  order: number;
}

export interface RiskRules {
  id: string;
  challenge_id: string;
  max_drawdown: string | null;
  daily_drawdown: string | null;
  drawdown_type: DrawdownType | null;
  drawdown_basis: DrawdownBasis | null;
  max_lot_size: string | null;
  hedging: boolean | null;
  max_simultaneous_positions: string | null;
  max_exposure_per_trade: string | null;
  martingale: boolean | null;
  grid_trading: boolean | null;
  alerts: Alert[];
  interpretations: Interpretation[];
  cases: PracticalCase[];
}

export interface TargetRules {
  id: string;
  challenge_id: string;
  phase1_target: string | null;
  phase2_target: string | null;
  consistency_rule: string | null;
  min_trading_days: string | null;
  max_days_to_complete: string | null;
  min_profit: string | null;
  alerts: Alert[];
  interpretations: Interpretation[];
  cases: PracticalCase[];
}

export interface TradingRules {
  id: string;
  challenge_id: string;
  news_trading: NewsTrading | null;
  overnight_holding: boolean | null;
  weekend_holding: boolean | null;
  copy_trading: boolean | null;
  ea_allowed: boolean | null;
  scalping: boolean | null;
  hft: boolean | null;
  latency_arbitrage: boolean | null;
  reverse_arbitrage: boolean | null;
  one_sided_betting: boolean | null;
  operational_restrictions: string | null;
  alerts: Alert[];
  interpretations: Interpretation[];
  cases: PracticalCase[];
}

export interface SpecialRestriction {
  id: string;
  challenge_id: string;
  title: string;
  description: string;
  type: AlertType;
  order: number;
  alerts: Alert[];
  interpretations: Interpretation[];
  cases: PracticalCase[];
}

export interface FundedRules {
  id: string;
  challenge_id: string;
  profit_split: string | null;
  payout_frequency: string | null;
  minimum_payout: string | null;
  scaling_plan: string | null;
  max_account_size: string | null;
  first_withdrawal: string | null;
  alerts: Alert[];
  interpretations: Interpretation[];
  cases: PracticalCase[];
}

export interface LegalRules {
  id: string;
  challenge_id: string;
  vpn_allowed: boolean | null;
  vps_allowed: boolean | null;
  shared_ip: boolean | null;
  multiple_accounts: boolean | null;
  country_restrictions: string | null;
  kyc: string | null;
  abuse_policy: string | null;
  alerts: Alert[];
  interpretations: Interpretation[];
  cases: PracticalCase[];
}

export interface Update {
  id: string;
  prop_id: string;
  title: string;
  detail: string;
  featured: boolean;
  active: boolean;
  date: string;
  created_at: string;
  // joined
  prop?: Pick<Prop, "id" | "name" | "slug" | "logo_url">;
}

export interface HeroContent {
  id: string;
  title_es: string;
  title_en: string;
}

export interface SiteSettings {
  id: string;
  updates_section_active: boolean;
  seo_title_es: string;
  seo_title_en: string;
  seo_description_es: string;
  seo_description_en: string;
}

export interface AdminUser {
  id: string;
  email: string;
  is_admin: boolean;
}

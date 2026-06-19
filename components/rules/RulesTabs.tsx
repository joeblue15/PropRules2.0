"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { AlertCard } from "@/components/ui/AlertCard";
import { RuleRow, BooleanRuleRow } from "@/components/ui/RuleRow";
import { CheckCircle2, XCircle, BookOpen } from "lucide-react";
import type { Challenge } from "@/types";

const TABS = ["summary", "risk", "targets", "trading", "special", "funded", "legal", "fine_print"] as const;
type TabKey = typeof TABS[number];

interface RulesTabsProps {
  challenge: Challenge;
}

export function RulesTabs({ challenge }: RulesTabsProps) {
  const t = useTranslations("rules");
  const [active, setActive] = useState<TabKey>("summary");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 overflow-x-auto no-scrollbar border-b border-[var(--border)] mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
              active === tab
                ? "text-[var(--accent)] border-[var(--accent)]"
                : "text-[var(--muted)] border-transparent hover:text-[var(--foreground)]"
            )}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {active === "summary" && <SummaryTab challenge={challenge} />}
        {active === "risk" && <RiskTab challenge={challenge} />}
        {active === "targets" && <TargetsTab challenge={challenge} />}
        {active === "trading" && <TradingTab challenge={challenge} />}
        {active === "special" && <SpecialTab challenge={challenge} />}
        {active === "funded" && <FundedTab challenge={challenge} />}
        {active === "legal" && <LegalTab challenge={challenge} />}
        {active === "fine_print" && <FinePrintTab challenge={challenge} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SUMMARY TAB
// ─────────────────────────────────────────
function SummaryTab({ challenge }: { challenge: Challenge }) {
  const t = useTranslations("rules.summary");
  const qs = challenge.quick_summary;

  if (!qs) {
    return <p className="text-sm text-[var(--muted)] py-4">{t("noData")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Allowed */}
        <SummaryColumn
          title={t("allowed")}
          items={qs.allowed}
          color="success"
          Icon={CheckCircle2}
        />
        {/* Not allowed */}
        <SummaryColumn
          title={t("notAllowed")}
          items={qs.not_allowed}
          color="danger"
          Icon={XCircle}
        />
        {/* Attention */}
        <SummaryColumn
          title={t("attention")}
          items={qs.attention}
          color="warning"
          Icon={BookOpen}
        />
      </div>

      {/* Risk score */}
      {qs.risk_score !== null && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] mb-2">{t("riskLevel")}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--success)] via-[var(--warning)] to-[var(--danger)]"
                style={{ width: `${(qs.risk_score / 10) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)] data-value">
              {qs.risk_score}/10
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryColumn({
  title, items, color, Icon,
}: {
  title: string;
  items: string[];
  color: "success" | "danger" | "warning";
  Icon: React.ElementType;
}) {
  const colorMap = {
    success: "text-[var(--success)] bg-[var(--success-bg)]",
    danger: "text-[var(--danger)] bg-[var(--danger-bg)]",
    warning: "text-[var(--warning)] bg-[var(--warning-bg)]",
  };

  return (
    <div className={cn("rounded-xl p-4 border border-[var(--border)]", colorMap[color])}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" />
        <p className="text-xs font-semibold">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-[var(--foreground)] leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────
// RISK TAB
// ─────────────────────────────────────────
function RiskTab({ challenge }: { challenge: Challenge }) {
  const t = useTranslations("rules");
  const risk = challenge.risk;
  if (!risk) return <EmptyTab />;

  const drawdownTypeMap: Record<string, string> = {
    static: t("values.static"),
    trailing: t("values.trailing"),
    "end-of-day": t("values.endOfDay"),
  };

  return (
    <div className="space-y-4">
      {risk.alerts?.map((a) => <AlertCard key={a.id} alert={a} />)}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <RuleRow label={t("fields.maxDrawdown")} value={risk.max_drawdown} semantic="bad" />
        <RuleRow label={t("fields.dailyDrawdown")} value={risk.daily_drawdown} semantic="bad" />
        <RuleRow label={t("fields.drawdownType")} value={risk.drawdown_type ? drawdownTypeMap[risk.drawdown_type] : null} semantic="warning" />
        <RuleRow label={t("fields.drawdownBasis")} value={risk.drawdown_basis === "equity" ? t("values.equity") : risk.drawdown_basis === "balance" ? t("values.balance") : null} />
        <RuleRow label={t("fields.maxLotSize")} value={risk.max_lot_size} />
        <BooleanRuleRow label={t("fields.hedging")} value={risk.hedging} positiveIsGood />
        <RuleRow label={t("fields.maxSimultaneousPositions")} value={risk.max_simultaneous_positions} />
        <RuleRow label={t("fields.maxExposurePerTrade")} value={risk.max_exposure_per_trade} />
        <BooleanRuleRow label={t("fields.martingale")} value={risk.martingale} positiveIsGood={false} />
        <BooleanRuleRow label={t("fields.gridTrading")} value={risk.grid_trading} positiveIsGood={false} />
      </div>
      <InterpretationsBlock items={risk.interpretations} />
      <CasesBlock items={risk.cases} />
    </div>
  );
}

// ─────────────────────────────────────────
// TARGETS TAB
// ─────────────────────────────────────────
function TargetsTab({ challenge }: { challenge: Challenge }) {
  const t = useTranslations("rules");
  const targets = challenge.targets;
  if (!targets) return <EmptyTab />;

  return (
    <div className="space-y-4">
      {targets.alerts?.map((a) => <AlertCard key={a.id} alert={a} />)}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <RuleRow label={t("fields.phase1Target")} value={targets.phase1_target} semantic="neutral" />
        <RuleRow label={t("fields.phase2Target")} value={targets.phase2_target} semantic="neutral" />
        <RuleRow label={t("fields.consistencyRule")} value={targets.consistency_rule} semantic="warning" />
        <RuleRow label={t("fields.minTradingDays")} value={targets.min_trading_days} />
        <RuleRow label={t("fields.maxDaysToComplete")} value={targets.max_days_to_complete} />
        <RuleRow label={t("fields.minProfit")} value={targets.min_profit} />
      </div>
      <InterpretationsBlock items={targets.interpretations} />
      <CasesBlock items={targets.cases} />
    </div>
  );
}

// ─────────────────────────────────────────
// TRADING TAB
// ─────────────────────────────────────────
function TradingTab({ challenge }: { challenge: Challenge }) {
  const t = useTranslations("rules");
  const trading = challenge.trading;
  if (!trading) return <EmptyTab />;

  const newsTradingValue =
    trading.news_trading === "allowed" ? t("values.yes")
    : trading.news_trading === "forbidden" ? t("values.no")
    : trading.news_trading === "partial" ? t("values.partial")
    : null;

  const newsSemantic =
    trading.news_trading === "allowed" ? "good"
    : trading.news_trading === "forbidden" ? "bad"
    : "warning" as const;

  return (
    <div className="space-y-4">
      {trading.alerts?.map((a) => <AlertCard key={a.id} alert={a} />)}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <RuleRow label={t("fields.newsTrading")} value={newsTradingValue} semantic={newsSemantic} />
        <BooleanRuleRow label={t("fields.overnightHolding")} value={trading.overnight_holding} positiveIsGood />
        <BooleanRuleRow label={t("fields.weekendHolding")} value={trading.weekend_holding} positiveIsGood />
        <BooleanRuleRow label={t("fields.copyTrading")} value={trading.copy_trading} positiveIsGood={false} />
        <BooleanRuleRow label={t("fields.eaAllowed")} value={trading.ea_allowed} positiveIsGood />
        <BooleanRuleRow label={t("fields.scalping")} value={trading.scalping} positiveIsGood />
        <BooleanRuleRow label={t("fields.hft")} value={trading.hft} positiveIsGood={false} />
        <BooleanRuleRow label={t("fields.latencyArbitrage")} value={trading.latency_arbitrage} positiveIsGood={false} />
        <BooleanRuleRow label={t("fields.reverseArbitrage")} value={trading.reverse_arbitrage} positiveIsGood={false} />
        <BooleanRuleRow label={t("fields.oneSidedBetting")} value={trading.one_sided_betting} positiveIsGood={false} />
        {trading.operational_restrictions && (
          <RuleRow label="Restricciones adicionales" value={trading.operational_restrictions} semantic="warning" />
        )}
      </div>
      <InterpretationsBlock items={trading.interpretations} />
      <CasesBlock items={trading.cases} />
    </div>
  );
}

// ─────────────────────────────────────────
// SPECIAL RESTRICTIONS TAB
// ─────────────────────────────────────────
function SpecialTab({ challenge }: { challenge: Challenge }) {
  const restrictions = challenge.special;
  if (!restrictions || restrictions.length === 0) return <EmptyTab />;

  return (
    <div className="space-y-4">
      {restrictions.map((r) => (
        <div key={r.id} className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] p-4">
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">{r.title}</p>
          {r.description && (
            <p className="text-xs text-[var(--muted)] leading-relaxed">{r.description}</p>
          )}
          {r.alerts?.map((a) => <AlertCard key={a.id} alert={a} className="mt-3" />)}
          <InterpretationsBlock items={r.interpretations} />
          <CasesBlock items={r.cases} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// FUNDED TAB
// ─────────────────────────────────────────
function FundedTab({ challenge }: { challenge: Challenge }) {
  const t = useTranslations("rules");
  const funded = challenge.funded;
  if (!funded) return <EmptyTab />;

  return (
    <div className="space-y-4">
      {funded.alerts?.map((a) => <AlertCard key={a.id} alert={a} />)}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <RuleRow label={t("fields.profitSplit")} value={funded.profit_split} semantic="good" />
        <RuleRow label={t("fields.payoutFrequency")} value={funded.payout_frequency} />
        <RuleRow label={t("fields.minimumPayout")} value={funded.minimum_payout} />
        <RuleRow label={t("fields.scalingPlan")} value={funded.scaling_plan} />
        <RuleRow label={t("fields.maxAccountSize")} value={funded.max_account_size} />
        <RuleRow label={t("fields.firstWithdrawal")} value={funded.first_withdrawal} />
      </div>
      <InterpretationsBlock items={funded.interpretations} />
      <CasesBlock items={funded.cases} />
    </div>
  );
}

// ─────────────────────────────────────────
// LEGAL TAB
// ─────────────────────────────────────────
function LegalTab({ challenge }: { challenge: Challenge }) {
  const t = useTranslations("rules");
  const legal = challenge.legal;
  if (!legal) return <EmptyTab />;

  return (
    <div className="space-y-4">
      {legal.alerts?.map((a) => <AlertCard key={a.id} alert={a} />)}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <BooleanRuleRow label={t("fields.vpnAllowed")} value={legal.vpn_allowed} positiveIsGood />
        <BooleanRuleRow label={t("fields.vpsAllowed")} value={legal.vps_allowed} positiveIsGood />
        <BooleanRuleRow label={t("fields.sharedIp")} value={legal.shared_ip} positiveIsGood={false} />
        <BooleanRuleRow label={t("fields.multipleAccounts")} value={legal.multiple_accounts} positiveIsGood />
        <RuleRow label={t("fields.countryRestrictions")} value={legal.country_restrictions} semantic="warning" />
        <RuleRow label={t("fields.kyc")} value={legal.kyc} />
        <RuleRow label={t("fields.abusePolicy")} value={legal.abuse_policy} semantic="warning" />
      </div>
      <InterpretationsBlock items={legal.interpretations} />
      <CasesBlock items={legal.cases} />
    </div>
  );
}

// ─────────────────────────────────────────
// FINE PRINT TAB
// ─────────────────────────────────────────
function FinePrintTab({ challenge }: { challenge: Challenge }) {
  if (!challenge.fine_print) return <EmptyTab />;

  return (
    <div className="prose-sm max-w-none">
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">
          {challenge.fine_print}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SHARED BLOCKS
// ─────────────────────────────────────────
function InterpretationsBlock({ items }: { items: Array<{ id: string; positive: boolean; text: string }> | undefined }) {
  const t = useTranslations("rules.interpretation");
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold text-[var(--foreground)] mb-3">{t("title")}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2.5 items-start">
            {item.positive ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-[var(--danger)] flex-shrink-0 mt-0.5" />
            )}
            <span className="text-xs text-[var(--muted)] leading-relaxed">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CasesBlock({ items }: { items: Array<{ id: string; category?: string | null; title: string; story?: string | null; lesson?: string | null; amount_lost?: string | null }> | undefined }) {
  const t = useTranslations("rules.examples");
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-[var(--foreground)]">{t("title")}</p>
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          {item.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] font-medium">
              {item.category}
            </span>
          )}
          <p className="text-sm font-medium text-[var(--foreground)] mt-2 mb-1">{item.title}</p>
          {item.amount_lost && (
            <p className="text-xs text-[var(--danger)] font-medium mb-2">
              {t("amountLost")}: {item.amount_lost}
            </p>
          )}
          {item.story && (
            <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">{item.story}</p>
          )}
          {item.lesson && (
            <div className="border-t border-[var(--border-subtle)] pt-3">
              <p className="text-[11px] font-semibold text-[var(--foreground)] mb-0.5">{t("lesson")}</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{item.lesson}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyTab() {
  return (
    <p className="text-sm text-[var(--muted)] py-8 text-center">
      Sin información registrada todavía.
    </p>
  );
}

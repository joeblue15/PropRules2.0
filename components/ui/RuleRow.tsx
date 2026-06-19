"use client";
import { cn } from "@/lib/utils";

type ValueSemantic = "good" | "bad" | "warning" | "neutral" | "na";

interface RuleRowProps {
  label: string;
  value: string | null | undefined;
  semantic?: ValueSemantic;
  className?: string;
}

const VALUE_COLORS: Record<ValueSemantic, string> = {
  good: "text-[var(--success)]",
  bad: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  neutral: "text-[var(--foreground)]",
  na: "text-[var(--muted-2)]",
};

export function RuleRow({ label, value, semantic = "neutral", className }: RuleRowProps) {
  const displayValue = value ?? "N/D";
  const resolvedSemantic = !value ? "na" : semantic;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 py-2.5 px-3 border-b border-[var(--border-subtle)] last:border-b-0",
        className
      )}
    >
      <span className="text-xs text-[var(--muted)] flex-shrink-0 leading-relaxed">{label}</span>
      <span
        className={cn(
          "text-xs font-medium text-right leading-relaxed data-value",
          VALUE_COLORS[resolvedSemantic]
        )}
      >
        {displayValue}
      </span>
    </div>
  );
}

export function BooleanRuleRow({
  label,
  value,
  positiveIsGood = true,
}: {
  label: string;
  value: boolean | null | undefined;
  positiveIsGood?: boolean;
}) {
  if (value === null || value === undefined) {
    return <RuleRow label={label} value={null} />;
  }

  const text = value ? "Permitido" : "No permitido";
  const semantic: ValueSemantic = value
    ? positiveIsGood ? "good" : "bad"
    : positiveIsGood ? "bad" : "good";

  return <RuleRow label={label} value={text} semantic={semantic} />;
}

"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tag, Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Discount } from "@/types";

interface DiscountBarProps {
  discount: Discount;
  propName: string;
}

export function DiscountBar({ discount, propName }: DiscountBarProps) {
  const t = useTranslations("rules.discount");
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(discount.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="sticky top-14 z-30 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
      <Tag className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-[var(--muted)]">{t("code")}: </span>
        <span className="text-xs font-mono font-semibold text-[var(--foreground)]">{discount.code}</span>
        {discount.description && (
          <span className="text-xs text-[var(--muted)] ml-2">— {discount.description}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={copyCode}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-all",
            copied
              ? "bg-[var(--success-bg)] text-[var(--success)]"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
          )}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? t("copied") : t("copy")}
        </button>
        {discount.affiliate_url && (
          <a
            href={discount.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            {t("go")}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

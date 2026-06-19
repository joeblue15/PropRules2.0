"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ChallengeModal } from "./ChallengeModal";
import { timeAgo } from "@/lib/utils";
import type { Prop } from "@/types";

interface PropListProps {
  props: Prop[];
  searchQuery?: string;
}

export function PropList({ props, searchQuery = "" }: PropListProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);

  const filtered = props.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)] py-8 text-center">{t("noProps")}</p>
    );
  }

  function handleViewRules(prop: Prop) {
    const activeChallenges = prop.challenges?.filter((c) => c.active) ?? [];
    if (activeChallenges.length === 1) {
      window.location.href = `/${locale}/${prop.slug}/${activeChallenges[0].slug}`;
    } else {
      setSelectedProp(prop);
    }
  }

  return (
    <>
      <div className="divide-y divide-[var(--border-subtle)]">
        {filtered.map((prop) => {
          const activeChallenges = prop.challenges?.filter((c) => c.active) ?? [];
          const challengeText =
            activeChallenges.length === 1
              ? t("challengeCount")
              : t("challengesCount", { count: activeChallenges.length });

          return (
            <div
              key={prop.id}
              className="flex items-center gap-4 py-3.5 px-1 group hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
              onClick={() => handleViewRules(prop)}
            >
              {/* Logo */}
              <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {prop.logo_url ? (
                  <Image
                    src={prop.logo_url}
                    alt={prop.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase">
                    {prop.name.slice(0, 3)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[var(--foreground)]">{prop.name}</span>
                  {prop.badge_text && prop.badge_color && (
                    <Badge text={prop.badge_text} color={prop.badge_color} />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {activeChallenges.length > 0 && (
                    <span className="text-xs text-[var(--muted-2)]">{challengeText}</span>
                  )}
                  {prop.secondary_info && (
                    <>
                      {activeChallenges.length > 0 && (
                        <span className="text-[var(--border)] text-xs">·</span>
                      )}
                      <span className="text-xs text-[var(--muted-2)]">{prop.secondary_info}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0 px-2.5 py-1.5 rounded-md group-hover:bg-[var(--accent)]/10"
                onClick={(e) => { e.stopPropagation(); handleViewRules(prop); }}
              >
                {t("viewRules")}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {selectedProp && (
        <ChallengeModal
          prop={selectedProp}
          onClose={() => setSelectedProp(null)}
        />
      )}
    </>
  );
}

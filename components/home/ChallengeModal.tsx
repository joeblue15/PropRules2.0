"use client";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prop } from "@/types";

interface ChallengeModalProps {
  prop: Prop;
  onClose: () => void;
}

export function ChallengeModal({ prop, onClose }: ChallengeModalProps) {
  const locale = useLocale();
  const t = useTranslations("modal");
  const overlayRef = useRef<HTMLDivElement>(null);

  const activeChallenges = prop.challenges?.filter((c) => c.active) ?? [];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function navigate(challengeSlug: string) {
    window.location.href = `/${locale}/${prop.slug}/${challengeSlug}`;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet / Modal */}
      <div
        className={cn(
          "relative bg-[var(--surface)] border border-[var(--border)] shadow-2xl z-10 w-full",
          "rounded-t-2xl md:rounded-2xl md:max-w-md md:mx-4"
        )}
      >
        {/* Handle bar — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {prop.logo_url ? (
              <Image src={prop.logo_url} alt={prop.name} width={32} height={32} className="object-contain" />
            ) : (
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase">{prop.name.slice(0, 3)}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">{prop.name}</p>
            <p className="text-xs text-[var(--muted)]">{t("selectChallenge")}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Challenge list */}
        <div className="divide-y divide-[var(--border-subtle)] max-h-[60vh] overflow-y-auto">
          {activeChallenges.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => navigate(challenge.slug)}
              className="w-full flex items-center gap-3 p-4 hover:bg-[var(--surface-hover)] transition-colors text-left group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] mb-0.5">{challenge.name}</p>
                {challenge.description && (
                  <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2 mb-1.5">
                    {challenge.description}
                  </p>
                )}
                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {challenge.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--muted-2)] group-hover:text-[var(--accent)] flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>

        {/* Footer padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}

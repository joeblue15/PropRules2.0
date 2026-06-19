"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { X, Clock } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { Update } from "@/types";

interface UpdatesListProps {
  updates: Update[];
}

export function UpdatesList({ updates }: UpdatesListProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const [selected, setSelected] = useState<Update | null>(null);

  if (updates.length === 0) return null;

  return (
    <>
      <div className="divide-y divide-[var(--border-subtle)]">
        {updates.map((update) => (
          <div
            key={update.id}
            className="flex items-center gap-3 py-3.5 px-1 hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer group"
            onClick={() => setSelected(update)}
          >
            {/* Prop logo */}
            <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {update.prop?.logo_url ? (
                <Image src={update.prop.logo_url} alt={update.prop.name ?? ""} width={24} height={24} className="object-contain" />
              ) : (
                <span className="text-[9px] font-bold text-[var(--muted)] uppercase">
                  {update.prop?.name?.slice(0, 3)}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--foreground)]">{update.prop?.name}</span>
                {update.featured && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-medium">
                    Destacado
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)] truncate mt-0.5">{update.title}</p>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-[11px] text-[var(--muted-2)] flex-shrink-0">
              <Clock className="w-3 h-3" />
              {timeAgo(update.date, locale)}
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full z-10 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selected.prop?.logo_url ? (
                  <Image src={selected.prop.logo_url} alt="" width={24} height={24} className="object-contain" />
                ) : (
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase">{selected.prop?.name?.slice(0, 3)}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-[var(--muted)] mb-0.5">{selected.prop?.name}</p>
                <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">{selected.title}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            {selected.detail && (
              <p className="text-sm text-[var(--muted)] leading-relaxed">{selected.detail}</p>
            )}
            <p className="text-[11px] text-[var(--muted-2)] mt-4">{timeAgo(selected.date, locale)}</p>
          </div>
        </div>
      )}
    </>
  );
}

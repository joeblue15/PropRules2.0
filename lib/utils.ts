import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function timeAgo(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return locale === "es" ? "hoy" : "today";
  if (diffDays === 1) return locale === "es" ? "hace 1 día" : "1 day ago";
  if (diffDays < 7) return locale === "es" ? `hace ${diffDays} días` : `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return locale === "es" ? "hace 1 semana" : "1 week ago";
  if (diffWeeks < 5) return locale === "es" ? `hace ${diffWeeks} semanas` : `${diffWeeks} weeks ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return locale === "es" ? "hace 1 mes" : "1 month ago";
  return locale === "es" ? `hace ${diffMonths} meses` : `${diffMonths} months ago`;
}

export function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const BADGE_STYLES: Record<string, string> = {
  success: "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/20",
  warning: "bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]/20",
  danger: "bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]/20",
  info: "bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info)]/20",
};

export const ALERT_STYLES: Record<string, { container: string; icon: string }> = {
  warning: {
    container: "bg-[var(--warning-bg)] border-l-2 border-[var(--warning)]",
    icon: "text-[var(--warning)]",
  },
  danger: {
    container: "bg-[var(--danger-bg)] border-l-2 border-[var(--danger)]",
    icon: "text-[var(--danger)]",
  },
  info: {
    container: "bg-[var(--info-bg)] border-l-2 border-[var(--info)]",
    icon: "text-[var(--info)]",
  },
};

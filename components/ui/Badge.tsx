"use client";
import { cn, BADGE_STYLES } from "@/lib/utils";
import type { BadgeColor } from "@/types";

interface BadgeProps {
  text: string;
  color: BadgeColor;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ text, color, className, size = "sm" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        BADGE_STYLES[color],
        className
      )}
    >
      {text}
    </span>
  );
}

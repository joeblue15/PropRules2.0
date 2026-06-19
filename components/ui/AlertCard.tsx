"use client";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn, ALERT_STYLES } from "@/lib/utils";
import type { Alert, AlertType } from "@/types";

const ICONS: Record<AlertType, React.ElementType> = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
};

interface AlertCardProps {
  alert: Alert;
  className?: string;
}

export function AlertCard({ alert, className }: AlertCardProps) {
  const styles = ALERT_STYLES[alert.type];
  const Icon = ICONS[alert.type];

  return (
    <div className={cn("flex gap-3 p-3 rounded-lg", styles.container, className)}>
      <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", styles.icon)} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] leading-snug">{alert.title}</p>
        {alert.description && (
          <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{alert.description}</p>
        )}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

interface StatusBadgeProps {
  tone: Tone;
  children: ReactNode;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

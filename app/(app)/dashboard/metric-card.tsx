import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: LucideIcon;
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-[#e8eaed] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-700">{title}</p>
        {Icon ? (
          <Icon
            className="size-4 shrink-0 text-zinc-400"
            strokeWidth={1.75}
            aria-hidden
          />
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
    </div>
  );
}

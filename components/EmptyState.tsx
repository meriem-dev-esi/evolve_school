import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-3xl shadow-inner">
        {icon || "📦"}
      </div>

      <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200 active:scale-95"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

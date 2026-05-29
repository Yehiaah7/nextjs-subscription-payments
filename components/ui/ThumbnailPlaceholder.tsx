import { cn } from '@/utils/cn';

type ThumbnailPlaceholderProps = {
  fallback: string;
  className?: string;
  contentClassName?: string;
};

export default function ThumbnailPlaceholder({
  fallback,
  className,
  contentClassName
}: ThumbnailPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative grid place-items-center overflow-hidden rounded-full border border-border bg-gradient-to-br from-slate-100 via-white to-blue-100 shadow-[0_6px_18px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]',
        className
      )}
    >
      <span className="pointer-events-none absolute inset-[8%] rounded-full border border-border" />
      <span className="pointer-events-none absolute right-[16%] top-[16%] h-[18%] w-[18%] rounded-full bg-white/70 shadow-[0_1px_2px_rgba(15,23,42,0.08)]" />
      <span
        className={cn(
          'relative z-10 select-none text-sm font-semibold uppercase tracking-[0.03em] text-slate-600',
          contentClassName
        )}
      >
        {fallback}
      </span>
    </div>
  );
}

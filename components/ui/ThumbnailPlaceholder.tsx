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
        'grid place-items-center rounded-[12px] border border-slate-200 bg-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
        className
      )}
    >
      <span
        className={cn(
          'select-none text-sm font-semibold uppercase tracking-[0.02em] text-slate-500',
          contentClassName
        )}
      >
        {fallback}
      </span>
    </div>
  );
}

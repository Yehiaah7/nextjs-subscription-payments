import { cn } from '@/utils/cn';

type ThumbnailPlaceholderProps = {
  className?: string;
  characterClassName?: string;
  fallback?: string;
  contentClassName?: string;
};

export default function ThumbnailPlaceholder({
  className,
  characterClassName
}: ThumbnailPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]',
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        className={cn('h-full w-full', characterClassName)}
        role="presentation"
      >
        <rect x="0" y="0" width="64" height="64" fill="#dbeafe" />
        <rect x="0" y="0" width="64" height="28" fill="#eff6ff" opacity="0.9" />
        <circle cx="50" cy="14" r="8" fill="#bfdbfe" opacity="0.65" />
        <circle cx="14" cy="18" r="6" fill="#dbeafe" opacity="0.75" />

        <path
          d="M16 62c2-10 9-16 16-16s14 6 16 16"
          fill="#2563eb"
        />
        <path d="M32 16c-7.2 0-13 5.8-13 13s5.8 13 13 13 13-5.8 13-13-5.8-13-13-13z" fill="#fde9d8" />
        <path
          d="M45 28c0-7.2-5.8-13-13-13-5.2 0-9.7 3-11.8 7.4 1.8.8 3.9 1.2 6.2 1.2 8.2 0 14.8-5.4 18.2-8.7.9 1.7 1.4 3.6 1.4 5.6z"
          fill="#1e293b"
        />
        <circle cx="27" cy="29" r="1.4" fill="#334155" />
        <circle cx="37" cy="29" r="1.4" fill="#334155" />
        <path d="M27 35c1.6 1.7 3.2 2.5 5 2.5s3.4-.8 5-2.5" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

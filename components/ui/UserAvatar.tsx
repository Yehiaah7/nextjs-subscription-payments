import { cn } from '@/utils/cn';
import { getUserInitials, type UserInitialsInput } from '@/utils/user-avatar';

type UserAvatarProps = UserInitialsInput & {
  imageUrl?: string | null;
  className?: string;
  initialsClassName?: string;
  alt?: string;
};

export default function UserAvatar({
  imageUrl,
  firstName,
  lastName,
  fullName,
  email,
  className,
  initialsClassName,
  alt
}: UserAvatarProps) {
  const initials = getUserInitials({ firstName, lastName, fullName, email });

  if (imageUrl) {
    return (
      <div className={cn('relative overflow-hidden rounded-full', className)}>
        <img
          src={imageUrl}
          alt={alt ?? 'User avatar'}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative grid place-items-center overflow-hidden rounded-full border border-rose-200/80 bg-gradient-to-br from-rose-700 via-rose-500 to-orange-400 shadow-[0_8px_20px_rgba(136,19,55,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]',
        className
      )}
    >
      <span className="pointer-events-none absolute inset-[8%] rounded-full border border-white/25" />
      <span className="pointer-events-none absolute right-[16%] top-[16%] h-[18%] w-[18%] rounded-full bg-white/25 blur-[0.5px]" />
      <span
        className={cn(
          'relative z-10 select-none text-sm font-bold uppercase tracking-[0.04em] text-white',
          initialsClassName
        )}
      >
        {initials}
      </span>
    </div>
  );
}

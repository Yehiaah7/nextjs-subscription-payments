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
        'grid place-items-center overflow-hidden rounded-full bg-gradient-to-br from-rose-700 via-rose-500 to-orange-400',
        className
      )}
    >
      <span
        className={cn(
          'select-none text-sm font-bold uppercase tracking-[0.04em] text-white',
          initialsClassName
        )}
      >
        {initials}
      </span>
    </div>
  );
}

import Image from 'next/image';
import { cn } from '@/utils/cn';
import { getCompanyInitial, getCompanyLogoPath } from './company-logos';

type CompanyThumbnailProps = {
  companyName: string;
  className?: string;
  iconClassName?: string;
};

export default function CompanyThumbnail({
  companyName,
  className,
  iconClassName
}: CompanyThumbnailProps) {
  const logoPath = getCompanyLogoPath(companyName);

  return (
    <div
      className={cn(
        'grid h-14 w-14 shrink-0 place-items-center rounded-card bg-container text-muted',
        className
      )}
      aria-hidden
    >
      {logoPath ? (
        <Image
          src={logoPath}
          alt={`${companyName} logo`}
          width={36}
          height={36}
          className={cn('h-9 w-9 object-contain', iconClassName)}
        />
      ) : (
        <span className="text-xl font-black leading-none">
          {getCompanyInitial(companyName)}
        </span>
      )}
    </div>
  );
}

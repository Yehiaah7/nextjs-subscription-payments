import Image from 'next/image';
import { getCompanyLogoSrc } from './company-logo';

type CompanyThumbnailProps = {
  companyName: string;
  className?: string;
};

export default function CompanyThumbnail({
  companyName,
  className
}: CompanyThumbnailProps) {
  const logoSrc = getCompanyLogoSrc(companyName);

  return (
    <div
      className={
        className ??
        'grid h-14 w-14 shrink-0 place-items-center rounded-card bg-container text-muted'
      }
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`${companyName} logo`}
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      ) : (
        <div className="text-lg font-bold text-muted">
          {companyName[0]?.toUpperCase() ?? 'C'}
        </div>
      )}
    </div>
  );
}

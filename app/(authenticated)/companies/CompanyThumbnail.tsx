import Image from 'next/image';
import { getCompanyLogoSrc } from './company-logo';

type CompanyThumbnailProps = {
  companyId?: string;
  companyName: string;
  companyLogoSrc?: string | null;
  className?: string;
};

export default function CompanyThumbnail({
  companyId,
  companyName,
  companyLogoSrc,
  className
}: CompanyThumbnailProps) {
  const logoSrc =
    companyLogoSrc ??
    getCompanyLogoSrc({
      companyId,
      companyName
    });

  return (
    <div
      className={
        className ??
        'relative h-14 w-14 shrink-0 overflow-hidden rounded-card bg-container text-muted'
      }
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`${companyName} logo`}
          fill
          sizes="56px"
          className="object-contain object-center p-[2px]"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-lg font-bold text-muted">
          {companyName[0]?.toUpperCase() ?? 'C'}
        </div>
      )}
    </div>
  );
}

import Image from 'next/image';
import { getCompanyLogoSrc } from './company-logo';
import ThumbnailPlaceholder from '@/components/ui/ThumbnailPlaceholder';

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
        'relative h-14 w-14 shrink-0 overflow-hidden rounded-card bg-white text-muted'
      }
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`${companyName} logo`}
          fill
          sizes="56px"
          className="object-contain object-center p-1"
        />
      ) : (
        <ThumbnailPlaceholder
          fallback={companyName[0]?.toUpperCase() ?? 'C'}
          className="h-full w-full"
          contentClassName="text-lg font-bold text-slate-500"
        />
      )}
    </div>
  );
}

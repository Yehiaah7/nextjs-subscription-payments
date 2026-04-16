import { CircleDot, UserRound } from 'lucide-react';
import { ReactNode } from 'react';
import type { CompanySummary } from './company-summary';
import CompanyThumbnail from './CompanyThumbnail';

type CompanySummaryCardProps = {
  company: CompanySummary;
  footer?: ReactNode;
  className?: string;
};

export default function CompanySummaryCard({
  company,
  footer,
  className
}: CompanySummaryCardProps) {
  return (
    <article className={className}>
      <div className="mb-3 flex items-start gap-3">
        <CompanyThumbnail
          companyId={company.id}
          companyName={company.name}
          companyLogoSrc={company.logo}
        />
        <div>
          <h2 className="t-card-title text-[22px]">{company.name}</h2>
          {company.focus ? <p className="t-body-muted">Focus: {company.focus}</p> : null}
          <div className="t-label mt-1 flex items-center gap-3 text-muted">
            <span className="flex items-center gap-1">
              <CircleDot className="h-4 w-4" />
              {company.challengesCount} Challenges
            </span>
            <span className="flex items-center gap-1">
              <UserRound className="h-4 w-4" />
              {company.practicingCount} Practicing
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 h-2.5 rounded-pill bg-surface-soft">
        <div
          className="h-full rounded-pill bg-primary"
          style={{ width: `${Math.max(0, Math.min(100, company.progress))}%` }}
        />
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </article>
  );
}

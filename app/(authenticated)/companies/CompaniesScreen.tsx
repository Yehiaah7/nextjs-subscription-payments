import { ChevronLeft, ChevronRight, CircleDot, UserRound } from 'lucide-react';
import Link from 'next/link';
import { getCompanyHref } from './navigation';

export type CompanyTrack = { id: string; title: string; focus: string; challengesCount: number; practicingCount: string; progress: number; };

function GoogleGlyph() {
  return <span className="text-[20px] font-black leading-none" aria-hidden><span className="text-[#4285f4]">G</span><span className="text-[#ea4335]">•</span><span className="text-[#fbbc05]">•</span><span className="text-[#34a853]">•</span></span>;
}

export default function CompaniesScreen({ companyTracks }: { companyTracks: CompanyTrack[] }) {
  return (
    <section>
      <header className="mb-4 flex items-center gap-3"><Link href="/home" className="grid h-9 w-9 place-items-center rounded-button bg-surface-muted text-muted" aria-label="Back to home"><ChevronLeft className="h-5 w-5" /></Link><h1 className="t-title">All Companies</h1></header>
      <div className="space-y-4 pb-8">{companyTracks.map((track) => <Link key={track.id} href={getCompanyHref(track.id)} className="app-card block cursor-pointer"><div className="mb-3 flex items-start gap-3"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-card bg-container"><GoogleGlyph /></div><div><h2 className="t-card-title text-[22px]">{track.title}</h2><p className="t-body-muted">Focus: {track.focus}</p><div className="t-label mt-1 flex items-center gap-3 text-muted"><span className="flex items-center gap-1"><CircleDot className="h-4 w-4" />{track.challengesCount} Challenges</span><span className="flex items-center gap-1"><UserRound className="h-4 w-4" />{track.practicingCount} Practicing</span></div></div></div><div className="flex items-center gap-3"><div className="h-2.5 flex-1 rounded-pill bg-surface-soft"><div className="h-full rounded-pill bg-primary" style={{ width: `${Math.max(0, Math.min(100, track.progress))}%` }} /></div><span className="t-label text-primary">Resume</span><span className="grid h-8 w-8 place-items-center rounded-pill bg-primary-soft text-primary" aria-label={`Resume ${track.title}`}><ChevronRight className="h-4 w-4" /></span></div></Link>)}</div>
    </section>
  );
}

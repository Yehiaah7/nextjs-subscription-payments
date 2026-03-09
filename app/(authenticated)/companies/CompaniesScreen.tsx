import { ChevronLeft, ChevronRight, CircleDot, UserRound } from 'lucide-react';
import Link from 'next/link';
import { getCompanyHref } from './navigation';

export type CompanyTrack = {
  id: string;
  title: string;
  focus: string;
  challengesCount: number;
  practicingCount: string;
  progress: number;
};

function GoogleGlyph() {
  return (
    <span className="text-[34px] font-black leading-none" aria-hidden>
      <span className="text-[#4285f4]">G</span>
      <span className="text-[#ea4335]">•</span>
      <span className="text-[#fbbc05]">•</span>
      <span className="text-[#34a853]">•</span>
    </span>
  );
}

export default function CompaniesScreen({
  companyTracks
}: {
  companyTracks: CompanyTrack[];
}) {
  return (
    <section className="min-h-dvh bg-[#e9edf3] px-4 py-5 text-[#1f2937]">
      <div className="mx-auto w-full max-w-[680px]">
        <header className="mb-4 flex items-center gap-4">
          <Link
            href="/home"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef2f6] text-[#a0aec0]"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[53px] font-bold leading-none tracking-[-0.02em] text-[#1f2937]">
            All Companies
          </h1>
        </header>

        <div className="space-y-4 pb-8">
          {companyTracks.map((track) => (
            <Link
              key={track.id}
              href={getCompanyHref(track.id)}
              className="block cursor-pointer rounded-[26px] bg-[#f3f5f7] px-4 py-3"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white">
                  <GoogleGlyph />
                </div>
                <div>
                  <h2 className="text-[42px] font-bold leading-none text-[#1f2937]">
                    {track.title}
                  </h2>
                  <p className="mt-1 text-[31px] font-semibold leading-tight text-[#7d8ea5]">
                    Focus: {track.focus}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[20px] font-bold uppercase tracking-[0.03em] text-[#9caabf]">
                    <span className="flex items-center gap-1">
                      <CircleDot className="h-4 w-4" />
                      {track.challengesCount} Challenges
                    </span>
                    <span className="flex items-center gap-1">
                      <UserRound className="h-4 w-4" />
                      {track.practicingCount} Practicing
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 rounded-full bg-[#e4eaf1]">
                  <div
                    className="h-full rounded-full bg-[#2563eb]"
                    style={{
                      width: `${Math.max(0, Math.min(100, track.progress))}%`
                    }}
                  />
                </div>
                <span className="text-[25px] font-bold text-[#90a0b6]">
                  {track.progress}%
                </span>
                <span className="text-[25px] font-bold uppercase tracking-[0.08em] text-[#2563eb]">
                  Resume
                </span>
                <span
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#e8edf8] text-[#6d9eff]"
                  aria-label={`Resume ${track.title}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

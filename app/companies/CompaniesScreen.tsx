import { ChevronLeft, ChevronRight, CircleDot, UserRound } from 'lucide-react';
import Link from 'next/link';

export type CompanyTrack = {
  id: string;
  title: string;
  focus: string;
  challengesCount: number;
  practicingCount: string;
  progress: number;
};

export default function CompaniesScreen({
  companyTracks
}: {
  companyTracks: CompanyTrack[];
}) {
  return (
    <section className="min-h-dvh bg-[#e9edf3] px-4 py-6 text-[#1f2937]">
      <div className="mx-auto w-full max-w-[590px]">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/home"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf1f6] text-[#94a3b8]"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[48px] font-bold leading-none tracking-[-0.02em] text-[#111827]">
            All Companies
          </h1>
        </header>

        <div className="space-y-4 pb-6">
          {companyTracks.map((track) => (
            <article key={track.id} className="rounded-3xl bg-[#f3f4f6] p-4">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl font-bold text-[#4285f4]">
                  G
                </div>
                <div>
                  <h2 className="text-[38px] font-bold leading-none text-[#1f2937]">
                    {track.title}
                  </h2>
                  <p className="mt-1 text-[28px] font-semibold leading-tight text-[#64748b]">
                    Focus: {track.focus}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-lg font-bold uppercase tracking-[0.03em] text-[#94a3b8]">
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
                <div className="h-2 flex-1 rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full bg-[#2563eb]"
                    style={{
                      width: `${Math.max(0, Math.min(100, track.progress))}%`
                    }}
                  />
                </div>
                <span className="text-lg font-bold text-[#94a3b8]">
                  {track.progress}%
                </span>
                <button className="text-lg font-bold uppercase tracking-[0.08em] text-[#2563eb]">
                  Resume
                </button>
                <button
                  className="grid h-7 w-7 place-items-center rounded-full bg-[#e8eef9] text-[#60a5fa]"
                  aria-label={`Resume ${track.title}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

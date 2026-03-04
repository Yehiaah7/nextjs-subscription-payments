import Link from 'next/link';

type FeedbackVariant = 'correct' | 'wrong';

const COPY = {
  correct: {
    title: 'Decision Correct',
    subtitle: 'Great call — your choice aligns with the strongest strategy here.',
    statusLabel: 'Correct',
    statusClass: 'bg-emerald-100 text-emerald-700',
    iconWrapperClass: 'bg-emerald-100 text-emerald-600',
    insight:
      'You identified the highest-leverage decision first. In interview settings, this shows structured thinking and prioritization under pressure.',
    impacts: ['Signal clarity', 'Better trade-offs', 'Execution confidence']
  },
  wrong: {
    title: 'Decision Incorrect',
    subtitle: 'Not this time — review the reasoning and try the next challenge.',
    statusLabel: 'Needs Review',
    statusClass: 'bg-rose-100 text-rose-700',
    iconWrapperClass: 'bg-rose-100 text-rose-600',
    insight:
      'The selected option overlooked a key constraint. Consider risk, timeline, and measurable outcomes before committing to a final decision.',
    impacts: ['Missed constraint', 'Lower confidence', 'Risk exposure']
  }
} as const;

function getNextChallengeId(challengeId: string) {
  const numericChallengeId = Number.parseInt(challengeId, 10);

  if (Number.isNaN(numericChallengeId)) {
    return `${challengeId}-next`;
  }

  return String(numericChallengeId + 1);
}

export default function FeedbackScreen({
  challengeId,
  variant
}: {
  challengeId: string;
  variant: FeedbackVariant;
}) {
  const content = COPY[variant];
  const nextChallengeId = getNextChallengeId(challengeId);

  return (
    <main className="min-h-screen bg-[#fffaf4] px-6 py-10 text-[#111827] sm:px-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <section className="rounded-3xl bg-white p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          <div
            className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full text-3xl font-bold ${content.iconWrapperClass}`}
            aria-hidden
          >
            {variant === 'correct' ? '✓' : '✕'}
          </div>

          <h1 className="text-4xl font-black tracking-[-0.02em]">{content.title}</h1>
          <p className="mt-2 text-base text-slate-500">{content.subtitle}</p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Progress</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${content.statusClass}`}
            >
              {content.statusLabel}
            </span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[75%] rounded-full bg-[#4f46e5]" />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-600">75% complete • Problem #4 of 5</p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.07)]">
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">Insight</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-700">{content.insight}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {content.impacts.map((impact) => (
              <span
                key={impact}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {impact}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/challenge/${nextChallengeId}`}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#4f46e5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4338ca]"
          >
            Next Challenge
          </Link>
          <Link
            href="/tracks"
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Return to Track
          </Link>
        </div>
      </div>
    </main>
  );
}

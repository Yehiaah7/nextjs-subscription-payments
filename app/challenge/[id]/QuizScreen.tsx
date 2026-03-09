'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Choice = {
  id: 'A' | 'B' | 'C' | 'D';
  title: string;
  description: string;
};

type QuizQuestion = {
  category: string;
  title: string;
  prompt: string;
  context: string;
  timerLabel: string;
  choices: Choice[];
  perspective: {
    speaker: string;
    role: string;
    title: string;
    summary: string;
  }[];
};

const QUESTION: QuizQuestion = {
  category: 'Strategic Prioritization',
  title: 'Trust vs. Engagement Dilemma',
  prompt:
    'A major data leak has been discovered. Engineers can patch it in 48 hours, but it will cause a 15% drop in session duration for the next week during a critical quarterly reporting period.',
  context: 'Business metrics or User safety? You have 3 minutes to decide.',
  timerLabel: '2:53',
  choices: [
    {
      id: 'A',
      title: 'Immediate Patch',
      description:
        'Prioritize the fix now. Accept the engagement hit and prepare the PR team.'
    },
    {
      id: 'B',
      title: 'Soft Patch',
      description:
        'Apply a temporary fix that maintains engagement but leaves a 5% vulnerability risk.'
    },
    {
      id: 'C',
      title: 'Staged Rollout',
      description:
        'Roll out the patch to high-risk regions first to minimize global impact.'
    },
    {
      id: 'D',
      title: 'Postpone and Bundle',
      description: 'Delay the patch to next week to clear the reporting period.'
    }
  ],
  perspective: [
    {
      speaker: 'Sarah',
      role: 'Group PM @ Meta',
      title: "Sarah Chen's Perspective",
      summary:
        "Trust is the ultimate currency. At Meta's scale, sacrificing safety for short-term reporting engagement is a one-way door decision you can't undo."
    },
    {
      speaker: 'Marcus',
      role: 'Director PM',
      title: "Marcus James's Perspective",
      summary:
        'Great PMs optimize for resilience, not just quarter-end numbers. Preserving trust compounds value far beyond a temporary performance dip.'
    },
    {
      speaker: 'Elena',
      role: 'Staff PM',
      title: "Elena Rivera's Perspective",
      summary:
        'Users forgive downtime and temporary friction. They rarely forgive breaches of trust. The strategic bet is clear: protect users first.'
    }
  ]
};

export default function QuizScreen({ challengeId }: { challengeId: string }) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<Choice['id'] | null>(
    null
  );
  const searchParams = useSearchParams();

  const companyId = searchParams.get('companyId');
  const returnToTrackHref = companyId
    ? `/companies/${companyId}`
    : '/companies';

  const nextHref = useMemo(() => {
    if (!selectedChoiceId) {
      return null;
    }

    const resultRoute =
      selectedChoiceId === 'A' || selectedChoiceId === 'B'
        ? 'correct'
        : 'wrong';
    const querySuffix = companyId ? `?companyId=${companyId}` : '';

    return `/challenge/${challengeId}/${resultRoute}${querySuffix}`;
  }, [challengeId, companyId, selectedChoiceId]);

  return (
    <main className="mx-auto min-h-screen max-w-[460px] bg-[#e9edf2] px-4 pb-5 pt-5 text-[#111827] md:mt-6 md:rounded-[28px] md:shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
      <header className="mb-5 flex items-center justify-between">
        <Link
          href={returnToTrackHref}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1e6ed] text-[#9da9b8]"
          aria-label="Back to tracks"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#07234d] px-4 py-2 text-xs font-black text-white shadow-[0_10px_20px_rgba(6,17,39,0.2)]">
          <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
          {QUESTION.timerLabel}
        </div>
      </header>

      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#2f64ff]">
        {QUESTION.category}
      </p>
      <h1 className="mt-3 text-[40px] font-black leading-[1.04] tracking-[-0.03em] text-[#1f2937]">
        {QUESTION.title}
      </h1>

      <section className="mt-5 rounded-3xl bg-[#dde3ea] p-4">
        <p className="text-[31px] font-bold leading-[1.28] text-[#5c6f85]">
          {QUESTION.prompt}
        </p>

        <p className="mt-4 rounded-2xl bg-[#eef2f6] p-4 text-[28px] font-black leading-[1.3] text-[#445064]">
          "{QUESTION.context}"
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#a0adbe]">
          Select your decision
        </h2>

        <div className="mt-3 space-y-3">
          {QUESTION.choices.map((choice) => {
            const active = selectedChoiceId === choice.id;

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => setSelectedChoiceId(choice.id)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  active
                    ? 'border-[#3f63ff] bg-[#edf1ff] shadow-[0_8px_22px_rgba(63,99,255,0.2)]'
                    : 'border-[#d4dbe5] bg-[#e9edf2]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                      active
                        ? 'bg-[#3f63ff] text-white'
                        : 'bg-[#e2e7ee] text-[#8fa0b5]'
                    }`}
                  >
                    {choice.id}
                  </span>

                  <div>
                    <p className="text-[31px] font-black leading-tight text-[#1f2937]">
                      {choice.title}
                    </p>
                    <p className="mt-2 text-[26px] font-semibold leading-[1.3] text-[#728399]">
                      {choice.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <details className="mt-5 rounded-3xl bg-white p-4" open>
        <summary className="cursor-pointer list-none text-center text-xs font-black uppercase tracking-[0.14em] text-[#f59e0b]">
          ✧ Expert Explanation
        </summary>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {QUESTION.perspective.map((person) => (
            <div
              key={person.speaker}
              className="rounded-2xl bg-[#f2f5f9] p-2 text-center"
            >
              <div
                className="mx-auto h-12 w-12 rounded-full bg-[#d9e2ef]"
                aria-hidden
              />
              <p className="mt-2 text-xs font-black text-[#344256]">
                {person.speaker}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#96a3b3]">
                {person.role}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.1em] text-[#f59e0b]">
          {QUESTION.perspective[0].title}
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#97a1af]">
          {QUESTION.perspective[0].role}
        </p>

        <p className="mt-3 rounded-2xl bg-[#f4f7fb] p-4 text-sm font-semibold leading-relaxed text-[#475569]">
          {QUESTION.perspective[0].summary}
        </p>
      </details>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d7dee8] bg-[#f0f3f7] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#a2afbe]"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-white"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-white opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </main>
  );
}

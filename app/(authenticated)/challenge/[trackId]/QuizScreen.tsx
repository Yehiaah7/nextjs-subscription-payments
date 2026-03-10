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

function ChallengeQuestionCard({ question }: { question: QuizQuestion }) {
  return (
    <section className="w-full max-w-[361px] rounded-2xl bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
      <p className="text-sm font-normal leading-5 text-[#45556c]">{question.prompt}</p>

      <p className="mt-3 rounded-2xl bg-white p-3 text-[11px] font-bold leading-4 text-[#0f172b] shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]">
        “{question.context}”
      </p>
    </section>
  );
}

function ChallengeAnswerOptionCard({
  choice,
  active,
  onSelect
}: {
  choice: Choice;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`h-[81px] w-full max-w-[361px] rounded-2xl border p-3 text-left shadow-[0_1px_2px_-1px_rgba(0,0,0,0.3)] transition ${
        active
          ? 'border-[#bfd5ff] bg-[#eff6ff]'
          : 'border-[#e2e8f0] bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
            active
              ? 'bg-[#155dfc] text-white'
              : 'bg-[#f1f5f9] text-[#0f172b]'
          }`}
        >
          {choice.id}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-bold leading-5 text-[#0f172b]">{choice.title}</p>
          <p className="text-xs font-medium leading-4 text-[#62748e]">{choice.description}</p>
        </div>
      </div>
    </button>
  );
}

export default function QuizScreen({ challengeId }: { challengeId: string }) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<Choice['id'] | null>(
    null
  );
  const searchParams = useSearchParams();

  const companyId = searchParams.get('company');
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/home';

  const nextHref = useMemo(() => {
    if (!selectedChoiceId) {
      return null;
    }

    const resultRoute = selectedChoiceId === 'A' ? 'correct' : 'wrong';
    const querySuffix = companyId ? `?company=${companyId}` : '';

    return `/challenge/${challengeId}/${resultRoute}${querySuffix}`;
  }, [challengeId, companyId, selectedChoiceId]);

  return (
    <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 pb-4 text-text">
      <header className="flex items-center justify-between">
        <Link
          href={returnToTrackHref}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[#0f172b]"
          aria-label="Back to tracks"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <div className="inline-flex h-7 items-center gap-2 rounded-xl border border-[#1d293d] bg-[#0f172b] px-4 py-[6px] text-xs font-black leading-none text-white shadow-[0_20px_25px_-5px_rgba(15,23,43,0.7)]">
          <span className="h-2 w-2 rounded-full bg-[#ffd230]" />
          {QUESTION.timerLabel}
        </div>
      </header>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#155dfc]">
          {QUESTION.category}
        </p>
        <h1 className="mt-2 text-base font-bold leading-6 text-[#0f172b]">
          {QUESTION.title}
        </h1>
      </section>

      <ChallengeQuestionCard question={QUESTION} />

      <section className="space-y-3">
        {QUESTION.choices.map((choice) => (
          <ChallengeAnswerOptionCard
            key={choice.id}
            choice={choice}
            active={selectedChoiceId === choice.id}
            onSelect={() => setSelectedChoiceId(choice.id)}
          />
        ))}
      </section>

      <details className="w-full max-w-[361px] rounded-2xl bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]" open>
        <summary className="cursor-pointer list-none text-center text-[10px] font-black uppercase tracking-[0.1em] text-[#f59e0b]">
          ✧ Expert Explanation
        </summary>

        <div className="mt-3 grid grid-cols-3 gap-[8px]">
          {QUESTION.perspective.map((person) => (
            <div
              key={person.speaker}
              className="h-[104px] rounded-2xl border border-[#e2e8f0] p-3 text-center"
            >
              <div className="mx-auto h-8 w-8 rounded-full bg-[#d9e2ef]" aria-hidden />
              <p className="mt-2 text-[11px] font-black leading-4 text-[#344256]">{person.speaker}</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#96a3b3]">
                {person.role}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.08em] text-[#f59e0b]">
          {QUESTION.perspective[0].title}
        </p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#97a1af]">
          {QUESTION.perspective[0].role}
        </p>

        <p className="mt-2 rounded-2xl bg-[#f4f7fb] p-3 text-[12px] font-semibold leading-5 text-[#475569]">
          {QUESTION.perspective[0].summary}
        </p>
      </details>

      <div className="grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          disabled
          className="inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#94a3b8]"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#ffd230] bg-[#f59e0b] px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_15px_-3px_rgba(225,113,0,0.6)]"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#ffd230] bg-[#f59e0b] px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}

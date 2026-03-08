'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Choice = {
  id: string;
  title: string;
  description: string;
};

type QuizQuestion = {
  id: string;
  category: string;
  title: string;
  prompt: string;
  timerLabel: string;
  context: string;
  choices: Choice[];
  correctChoiceId: string;
  perspective: {
    speaker: string;
    role: string;
    title: string;
    summary: string;
  };
};

const QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    category: 'Strategic Prioritization',
    title: 'Trust vs. Engagement Dilemma',
    prompt:
      'A major data leak has been discovered. Engineers can patch it in 48 hours, but it will cause a 15% drop in session duration for the next week during a critical quarterly reporting period.',
    timerLabel: '3 minutes to decide',
    context: 'Business metrics or user safety? You have 3 minutes to decide.',
    choices: [
      {
        id: 'A',
        title: 'Immediate Patch',
        description: 'Prioritize the fix now. Accept the engagement hit and prepare the PR team.'
      },
      {
        id: 'B',
        title: 'Soft Patch',
        description: 'Apply a temporary fix that maintains engagement but leaves a 5% vulnerability risk.'
      },
      {
        id: 'C',
        title: 'Staged Rollout',
        description: 'Roll out the patch to high-risk regions first to minimize global impact.'
      },
      {
        id: 'D',
        title: 'Postpone and Bundle',
        description: 'Delay the patch to next week to clear the reporting period.'
      }
    ],
    correctChoiceId: 'A',
    perspective: {
      speaker: 'Sarah Chen',
      role: 'Group PM @ Meta',
      title: "Sarah Chen's Perspective",
      summary:
        "Trust is the ultimate currency. At Meta's scale, sacrificing safety for short-term engagement is a non-negotiable decision you can't undo."
    }
  },
  {
    id: '2',
    category: 'Execution Trade-Offs',
    title: 'Launch Readiness Check',
    prompt:
      'The onboarding redesign is ready, but analytics instrumentation is incomplete. Launching now could improve activation quickly, though measurement quality will be limited for 2 weeks.',
    timerLabel: '2 minutes to decide',
    context: 'Ship speed or measurement confidence? Pick the strongest path.',
    choices: [
      {
        id: 'A',
        title: 'Ship Immediately',
        description: 'Launch now and retroactively patch analytics once data starts coming in.'
      },
      {
        id: 'B',
        title: 'Delay Launch',
        description: 'Wait two weeks to ship with complete measurement and cleaner post-launch analysis.'
      },
      {
        id: 'C',
        title: 'Phased Rollout',
        description: 'Launch to 10% of users while completing analytics for full rollout readiness.'
      },
      {
        id: 'D',
        title: 'Internal-Only Test',
        description: 'Limit launch to employee dogfooding and revisit after full instrumentation.'
      }
    ],
    correctChoiceId: 'C',
    perspective: {
      speaker: 'Marcus James',
      role: 'Director PM',
      title: "Marcus James's Perspective",
      summary:
        'Phased release balances learning velocity and quality. You preserve momentum while building confidence in measurement.'
    }
  }
];

export default function QuizScreen({ challengeId }: { challengeId: string }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();

  const companyId = searchParams.get('companyId');
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/companies';

  const question = QUESTIONS[questionIndex];
  const selectedChoiceId = selections[question.id];
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === QUESTIONS.length - 1;

  const nextHref = useMemo(() => {
    if (!isLastQuestion || !selectedChoiceId) {
      return null;
    }

    return selectedChoiceId === question.correctChoiceId
      ? `/challenge/${challengeId}/correct`
      : `/challenge/${challengeId}/wrong`;
  }, [challengeId, isLastQuestion, question.correctChoiceId, selectedChoiceId]);

  const submitHref =
    selectedChoiceId === question.correctChoiceId
      ? `/challenge/${challengeId}/correct${companyId ? `?companyId=${companyId}` : ''}`
      : `/challenge/${challengeId}/wrong${companyId ? `?companyId=${companyId}` : ''}`;

  return (
    <main className="mx-auto min-h-screen max-w-[460px] bg-[#eef2f6] px-4 py-5 text-[#111827]">
      <header className="mb-5 flex items-center justify-between">
        <Link
          href={returnToTrackHref}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3e8ef] text-[#8a97a7]"
          aria-label="Back to tracks"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="rounded-2xl bg-[#0f2748] px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white">
          {question.timerLabel}
        </div>
      </header>

      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#3f63ff]">{question.category}</p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.02em]">{question.title}</h1>

      <section className="mt-4 rounded-3xl bg-[#dde3ea] p-4">
        <p className="text-sm leading-relaxed text-[#445064]">{question.prompt}</p>
        <p className="mt-3 rounded-2xl bg-[#f5f8fc] p-3 text-sm font-semibold text-[#2c3950]">
          “{question.context}”
        </p>
      </section>

      <section className="mt-5">
        <h2 className="text-xs font-black uppercase tracking-[0.1em] text-[#9aa6b8]">Select your decision</h2>
        <div className="mt-3 space-y-3">
          {question.choices.map((choice) => {
            const active = selectedChoiceId === choice.id;

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() =>
                  setSelections((prev) => ({
                    ...prev,
                    [question.id]: choice.id
                  }))
                }
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  active
                    ? 'border-[#3f63ff] bg-[#edf1ff] shadow-[0_8px_22px_rgba(63,99,255,0.2)]'
                    : 'border-[#d6dde7] bg-[#e9edf2]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                      active ? 'bg-[#3f63ff] text-white' : 'bg-[#d8dee8] text-[#6e7f94]'
                    }`}
                  >
                    {choice.id}
                  </span>
                  <div>
                    <p className="text-lg font-black text-[#1f2937]">{choice.title}</p>
                    <p className="mt-1 text-sm font-medium text-[#64748b]">{choice.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <details className="mt-5 rounded-3xl bg-white p-4" open>
        <summary className="cursor-pointer list-none text-xs font-black uppercase tracking-[0.1em] text-[#f59e0b]">
          Expert explanation
        </summary>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.1em] text-[#f59e0b]">{question.perspective.title}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#97a1af]">
          {question.perspective.speaker} • {question.perspective.role}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#475569]">{question.perspective.summary}</p>
      </details>

      <div className="mt-6 grid grid-cols-2 gap-3 pb-6">
        <button
          type="button"
          onClick={() => setQuestionIndex((index) => Math.max(index - 1, 0))}
          disabled={isFirstQuestion}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d7dee8] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {nextHref ? (
          <Link
            href={submitHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-white"
          >
            Submit <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setQuestionIndex((index) => Math.min(index + 1, QUESTIONS.length - 1))}
            disabled={!selectedChoiceId}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </main>
  );
}

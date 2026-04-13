'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type Question = {
  id: string;
  prompt: string;
  sort_order: number;
  points: number;
  options: { id: string; label: string; sort_order: number; is_correct: boolean; feedback: string | null }[];
};

type Quiz = {
  id: string;
  title: string;
  module_id: string;
  modules: { title: string } | null;
  pass_score: number | null;
  questions: Question[];
};

type AttemptState = {
  selectedOptionId: string | null;
  answeredCorrect: boolean;
  hadWrongBefore: boolean;
  pointsAwarded: number;
  feedbackText: string;
};

const emptyAttemptState: AttemptState = {
  selectedOptionId: null,
  answeredCorrect: false,
  hadWrongBefore: false,
  pointsAwarded: 0,
  feedbackText: ''
};

export default function QuizScreen({ challengeId }: { challengeId: string }) {
  const supabase = useMemo(() => createClient() as any, []);
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company');
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/home';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);
  const [attemptStates, setAttemptStates] = useState<Record<string, AttemptState>>({});
  const [score, setScore] = useState<number | null>(null);

  const currentQuestion = quiz?.questions[activeIndex] ?? null;

  useEffect(() => {
    const loadQuiz = async () => {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select(
          'id,title,module_id,pass_score,modules(title),questions(id,prompt,sort_order,points,options(id,label,sort_order,is_correct,feedback))'
        )
        .eq('id', challengeId)
        .single();

      if (!quizData) return;

      const normalizedQuiz = {
        ...quizData,
        questions: (quizData.questions ?? []).sort(
          (a: Question, b: Question) => a.sort_order - b.sort_order
        )
      } as Quiz;
      setQuiz(normalizedQuiz);

      const { data: latestAttempt } = await supabase
        .from('attempts')
        .select('id,submitted_at,passed,score,started_at')
        .eq('quiz_id', challengeId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let effectiveAttempt = latestAttempt;
      const passedReview = Boolean(latestAttempt?.submitted_at && latestAttempt?.passed);

      if (!effectiveAttempt || (effectiveAttempt.submitted_at && !effectiveAttempt.passed)) {
        const { data: newAttempt } = await supabase
          .from('attempts')
          .insert({ quiz_id: challengeId })
          .select('id,submitted_at,passed,score,started_at')
          .single();
        effectiveAttempt = newAttempt;
      }

      if (!effectiveAttempt) return;
      setAttemptId(effectiveAttempt.id);
      setReviewMode(passedReview);
      setScore(effectiveAttempt.score ?? null);

      const { data: answersData } = await supabase
        .from('answers')
        .select('question_id,option_id,points_awarded,text_answer,options(is_correct,feedback)')
        .eq('attempt_id', effectiveAttempt.id);

      const nextStates: Record<string, AttemptState> = {};
      for (const answer of answersData ?? []) {
        const parsedMeta = answer.text_answer ? JSON.parse(answer.text_answer) : { hadWrongBefore: false };
        nextStates[answer.question_id] = {
          selectedOptionId: answer.option_id,
          answeredCorrect: Boolean(answer.options?.is_correct),
          hadWrongBefore: Boolean(parsedMeta.hadWrongBefore),
          pointsAwarded: answer.points_awarded ?? 0,
          feedbackText: answer.options?.feedback ?? ''
        };
      }

      setAttemptStates(nextStates);

      const firstPending = normalizedQuiz.questions.findIndex(
        (question) => !nextStates[question.id]?.answeredCorrect
      );
      setActiveIndex(firstPending >= 0 ? firstPending : 0);
    };

    loadQuiz().finally(() => setLoading(false));
  }, [challengeId, supabase]);

  const onSelectOption = async (question: Question, optionId: string) => {
    if (!attemptId || reviewMode) return;

    const option = question.options.find((item) => item.id === optionId);
    if (!option) return;

    const previousState = attemptStates[question.id] ?? emptyAttemptState;
    const hadWrongBefore = previousState.hadWrongBefore || !option.is_correct;
    const pointsAwarded = option.is_correct && !hadWrongBefore ? question.points : 0;

    await supabase.from('answers').upsert(
      {
        attempt_id: attemptId,
        question_id: question.id,
        option_id: option.id,
        points_awarded: pointsAwarded,
        text_answer: JSON.stringify({ hadWrongBefore })
      },
      { onConflict: 'attempt_id,question_id' }
    );

    const nextStates = {
      ...attemptStates,
      [question.id]: {
        selectedOptionId: option.id,
        answeredCorrect: option.is_correct,
        hadWrongBefore,
        pointsAwarded,
        feedbackText: option.feedback ?? ''
      }
    };
    setAttemptStates(nextStates);

    if (!option.is_correct) return;

    const allQuestionsCorrect = quiz?.questions.every(
      (quizQuestion) =>
        (quizQuestion.id === question.id ? option.is_correct : nextStates[quizQuestion.id]?.answeredCorrect) === true
    );

    if (quiz && allQuestionsCorrect) {
      const totalPossible = quiz.questions.reduce((sum, item) => sum + item.points, 0);
      const awarded = quiz.questions.reduce(
        (sum, item) => sum + (nextStates[item.id]?.pointsAwarded ?? 0),
        0
      );
      const finalScore = Math.round((awarded / Math.max(totalPossible, 1)) * 100);
      const passed = finalScore >= (quiz.pass_score ?? 60);

      await supabase
        .from('attempts')
        .update({ submitted_at: new Date().toISOString(), score: finalScore, passed })
        .eq('id', attemptId);

      setScore(finalScore);
      setReviewMode(passed);
      return;
    }

    const current = quiz?.questions.findIndex((item) => item.id === question.id) ?? activeIndex;
    const nextIndex = Math.min((quiz?.questions.length ?? 1) - 1, current + 1);
    setActiveIndex(nextIndex);
  };

  if (loading || !quiz || !currentQuestion) {
    return (
      <div className="mx-auto w-full max-w-[361px] rounded-2xl bg-white p-4">
        Loading challenge...
      </div>
    );
  }

  const currentState = attemptStates[currentQuestion.id] ?? emptyAttemptState;
  const canMoveNext = reviewMode || currentState.answeredCorrect;

  return (
    <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 pb-4 text-text">
      <header className="flex items-center justify-between">
        <Link
          href={returnToTrackHref}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[#0f172b]"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.08em] text-primary">
          Step {activeIndex + 1}/{quiz.questions.length}
        </p>
      </header>

      <div className="h-2 rounded-pill bg-surface-soft">
        <div
          className="h-full rounded-pill bg-primary"
          style={{ width: `${((activeIndex + 1) / Math.max(quiz.questions.length, 1)) * 100}%` }}
        />
      </div>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#155dfc]">
          {quiz.modules?.title ?? 'Challenge'}
        </p>
        <h1 className="mt-2 text-base font-bold leading-6 text-[#0f172b]">{quiz.title}</h1>
        {score !== null ? (
          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-muted">
            Score: {score}%
          </p>
        ) : null}
      </section>

      <section className="w-full rounded-2xl bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <p className="text-sm font-normal leading-5 text-[#45556c]">{currentQuestion.prompt}</p>
      </section>

      <section className="space-y-3">
        {currentQuestion.options
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((option) => {
            const selected = currentState.selectedOptionId === option.id;
            const isCorrect = option.is_correct;
            const inReview = reviewMode;
            const className = inReview
              ? isCorrect
                ? 'border-green-400 bg-green-50'
                : selected
                  ? 'border-red-400 bg-red-50'
                  : 'border-[#e2e8f0] bg-white'
              : selected
                ? 'border-[#bfd5ff] bg-[#eff6ff]'
                : 'border-[#e2e8f0] bg-white';

            return (
              <button
                key={option.id}
                type="button"
                disabled={reviewMode}
                onClick={() => onSelectOption(currentQuestion, option.id)}
                className={`w-full rounded-2xl border p-3 text-left ${className}`}
              >
                <p className="text-sm font-bold text-[#0f172b]">
                  Option {String.fromCharCode(64 + option.sort_order)}
                </p>
                <p className="text-xs text-[#62748e]">{option.label}</p>
              </button>
            );
          })}
      </section>

      {currentState.selectedOptionId ? (
        <div
          className={`rounded-2xl p-3 text-sm ${
            currentState.answeredCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
          }`}
        >
          <p className="font-black uppercase tracking-[0.08em]">
            {currentState.answeredCorrect ? 'Correct' : 'Incorrect'}
          </p>
          <p>{currentState.feedbackText}</p>
        </div>
      ) : null}

      {reviewMode ? (
        <div className="rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-700">
          Review mode enabled. Correct answers are highlighted.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
          disabled={activeIndex === 0}
          className="inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#94a3b8]"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={() => setActiveIndex((value) => Math.min(quiz.questions.length - 1, value + 1))}
          disabled={activeIndex === quiz.questions.length - 1 || !canMoveNext}
          className="inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#ffd230] bg-[#f59e0b] px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white disabled:opacity-50"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

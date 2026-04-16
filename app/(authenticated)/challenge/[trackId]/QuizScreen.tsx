'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { MotionButton } from '@/components/motion';
import {
  btnInteractive,
  btnInteractiveColored,
  btnInteractiveNeutral,
  cardInteractive,
  focusRingInteractive,
  iconBtnInteractive
} from '@/components/ui/interactive';
import MotionPage from '@/components/motion/MotionPage';
import { useReducedMotionPref } from '@/lib/motion';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';

type Question = {
  id: string;
  prompt: string;
  explanation: string | null;
  sort_order: number;
  points: number;
  options: {
    id: string;
    label: string;
    sort_order: number;
    is_correct: boolean;
  }[];
};

type Quiz = {
  id: string;
  title: string;
  module_id: string;
  modules: { title: string; track_id: string } | null;
  pass_score: number | null;
  questions: Question[];
};

type AttemptState = {
  solvedOptionId: string | null;
  lastSelectedOptionId: string | null;
  isSolved: boolean;
  wrongAttemptsCount: number;
  pointsAwarded: number;
};

const emptyAttemptState: AttemptState = {
  solvedOptionId: null,
  lastSelectedOptionId: null,
  isSolved: false,
  wrongAttemptsCount: 0,
  pointsAwarded: 0
};

export default function QuizScreen({ challengeId }: { challengeId: string }) {
  const supabase = useMemo(() => createClient() as any, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyId, setCompanyId] = useState<string | null>(
    searchParams.get('company')
  );
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/home';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<{
    scorePercent: number;
    awarded: number;
    total: number;
  } | null>(null);
  const [attemptStates, setAttemptStates] = useState<
    Record<string, AttemptState>
  >({});
  const [wrongAnimatingOptionId, setWrongAnimatingOptionId] = useState<
    string | null
  >(null);
  const reducedMotion = useReducedMotionPref();

  const currentQuestion = quiz?.questions[activeIndex] ?? null;

  useEffect(() => {
    const loadQuiz = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: quizData } = await supabase
        .from('quizzes')
        .select(
          'id,title,module_id,pass_score,modules(title,track_id),questions(id,prompt,explanation,sort_order,points,options(id,label,sort_order,is_correct))'
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
      if (!companyId && normalizedQuiz.modules?.track_id) {
        setCompanyId(normalizedQuiz.modules.track_id);
      }

      const { data: latestAttempt } = await supabase
        .from('attempts')
        .select('id,submitted_at,passed,score,started_at')
        .eq('quiz_id', challengeId)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let effectiveAttempt =
        latestAttempt && !latestAttempt.submitted_at ? latestAttempt : null;
      if (!effectiveAttempt) {
        const { data: newAttempt } = await supabase
          .from('attempts')
          .insert({ quiz_id: challengeId, user_id: user.id })
          .select('id,submitted_at,passed,score,started_at')
          .single();
        effectiveAttempt = newAttempt;
      }

      if (!effectiveAttempt) return;
      setAttemptId(effectiveAttempt.id);

      const { data: answersData } = await supabase
        .from('answers')
        .select(
          'question_id,option_id,points_awarded,text_answer,options(is_correct)'
        )
        .eq('attempt_id', effectiveAttempt.id);

      const nextStates: Record<string, AttemptState> = {};
      for (const answer of answersData ?? []) {
        let parsedMeta: {
          wrongAttemptsCount?: number;
          lastSelectedOptionId?: string;
          solvedOptionId?: string;
        } = {};
        if (answer.text_answer) {
          try {
            parsedMeta = JSON.parse(answer.text_answer);
          } catch {
            parsedMeta = {};
          }
        }
        const solvedOptionId = answer.options?.is_correct
          ? answer.option_id
          : (parsedMeta.solvedOptionId ?? null);
        nextStates[answer.question_id] = {
          solvedOptionId,
          lastSelectedOptionId:
            parsedMeta.lastSelectedOptionId ??
            solvedOptionId ??
            answer.option_id,
          isSolved: Boolean(solvedOptionId),
          wrongAttemptsCount: Number(parsedMeta?.wrongAttemptsCount ?? 0),
          pointsAwarded: answer.points_awarded ?? 0
        };
      }

      setAttemptStates(nextStates);

      const firstPending = normalizedQuiz.questions.findIndex(
        (question) => !nextStates[question.id]?.isSolved
      );
      setActiveIndex(firstPending >= 0 ? firstPending : 0);
    };

    loadQuiz().finally(() => setLoading(false));
  }, [challengeId, supabase]);

  const finalizeAttempt = async (nextStates: Record<string, AttemptState>) => {
    if (!attemptId || !quiz) return;

    setFinishing(true);
    const totalPossible = quiz.questions.reduce(
      (sum, item) => sum + item.points,
      0
    );
    const awarded = quiz.questions.reduce(
      (sum, item) => sum + (nextStates[item.id]?.pointsAwarded ?? 0),
      0
    );
    const finalScore = Math.round((awarded / Math.max(totalPossible, 1)) * 100);
    const passed = finalScore >= 60;

    await supabase
      .from('attempts')
      .update({
        submitted_at: new Date().toISOString(),
        score: finalScore,
        passed
      })
      .eq('id', attemptId);

    setResult({ scorePercent: finalScore, awarded, total: totalPossible });
    setFinishing(false);
  };

  const onSelectOption = async (question: Question, optionId: string) => {
    if (!attemptId) return;

    const previousState = attemptStates[question.id] ?? emptyAttemptState;
    const option = question.options.find((item) => item.id === optionId);
    if (!option) return;

    const hasBeenSolved =
      previousState.isSolved && Boolean(previousState.solvedOptionId);
    const solvedOptionId = option.is_correct
      ? option.id
      : previousState.solvedOptionId;
    const wrongAttemptsCount =
      option.is_correct || hasBeenSolved
        ? previousState.wrongAttemptsCount
        : previousState.wrongAttemptsCount + 1;
    const pointsAwarded = hasBeenSolved
      ? previousState.pointsAwarded
      : option.is_correct
        ? question.points
        : previousState.pointsAwarded;
    const nextStateForQuestion: AttemptState = {
      solvedOptionId,
      lastSelectedOptionId: option.id,
      isSolved: Boolean(solvedOptionId),
      wrongAttemptsCount,
      pointsAwarded
    };
    const nextStates = {
      ...attemptStates,
      [question.id]: nextStateForQuestion
    };
    setAttemptStates(nextStates);
    if (!option.is_correct) {
      setWrongAnimatingOptionId(option.id);
      window.setTimeout(() => {
        setWrongAnimatingOptionId((current) =>
          current === option.id ? null : current
        );
      }, 220);
    }

    await supabase.from('answers').upsert(
      {
        attempt_id: attemptId,
        question_id: question.id,
        option_id: option.id,
        points_awarded: nextStateForQuestion.pointsAwarded,
        text_answer: JSON.stringify({
          wrongAttemptsCount: nextStateForQuestion.wrongAttemptsCount,
          solvedOptionId: nextStateForQuestion.solvedOptionId,
          lastSelectedOptionId: nextStateForQuestion.lastSelectedOptionId
        })
      },
      { onConflict: 'attempt_id,question_id' }
    );
  };

  if (loading || !quiz || !currentQuestion) {
    return (
      <div className="mx-auto w-full max-w-[361px] rounded-2xl bg-white p-4">
        Loading challenge...
      </div>
    );
  }

  const currentState = attemptStates[currentQuestion.id] ?? emptyAttemptState;
  const completedCount = quiz.questions.filter(
    (question) => attemptStates[question.id]?.isSolved
  ).length;
  const isLastStep = activeIndex === quiz.questions.length - 1;
  const canMoveNext = Boolean(
    currentState.isSolved || currentState.lastSelectedOptionId
  );
  const showCorrectFeedback =
    currentState.isSolved &&
    currentState.lastSelectedOptionId === currentState.solvedOptionId;
  const showWrongFeedback = currentState.isSolved
    ? Boolean(currentState.lastSelectedOptionId) &&
      currentState.lastSelectedOptionId !== currentState.solvedOptionId
    : Boolean(currentState.lastSelectedOptionId);
  const selectedWrongOption = currentQuestion.options.find(
    (option) =>
      option.id === currentState.lastSelectedOptionId && !option.is_correct
  );

  if (result) {
    return (
      <MotionPage>
        <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 rounded-2xl bg-white p-4 text-text shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#155dfc]">
            Challenge Complete
          </p>
          <div className="relative flex items-center justify-center py-1">
            <div className="animate-completion-pop relative grid h-16 w-16 place-items-center rounded-full border border-[#bfdbfe] bg-gradient-to-br from-[#dbeafe] to-white shadow-[0_8px_24px_-14px_rgba(21,93,252,0.7)]">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#155dfc] text-white shadow-[0_4px_16px_-8px_rgba(21,93,252,0.9)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>
          </div>
          <h1 className="animate-completion-pop text-base font-bold leading-6 text-[#0f172b]">
            Your score: {result.scorePercent}%
          </h1>
          <p className="animate-completion-pop text-sm text-[#45556c]">
            Points earned: {result.awarded}/{result.total}
          </p>
          <MotionButton
            type="button"
            onClick={() => router.push(returnToTrackHref)}
            className={cn(
              'inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#ffd230] bg-[#f59e0b] px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white',
              btnInteractive,
              btnInteractiveColored,
              focusRingInteractive
            )}
          >
            Back to Company
          </MotionButton>
        </section>
      </MotionPage>
    );
  }

  return (
    <MotionPage>
      <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 pb-4 text-text">
        <header className="flex items-center justify-between">
          <Link
            href={returnToTrackHref}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[#0f172b]',
              iconBtnInteractive,
              focusRingInteractive
            )}
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
            style={{
              width: `${(completedCount / Math.max(quiz.questions.length, 1)) * 100}%`
            }}
          />
        </div>

        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#155dfc]">
            {quiz.modules?.title ?? 'Challenge'}
          </p>
          <h1 className="mt-2 text-base font-bold leading-6 text-[#0f172b]">
            {quiz.title}
          </h1>
        </section>

        <section className="w-full rounded-2xl bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
          {currentState.isSolved ? (
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-green-800">
              <CheckCircle2 className="h-3 w-3" />
              Solved
            </div>
          ) : null}
          <p className="text-sm font-normal leading-5 text-[#45556c]">
            {currentQuestion.prompt}
          </p>
          {currentState.isSolved ? (
            <p className="mt-2 text-xs font-semibold text-green-700">
              Solved • You can continue
            </p>
          ) : null}
        </section>

        <section className="space-y-3">
          {currentQuestion.options
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((option) => {
              const selected = currentState.lastSelectedOptionId === option.id;
              const isCorrect = option.is_correct;
              const className = selected
                ? isCorrect
                  ? 'border-green-400 bg-green-50'
                  : 'border-red-200 bg-red-50'
                : 'border-[#e2e8f0] bg-white';

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  whileHover={reducedMotion ? undefined : { scale: 1.008 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.99 }}
                  animate={
                    selected &&
                    !isCorrect &&
                    wrongAnimatingOptionId === option.id &&
                    !reducedMotion
                      ? { x: [0, -2, 2, -1, 1, 0] }
                      : selected && isCorrect && !reducedMotion
                        ? { scale: [1, 1.01, 1] }
                        : {}
                  }
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onClick={() => onSelectOption(currentQuestion, option.id)}
                  className={cn(
                    'w-full cursor-pointer rounded-2xl border p-3 text-left transition-colors duration-150',
                    className,
                    cardInteractive,
                    selected && isCorrect && 'animate-option-correct',
                    selected &&
                      !isCorrect &&
                      wrongAnimatingOptionId === option.id &&
                      'animate-option-wrong',
                    focusRingInteractive
                  )}
                >
                  <p className="text-sm font-bold text-[#0f172b]">
                    Option {String.fromCharCode(64 + option.sort_order)}
                  </p>
                  <p className="text-xs text-[#62748e]">{option.label}</p>
                </motion.button>
              );
            })}
        </section>

        {showCorrectFeedback ? (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-green-100 p-3 text-sm text-green-900"
          >
            <p className="font-black uppercase tracking-[0.08em]">Correct</p>
            <p>
              {currentQuestion.explanation ??
                'Great work. You solved this step.'}
            </p>
          </motion.div>
        ) : null}

        {showWrongFeedback ? (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-50 p-3 text-sm text-red-800"
          >
            <p className="font-black uppercase tracking-[0.08em]">Wrong</p>
            <p>
              {selectedWrongOption
                ? `"${selectedWrongOption.label}" is not correct for this step.`
                : 'That option is not correct for this step.'}{' '}
              {currentState.isSolved
                ? 'This step stays solved—pick the correct option to view the correct feedback again.'
                : 'Try another option.'}
            </p>
          </motion.div>
        ) : null}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-[10px]">
            <MotionButton
              type="button"
              onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
              disabled={activeIndex === 0}
              className={cn(
                'inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#94a3b8]',
                btnInteractive,
                btnInteractiveNeutral,
                focusRingInteractive
              )}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </MotionButton>
            <MotionButton
              type="button"
              onClick={() => {
                if (!canMoveNext || finishing) return;
                if (isLastStep) {
                  finalizeAttempt(attemptStates);
                  return;
                }
                setActiveIndex((value) =>
                  Math.min(quiz.questions.length - 1, value + 1)
                );
              }}
              disabled={!canMoveNext || finishing}
              className={cn(
                'inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#ffd230] bg-[#f59e0b] px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white disabled:opacity-50',
                btnInteractive,
                btnInteractiveColored,
                focusRingInteractive
              )}
            >
              {isLastStep ? 'Finish' : 'Next'}{' '}
              <ChevronRight className="h-4 w-4" />
            </MotionButton>
          </div>
          <MotionButton
            type="button"
            onClick={() => router.push(returnToTrackHref)}
            className={cn(
              'inline-flex h-[39px] w-full items-center justify-center rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#0f172b]',
              btnInteractive,
              btnInteractiveNeutral,
              focusRingInteractive
            )}
          >
            Back to challenges
          </MotionButton>
        </div>
      </section>
    </MotionPage>
  );
}

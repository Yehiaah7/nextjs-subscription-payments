'use client';

import { motion } from 'framer-motion';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  CheckCircleFilledIcon,
  ChevronLeftFilledIcon,
  ChevronRightFilledIcon
} from '@/components/icons/FilledIcons';
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
import { markCompanyChallengeListStale } from '../../companies/challenge-refresh';

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

type AttemptRow = {
  id: string;
  submitted_at: string | null;
  passed: boolean | null;
  score: number | null;
  started_at: string;
};

type AttemptState = {
  solvedOptionId: string | null;
  lastSelectedOptionId: string | null;
  isSolved: boolean;
  wrongAttemptsCount: number;
  pointsAwarded: number;
};

const hashStringToSeed = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createSeededRandom = (seed: number) => {
  let state = seed || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleOptionsForAttempt = (
  options: Question['options'],
  attemptId: string,
  questionId: string
) => {
  const shuffled = [...options].sort((a, b) => a.sort_order - b.sort_order);
  const random = createSeededRandom(
    hashStringToSeed(`${attemptId}:${questionId}`)
  );
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index]
    ];
  }
  return shuffled;
};

const emptyAttemptState: AttemptState = {
  solvedOptionId: null,
  lastSelectedOptionId: null,
  isSolved: false,
  wrongAttemptsCount: 0,
  pointsAwarded: 0
};

const getAttemptStartedAtMs = (attempt: AttemptRow) =>
  attempt.started_at ? new Date(attempt.started_at).getTime() : 0;

const selectAttemptToResume = (attempts: AttemptRow[]) =>
  [...attempts].sort((a, b) => {
    const aIsSolved = Boolean(a.submitted_at && a.passed);
    const bIsSolved = Boolean(b.submitted_at && b.passed);
    if (aIsSolved !== bIsSolved) return aIsSolved ? -1 : 1;

    const aIsOpen = !a.submitted_at;
    const bIsOpen = !b.submitted_at;
    if (aIsOpen !== bIsOpen) return aIsOpen ? -1 : 1;

    return getAttemptStartedAtMs(b) - getAttemptStartedAtMs(a);
  })[0] ?? null;

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
  const [persistedAnsweredQuestionIds, setPersistedAnsweredQuestionIds] =
    useState<Set<string>>(new Set());
  const pendingSaveRef = useRef<Promise<unknown> | null>(null);
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

      const { data: attemptsData } = await supabase
        .from('attempts')
        .select('id,submitted_at,passed,score,started_at')
        .eq('quiz_id', challengeId)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      const retryRequested = searchParams.get('retry') === '1';
      const attempts = (attemptsData ?? []) as AttemptRow[];
      let effectiveAttempt = retryRequested
        ? null
        : selectAttemptToResume(attempts);
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
      console.log('[QuizTrace] load attempt + resume seed', {
        challengeId,
        attemptId: effectiveAttempt.id,
        totalQuestions: normalizedQuiz.questions.length
      });

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
      setPersistedAnsweredQuestionIds(
        new Set((answersData ?? []).map((answer: any) => answer.question_id))
      );

      const firstPending = normalizedQuiz.questions.findIndex(
        (question) => !nextStates[question.id]?.lastSelectedOptionId
      );
      const resumeIndex =
        firstPending >= 0
          ? firstPending
          : Math.max(normalizedQuiz.questions.length - 1, 0);
      setActiveIndex(resumeIndex);
      console.log('[QuizTrace] resume index chosen', {
        attemptId: effectiveAttempt.id,
        answeredCount: (answersData ?? []).length,
        firstPending,
        resumeIndex,
        resumeStep: resumeIndex + 1
      });
      console.log(
        `[RuntimeProof] reopen resume index=${resumeIndex} resume question number=${resumeIndex + 1} quiz attempt id=${effectiveAttempt.id}`
      );
    };

    loadQuiz().finally(() => setLoading(false));
  }, [challengeId, supabase]);

  const finalizeAttempt = async (completedQuestionIds?: Set<string>) => {
    if (!attemptId || !quiz || finishing) return;

    setFinishing(true);
    if (pendingSaveRef.current) {
      await pendingSaveRef.current;
    }
    const requiredQuestionIds = new Set(quiz.questions.map((item) => item.id));
    const { data: savedAnswersData } = await supabase
      .from('answers')
      .select('question_id,points_awarded')
      .eq('attempt_id', attemptId);
    const savedAnswers = (savedAnswersData ?? []).filter((answer: any) =>
      requiredQuestionIds.has(answer.question_id)
    );
    const savedQuestionIds = new Set<string>(
      savedAnswers.map((answer: any) => answer.question_id as string)
    );
    const completedIds = completedQuestionIds ?? savedQuestionIds;
    const hasSavedAllRequiredSteps =
      savedQuestionIds.size === quiz.questions.length &&
      quiz.questions.every((question) => completedIds.has(question.id));

    if (!hasSavedAllRequiredSteps) {
      setPersistedAnsweredQuestionIds(savedQuestionIds);
      setFinishing(false);
      return;
    }

    const totalPossible = quiz.questions.reduce(
      (sum, item) => sum + item.points,
      0
    );
    const awarded = savedAnswers.reduce(
      (sum: number, item: any) => sum + (item.points_awarded ?? 0),
      0
    );
    const finalScore = Math.round((awarded / Math.max(totalPossible, 1)) * 100);
    const passed = finalScore >= (quiz.pass_score ?? 60);

    await supabase
      .from('attempts')
      .update({
        submitted_at: new Date().toISOString(),
        score: finalScore,
        passed
      })
      .eq('id', attemptId);

    setPersistedAnsweredQuestionIds(
      new Set(quiz.questions.map((question) => question.id))
    );
    markCompanyChallengeListStale(companyId);
    router.refresh();
    setResult({ scorePercent: finalScore, awarded, total: totalPossible });
    setFinishing(false);
  };

  const onSelectOption = async (question: Question, optionId: string) => {
    if (!attemptId || !quiz) return;

    const loadedQuiz = quiz;
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

    const answerPayload = {
      attempt_id: attemptId,
      question_id: question.id,
      option_id: option.id,
      points_awarded: nextStateForQuestion.pointsAwarded,
      text_answer: JSON.stringify({
        wrongAttemptsCount: nextStateForQuestion.wrongAttemptsCount,
        solvedOptionId: nextStateForQuestion.solvedOptionId,
        lastSelectedOptionId: nextStateForQuestion.lastSelectedOptionId
      })
    };

    console.log('[QuizTrace] answers upsert payload', answerPayload);

    const savePromise = supabase
      .from('answers')
      .upsert(answerPayload, { onConflict: 'attempt_id,question_id' })
      .select('attempt_id,question_id,option_id,points_awarded,text_answer');
    pendingSaveRef.current = savePromise;
    const saveResult = await savePromise;
    const { count: savedCount } = await supabase
      .from('answers')
      .select('question_id', { count: 'exact', head: true })
      .eq('attempt_id', attemptId);
    const nextAnsweredCount = persistedAnsweredQuestionIds.has(question.id)
      ? persistedAnsweredQuestionIds.size
      : persistedAnsweredQuestionIds.size + 1;
    const inQuizProgressValue =
      (nextAnsweredCount / Math.max(loadedQuiz.questions.length, 1)) * 100;
    const rawSaveError = saveResult.error
      ? {
          message: saveResult.error.message,
          code: saveResult.error.code ?? null,
          details: saveResult.error.details ?? null,
          hint: saveResult.error.hint ?? null,
          raw: JSON.stringify(saveResult.error)
        }
      : null;

    console.log('[QuizTrace] answer saved', {
      attemptId,
      questionId: question.id,
      saveResultError: rawSaveError,
      saveResultData: saveResult.data ?? null,
      savedAnswersCountForAttempt: savedCount ?? null,
      inQuizProgressValue
    });
    console.log(
      `[RuntimeProof] quiz attempt id=${attemptId} saved answers count=${savedCount ?? 'null'} in-quiz progress=${inQuizProgressValue}% after question=${nextAnsweredCount}`
    );
    markCompanyChallengeListStale(companyId);
    const nextPersistedQuestionIds = new Set(persistedAnsweredQuestionIds);
    nextPersistedQuestionIds.add(question.id);
    setPersistedAnsweredQuestionIds(nextPersistedQuestionIds);
    if (pendingSaveRef.current === savePromise) {
      pendingSaveRef.current = null;
    }

    const answeredFinalRequiredQuestion =
      loadedQuiz.questions[loadedQuiz.questions.length - 1]?.id === question.id;
    const answeredEveryRequiredQuestion =
      Boolean(loadedQuiz.questions.length) &&
      loadedQuiz.questions.every((item) =>
        nextPersistedQuestionIds.has(item.id)
      );

    if (answeredFinalRequiredQuestion && answeredEveryRequiredQuestion) {
      await finalizeAttempt(nextPersistedQuestionIds);
    }
  };

  if (loading || !quiz || !currentQuestion) {
    return (
      <div className="mx-auto w-full max-w-[361px] rounded-2xl bg-white p-4">
        Loading challenge...
      </div>
    );
  }

  const currentState = attemptStates[currentQuestion.id] ?? emptyAttemptState;
  const answeredCount = persistedAnsweredQuestionIds.size;
  const isLastStep = activeIndex === quiz.questions.length - 1;
  const canMoveNext = Boolean(currentState.lastSelectedOptionId);
  const allQuestionsAnswered = answeredCount === quiz.questions.length;
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
  const visibleOptions = attemptId
    ? shuffleOptionsForAttempt(
        currentQuestion.options,
        attemptId,
        currentQuestion.id
      )
    : [...currentQuestion.options].sort((a, b) => a.sort_order - b.sort_order);

  const goBackToTrack = async () => {
    if (pendingSaveRef.current) {
      await pendingSaveRef.current;
    }
    markCompanyChallengeListStale(companyId);
    router.push(returnToTrackHref);
  };

  if (result) {
    return (
      <MotionPage>
        <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 rounded-2xl bg-white p-4 text-text">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#155dfc]">
            Challenge Complete
          </p>
          <div className="relative flex items-center justify-center py-1">
            <div className="animate-completion-pop relative grid h-16 w-16 place-items-center rounded-full border border-[#bfdbfe] bg-gradient-to-br from-[#dbeafe] to-white">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#155dfc] text-white">
                <CheckCircleFilledIcon className="h-7 w-7" />
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
            onClick={goBackToTrack}
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
          <button
            type="button"
            onClick={goBackToTrack}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[#0f172b]',
              iconBtnInteractive,
              focusRingInteractive
            )}
            aria-label="Back"
          >
            <ChevronLeftFilledIcon className="h-4 w-4" />
          </button>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-primary">
            Step {activeIndex + 1}/{quiz.questions.length}
          </p>
        </header>

        <div className="h-2 rounded-pill bg-surface-soft">
          <div
            className="h-full rounded-pill bg-primary"
            style={{
              width: `${(answeredCount / Math.max(quiz.questions.length, 1)) * 100}%`
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

        <section className="w-full rounded-2xl bg-white p-3">
          {currentState.isSolved ? (
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-green-800">
              <CheckCircleFilledIcon className="h-3 w-3" />
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
          {visibleOptions.map((option, index) => {
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
                  Option {String.fromCharCode(65 + index)}
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
              <ChevronLeftFilledIcon className="h-4 w-4" /> Previous
            </MotionButton>
            <MotionButton
              type="button"
              onClick={() => {
                if (!canMoveNext || finishing) return;
                if (isLastStep) {
                  if (!allQuestionsAnswered) return;
                  finalizeAttempt();
                  return;
                }
                setActiveIndex((value) =>
                  Math.min(quiz.questions.length - 1, value + 1)
                );
              }}
              disabled={
                !canMoveNext ||
                finishing ||
                (isLastStep && !allQuestionsAnswered)
              }
              className={cn(
                'inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#ffd230] bg-[#f59e0b] px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white disabled:opacity-50',
                btnInteractive,
                btnInteractiveColored,
                focusRingInteractive
              )}
            >
              {isLastStep ? 'Finish' : 'Next'}{' '}
              <ChevronRightFilledIcon className="h-4 w-4" />
            </MotionButton>
          </div>
          <MotionButton
            type="button"
            onClick={goBackToTrack}
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

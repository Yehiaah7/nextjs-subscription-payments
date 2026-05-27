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
import {
  addChallengeCompletedNotification,
  addPartialChallengeProgressNotification
} from '@/lib/notifications/store';
import {
  buildCanonicalAttemptByQuizId,
  calculateQuizAttemptProgress
} from '../../companies/company-summary';

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

type AnswerPayload = {
  attempt_id: string;
  question_id: string;
  option_id: string;
  points_awarded: number;
  text_answer: string;
};

type SaveAnswerResult = {
  data: unknown;
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
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

const getSavedAnsweredQuestionIds = (
  answers: { question_id: string }[],
  questions: Pick<Question, 'id'>[]
) => {
  const quizQuestionIds = new Set(questions.map((question) => question.id));
  return new Set(
    answers
      .map((answer) => answer.question_id)
      .filter((questionId) => quizQuestionIds.has(questionId))
  );
};

const saveAnswer = async (
  supabase: any,
  answerPayload: AnswerPayload
): Promise<SaveAnswerResult> => {
  const { data: updatedAnswer, error: updateError } = await supabase
    .from('answers')
    .update(answerPayload)
    .eq('attempt_id', answerPayload.attempt_id)
    .eq('question_id', answerPayload.question_id)
    .select('attempt_id,question_id,option_id,points_awarded,text_answer');

  if (updateError) {
    return { data: updatedAnswer, error: updateError };
  }

  if (updatedAnswer?.length) {
    return { data: updatedAnswer, error: null };
  }

  const { data: insertedAnswer, error: insertError } = await supabase
    .from('answers')
    .insert(answerPayload)
    .select('attempt_id,question_id,option_id,points_awarded,text_answer');

  return { data: insertedAnswer, error: insertError };
};

export default function QuizScreen({ challengeId }: { challengeId: string }) {
  const supabase = useMemo(() => createClient() as any, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyId, setCompanyId] = useState<string | null>(
    searchParams.get('company')
  );
  const [userId, setUserId] = useState<string | null>(null);
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/home';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    scorePercent: number;
    awarded: number;
    total: number;
  } | null>(null);
  const [nextChallengeId, setNextChallengeId] = useState<string | null>(null);
  const [attemptStates, setAttemptStates] = useState<
    Record<string, AttemptState>
  >({});
  const [persistedAnsweredQuestionIds, setPersistedAnsweredQuestionIds] =
    useState<Set<string>>(new Set());
  const pendingSaveRef = useRef<Promise<SaveAnswerResult> | null>(null);
  const loadQuizKeyRef = useRef<string | null>(null);
  const [wrongAnimatingOptionId, setWrongAnimatingOptionId] = useState<
    string | null
  >(null);
  const reducedMotion = useReducedMotionPref();

  const currentQuestion = quiz?.questions[activeIndex] ?? null;

  useEffect(() => {
    const retryRequested = searchParams.get('retry') === '1';
    const requestedAttemptId = searchParams.get('attempt');
    const loadQuizKey = `${challengeId}:${retryRequested ? 'retry' : (requestedAttemptId ?? 'resume')}`;
    if (loadQuizKeyRef.current === loadQuizKey) return;
    loadQuizKeyRef.current = loadQuizKey;

    setQuiz(null);
    setAttemptId(null);
    setActiveIndex(0);
    setLoading(true);
    setResult(null);
    setNextChallengeId(null);
    setAttemptStates({});
    setPersistedAnsweredQuestionIds(new Set());
    pendingSaveRef.current = null;
    setWrongAnimatingOptionId(null);

    const loadQuiz = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const loadQuiz = (questionExplanationField: 'explanation' | 'feedback') =>
        supabase
          .from('quizzes')
          .select(
            `id,title,module_id,pass_score,modules(title,track_id),questions(id,prompt,${questionExplanationField},sort_order,points,options(id,label,sort_order,is_correct))`
          )
          .eq('id', challengeId)
          .single();

      let questionExplanationField: 'explanation' | 'feedback' = 'explanation';
      let { data: quizData, error: quizDataError } = await loadQuiz(
        questionExplanationField
      );
      if (quizDataError) {
        const fallback = await loadQuiz('feedback');
        if (fallback.error) {
          throw quizDataError;
        }
        questionExplanationField = 'feedback';
        quizData = fallback.data;
      }

      if (!quizData) return;

      const normalizedQuiz = {
        ...quizData,
        questions: (quizData.questions ?? [])
          .map((question: any) => ({
            ...question,
            explanation:
              questionExplanationField === 'feedback'
                ? (question.feedback ?? null)
                : (question.explanation ?? null)
          }))
          .sort(
          (a: Question, b: Question) => a.sort_order - b.sort_order
        )
      } as Quiz;
      setQuiz(normalizedQuiz);
      if (!companyId && normalizedQuiz.modules?.track_id) {
        setCompanyId(normalizedQuiz.modules.track_id);
      }

      const trackId = normalizedQuiz.modules?.track_id ?? companyId;
      if (trackId) {
        const { data: trackQuizzesData } = await supabase
          .from('quizzes')
          .select('id,title,modules!inner(track_id)')
          .eq('modules.track_id', trackId)
          .order('title', { ascending: true });
        const trackQuizzes = (trackQuizzesData ?? []) as {
          id: string;
          title: string;
        }[];
        const currentQuizIndex = trackQuizzes.findIndex(
          (item) => item.id === challengeId
        );
        setNextChallengeId(trackQuizzes[currentQuizIndex + 1]?.id ?? null);
      }

      const { data: attemptsData } = await supabase
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,score,started_at')
        .eq('quiz_id', challengeId)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      const existingAttempts = attemptsData ?? [];
      const existingAttemptIds = existingAttempts.map((attempt: any) =>
        String(attempt.id)
      );
      const { data: existingAnswersData } = existingAttemptIds.length
        ? await supabase
            .from('answers')
            .select(
              'attempt_id,question_id,option_id,points_awarded,text_answer,options(is_correct)'
            )
            .in('attempt_id', existingAttemptIds)
        : { data: [] };
      const answersByAttemptId = new Map<string, any[]>();
      for (const answer of existingAnswersData ?? []) {
        const answerAttemptId = String(answer.attempt_id);
        answersByAttemptId.set(answerAttemptId, [
          ...(answersByAttemptId.get(answerAttemptId) ?? []),
          answer
        ]);
      }
      const canonicalAttemptByQuizId =
        buildCanonicalAttemptByQuizId(existingAttempts);
      const requestedAttempt = requestedAttemptId
        ? existingAttempts.find(
            (attempt: any) => String(attempt.id) === requestedAttemptId
          )
        : null;
      let effectiveAttempt = retryRequested
        ? null
        : (requestedAttempt ?? canonicalAttemptByQuizId[challengeId] ?? null);
      if (!effectiveAttempt) {
        const { data: newAttempt } = await supabase
          .from('attempts')
          .insert({ quiz_id: challengeId, user_id: user.id })
          .select('id,quiz_id,submitted_at,passed,score,started_at')
          .single();
        effectiveAttempt = newAttempt;
      }

      if (!effectiveAttempt) return;
      setAttemptId(effectiveAttempt.id);
      const answersData =
        answersByAttemptId.get(String(effectiveAttempt.id)) ?? [];
      const persistedAnsweredIds = getSavedAnsweredQuestionIds(
        answersData ?? [],
        normalizedQuiz.questions
      );
      const totalPoints = normalizedQuiz.questions.reduce(
        (sum, question) => sum + question.points,
        0
      );
      const awardedPoints = (answersData ?? []).reduce(
        (sum: number, answer: any) =>
          persistedAnsweredIds.has(answer.question_id)
            ? sum + (answer.points_awarded ?? 0)
            : sum,
        0
      );
      const innerProgress = calculateQuizAttemptProgress({
        attempt: effectiveAttempt,
        answeredQuestionIds: persistedAnsweredIds,
        totalSteps: normalizedQuiz.questions.length,
        awardedPoints,
        totalPoints,
        passScore: normalizedQuiz.pass_score ?? 60
      });

      console.log('[QuizTrace] load attempt + resume seed', {
        challengeId,
        attemptId: effectiveAttempt.id,
        answeredCount: innerProgress.answeredCount,
        totalSteps: innerProgress.totalSteps,
        score: innerProgress.score,
        isCompleted: innerProgress.isCompleted,
        innerQuizSolvedState: innerProgress.status,
        requestedAttemptId,
        selectedAttemptSource: requestedAttempt
          ? 'outerCardAttemptQuery'
          : 'canonicalAttemptByQuizId',
        totalQuestions: normalizedQuiz.questions.length
      });

      const nextStates: Record<string, AttemptState> = {};
      for (const answer of answersData ?? []) {
        if (!persistedAnsweredIds.has(answer.question_id)) continue;
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
      setPersistedAnsweredQuestionIds(persistedAnsweredIds);

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
        answeredCount: persistedAnsweredIds.size,
        firstPending,
        resumeIndex,
        resumeStep: resumeIndex + 1
      });
      console.log(
        `[RuntimeProof] reopen resume index=${resumeIndex} resume question number=${resumeIndex + 1} quiz attempt id=${effectiveAttempt.id}`
      );
    };

    loadQuiz().finally(() => setLoading(false));
  }, [challengeId, searchParams, supabase]);

  const finalizeAttempt = async () => {
    if (!attemptId || !quiz) return;

    const selectedQuestionIds = new Set<string>();
    let awarded = 0;
    const totalPossible = quiz.questions.reduce(
      (sum, item) => sum + item.points,
      0
    );

    for (const question of quiz.questions) {
      const questionState = attemptStates[question.id] ?? emptyAttemptState;
      if (questionState.lastSelectedOptionId) {
        selectedQuestionIds.add(question.id);
      }
      awarded += questionState.pointsAwarded;
    }

    if (selectedQuestionIds.size !== quiz.questions.length) {
      setPersistedAnsweredQuestionIds(selectedQuestionIds);
      return;
    }

    const finalScore = Math.round((awarded / Math.max(totalPossible, 1)) * 100);

    setPersistedAnsweredQuestionIds(selectedQuestionIds);
    setResult({ scorePercent: finalScore, awarded, total: totalPossible });
    markCompanyChallengeListStale(companyId);

    const finishInBackground = async () => {
      if (pendingSaveRef.current) {
        await pendingSaveRef.current;
      }

      await supabase
        .from('attempts')
        .update({
          submitted_at: new Date().toISOString(),
          score: finalScore,
          passed: true
        })
        .eq('id', attemptId);

      if (userId) {
        addChallengeCompletedNotification({ userId, challengeId });
      }
    };

    finishInBackground().catch((error) => {
      console.error('[QuizTrace] finalize sync failed', {
        attemptId,
        error
      });
    });
  };

  const onSelectOption = async (question: Question, optionId: string) => {
    if (!attemptId) return;

    const option = question.options.find((item) => item.id === optionId);
    if (!option) return;

    const previousState = attemptStates[question.id] ?? emptyAttemptState;
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

    setAttemptStates((current) => ({
      ...current,
      [question.id]: nextStateForQuestion
    }));

    if (!option.is_correct) {
      setWrongAnimatingOptionId(option.id);
      window.setTimeout(() => {
        setWrongAnimatingOptionId((current) =>
          current === option.id ? null : current
        );
      }, 220);
    }

    const answerPayload: AnswerPayload = {
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

    console.log('[QuizTrace] answers save payload', answerPayload);

    setPersistedAnsweredQuestionIds((current) => {
      const next = new Set(current);
      next.add(question.id);
      return next;
    });

    const previousSave = pendingSaveRef.current ?? Promise.resolve();
    const savePromise = previousSave
      .catch(() => undefined)
      .then(() => saveAnswer(supabase, answerPayload));

    pendingSaveRef.current = savePromise;
    const saveResult = await savePromise;

    if (saveResult.error) {
      console.error('[QuizTrace] answer save failed', {
        attemptId,
        questionId: question.id,
        error: saveResult.error
      });
      if (pendingSaveRef.current === savePromise) {
        pendingSaveRef.current = null;
      }
      return;
    }

    const optimisticAnsweredQuestionIds = new Set(persistedAnsweredQuestionIds);
    optimisticAnsweredQuestionIds.add(question.id);
    const savedCount = optimisticAnsweredQuestionIds.size;
    const inQuizProgressValue =
      (savedCount / Math.max(quiz?.questions.length ?? 1, 1)) * 100;

    console.log('[QuizTrace] answer saved in background', {
      attemptId,
      questionId: question.id,
      saveResultError: null,
      saveResultData: saveResult.data ?? null,
      optimisticAnswersCountForAttempt: savedCount,
      inQuizProgressValue
    });
    console.log(
      `[RuntimeProof] quiz attempt id=${attemptId} optimistic answers count=${savedCount} in-quiz progress=${inQuizProgressValue}% after question=${savedCount}`
    );
    markCompanyChallengeListStale(companyId);
    if (pendingSaveRef.current === savePromise) {
      pendingSaveRef.current = null;
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
  const inQuizProgressPercent =
    (answeredCount / Math.max(quiz.questions.length, 1)) * 100;
  const isLastStep = activeIndex === quiz.questions.length - 1;
  const canMoveNext = Boolean(currentState.lastSelectedOptionId);
  const selectedQuestionIds = new Set(persistedAnsweredQuestionIds);
  for (const [questionId, state] of Object.entries(attemptStates)) {
    if (state.lastSelectedOptionId) {
      selectedQuestionIds.add(questionId);
    }
  }
  const allQuestionsSelected =
    selectedQuestionIds.size === quiz.questions.length;
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

  const goBackToTrack = () => {
    if (
      userId &&
      !result &&
      inQuizProgressPercent > 0 &&
      inQuizProgressPercent < 100
    ) {
      addPartialChallengeProgressNotification({
        userId,
        challengeId,
        progressPercent: inQuizProgressPercent
      });
    }

    markCompanyChallengeListStale(companyId);
    router.push(returnToTrackHref);
    pendingSaveRef.current?.catch((error) => {
      console.error(
        '[QuizTrace] background answer sync failed before leaving',
        {
          attemptId,
          error
        }
      );
    });
  };

  const goToNextChallenge = () => {
    if (!nextChallengeId) return;
    markCompanyChallengeListStale(companyId);
    router.push(
      `/challenge/${nextChallengeId}${companyId ? `?company=${companyId}` : ''}`
    );
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
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white">
                <CheckCircleFilledIcon className="h-7 w-7 text-[#22c55e]" />
              </div>
            </div>
          </div>
          <h1 className="animate-completion-pop text-base font-bold leading-6 text-[#0f172b]">
            You completed this challenge
          </h1>
          <p className="animate-completion-pop text-sm text-[#45556c]">
            Your final answer was saved, the challenge is now finished, and your
            progress has been updated. You can continue to the next challenge if
            you want.
          </p>
          <div className="animate-completion-pop rounded-2xl bg-surface-soft p-3 text-sm text-[#45556c]">
            <p className="font-bold text-[#0f172b]">
              Score: {result.scorePercent}%
            </p>
            <p>
              Points earned: {result.awarded}/{result.total}
            </p>
            <p>Progress: 100% complete</p>
          </div>
          <div className="grid gap-2">
            <MotionButton
              type="button"
              onClick={goToNextChallenge}
              disabled={!nextChallengeId}
              className={cn(
                'inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-success-button bg-success-button px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50',
                btnInteractive,
                btnInteractiveColored,
                focusRingInteractive
              )}
            >
              Go to next challenge
              <ChevronRightFilledIcon className="h-4 w-4" />
            </MotionButton>
            <MotionButton
              type="button"
              onClick={goBackToTrack}
              className={cn(
                'inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#0f172b]',
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
              width: `${inQuizProgressPercent}%`
            }}
          />
        </div>

        <section className="w-full rounded-2xl border border-[#bfe7d1] bg-[#f3fbf6] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#2f8a5d]">
            {quiz.modules?.title ?? 'Challenge'}
          </p>
          <h1 className="mt-2 text-base font-bold leading-6 text-[#124a2f]">
            {quiz.title}
          </h1>
        </section>

        <section className="w-full rounded-2xl border border-[#d8efe1] bg-[#f8fdf9] p-3">
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
                if (!canMoveNext) return;
                if (isLastStep) {
                  if (!allQuestionsSelected) return;
                  finalizeAttempt();
                  return;
                }
                setActiveIndex((value) =>
                  Math.min(quiz.questions.length - 1, value + 1)
                );
              }}
              disabled={!canMoveNext || (isLastStep && !allQuestionsSelected)}
              className={cn(
                'inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white disabled:opacity-50',
                isLastStep
                  ? 'border-success-button bg-success-button'
                  : 'border-[#1447e6] bg-[#155dfc]',
                btnInteractive,
                btnInteractiveColored,
                focusRingInteractive
              )}
            >
              {isLastStep ? (
                'Finish'
              ) : (
                <>
                  Next <ChevronRightFilledIcon className="h-4 w-4" />
                </>
              )}
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

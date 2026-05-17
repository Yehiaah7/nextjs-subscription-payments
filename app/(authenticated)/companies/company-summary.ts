import { getCompanyLogoSrc } from './company-logo';

export type CompanySummary = {
  id: string;
  name: string;
  logo: string | null;
  focus: string;
  challengesCount: number;
  practicingCount: string;
  progress: number;
};

type AttemptLike = {
  id: string;
  quiz_id: string;
  submitted_at: string | null;
  passed?: boolean | null;
  score?: number | null;
  started_at?: string;
};

export type QuizProgressStatus = 'in-progress' | 'not-solved' | 'solved';

export type QuizAttemptProgress = {
  attempt: AttemptLike | null;
  attemptId: string | null;
  answeredCount: number;
  answeredSteps: number;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  score: number;
  isCompleted: boolean;
  passed: boolean;
  solvedBadgeValue: 'IN PROGRESS' | 'NOT SOLVED' | 'SOLVED';
  tabClassification: QuizProgressStatus;
  status: QuizProgressStatus;
};

const getAttemptStartedAtMs = (attempt: AttemptLike) =>
  attempt.started_at ? new Date(attempt.started_at).getTime() : 0;

const getAttemptCardPriority = (attempt: AttemptLike) => {
  if (attempt.submitted_at && attempt.passed) return 3;
  if (!attempt.submitted_at) return 2;
  return 1;
};

const shouldUseAttemptForCards = (
  current: AttemptLike | undefined,
  candidate: AttemptLike
) => {
  if (!current) return true;

  const currentPriority = getAttemptCardPriority(current);
  const candidatePriority = getAttemptCardPriority(candidate);
  if (candidatePriority !== currentPriority) {
    return candidatePriority > currentPriority;
  }

  return getAttemptStartedAtMs(candidate) > getAttemptStartedAtMs(current);
};

export const buildCanonicalAttemptByQuizId = <T extends AttemptLike>(
  attempts: T[]
) =>
  attempts.reduce((acc: Record<string, T>, attempt) => {
    if (shouldUseAttemptForCards(acc[attempt.quiz_id], attempt)) {
      acc[attempt.quiz_id] = attempt;
    }
    return acc;
  }, {});

export const buildCanonicalActiveAttemptByQuizId =
  buildCanonicalAttemptByQuizId;

const hashString = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);

const deterministicRange = (seedSource: string, min: number, max: number) =>
  min + (hashString(seedSource) % (max - min + 1));

export const normalizeFocus = (description: string | null) =>
  (description ?? '').replace(/^(focus:\s*)+/i, '').trim();

export const buildCompanySummary = ({
  id,
  title,
  description,
  challengeCount,
  progress
}: {
  id: string;
  title: string;
  description: string | null;
  challengeCount: number;
  progress: number;
}): CompanySummary => ({
  id,
  name: title,
  logo: getCompanyLogoSrc({ companyId: id, companyName: title }),
  focus: normalizeFocus(description),
  challengesCount: challengeCount,
  practicingCount: `${deterministicRange(id, 50, 150)}`,
  progress
});

export const calculateCompanyProgress = ({
  quizIds,
  questionCountByQuizId,
  canonicalAttemptByQuizId,
  answeredCountByAttempt
}: {
  quizIds: string[];
  questionCountByQuizId: Record<string, number>;
  canonicalAttemptByQuizId: Record<string, AttemptLike>;
  answeredCountByAttempt: Record<string, Set<string>>;
}) => {
  const totalSteps = quizIds.reduce(
    (sum, quizId) => sum + (questionCountByQuizId[quizId] ?? 0),
    0
  );

  const answeredSteps = quizIds.reduce((sum, quizId) => {
    const attemptId = canonicalAttemptByQuizId[quizId]?.id;
    if (!attemptId) return sum;
    return (
      sum +
      Math.min(
        answeredCountByAttempt[attemptId]?.size ?? 0,
        questionCountByQuizId[quizId] ?? 0
      )
    );
  }, 0);

  return totalSteps ? Math.round((answeredSteps / totalSteps) * 100) : 0;
};

export const calculateQuizAttemptProgress = ({
  attempt,
  answeredQuestionIds,
  totalSteps,
  awardedPoints,
  totalPoints,
  passScore
}: {
  attempt: AttemptLike | null;
  answeredQuestionIds: Set<string>;
  totalSteps: number;
  awardedPoints: number;
  totalPoints: number;
  passScore: number;
}): QuizAttemptProgress => {
  const answeredCount = Math.min(answeredQuestionIds.size, totalSteps);
  const hasAnsweredEveryStep = totalSteps > 0 && answeredCount === totalSteps;
  const calculatedScore = totalPoints
    ? Math.round((awardedPoints / totalPoints) * 100)
    : 0;
  const score =
    attempt?.submitted_at && attempt.score != null
      ? attempt.score
      : calculatedScore;
  const passed = attempt?.submitted_at
    ? Boolean(attempt.passed)
    : score >= passScore;
  const isCompleted =
    hasAnsweredEveryStep && Boolean(attempt?.submitted_at) && passed;
  const progressPercent = totalSteps
    ? Math.round((answeredCount / totalSteps) * 100)
    : 0;
  const completedSteps = answeredCount;
  const tabClassification: QuizProgressStatus =
    answeredCount === 0
      ? 'not-solved'
      : answeredCount < totalSteps
        ? 'in-progress'
        : isCompleted
          ? 'solved'
          : 'not-solved';
  const solvedBadgeValue =
    tabClassification === 'solved'
      ? 'SOLVED'
      : tabClassification === 'in-progress'
        ? 'IN PROGRESS'
        : 'NOT SOLVED';

  return {
    attempt,
    attemptId: attempt?.id ?? null,
    answeredCount,
    answeredSteps: answeredCount,
    completedSteps,
    totalSteps,
    progressPercent,
    score,
    isCompleted,
    passed,
    solvedBadgeValue,
    tabClassification,
    status: tabClassification
  };
};

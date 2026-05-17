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
};

export type QuizProgressStatus = 'in-progress' | 'not-solved' | 'solved';

export type QuizAttemptProgress = {
  attempt: AttemptLike | null;
  answeredSteps: number;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  score: number;
  passed: boolean;
  status: QuizProgressStatus;
};

export const buildCanonicalAttemptByQuizId = <T extends AttemptLike>(
  attempts: T[]
) =>
  attempts.reduce((acc: Record<string, T>, attempt) => {
    const existing = acc[attempt.quiz_id];
    if (!existing || (!attempt.submitted_at && existing.submitted_at)) {
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
    return sum + (answeredCountByAttempt[attemptId]?.size ?? 0);
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
  const answeredSteps = Math.min(answeredQuestionIds.size, totalSteps);
  const progressPercent = totalSteps
    ? Math.round((answeredSteps / totalSteps) * 100)
    : 0;
  const score = totalPoints
    ? Math.round((awardedPoints / totalPoints) * 100)
    : 0;
  const hasCompletedAllSteps = totalSteps > 0 && answeredSteps >= totalSteps;
  const passed = hasCompletedAllSteps && score >= passScore;
  const status: QuizProgressStatus = passed
    ? 'solved'
    : answeredSteps > 0 && !hasCompletedAllSteps
      ? 'in-progress'
      : 'not-solved';

  return {
    attempt,
    answeredSteps,
    completedSteps: answeredSteps,
    totalSteps,
    progressPercent,
    score,
    passed,
    status
  };
};

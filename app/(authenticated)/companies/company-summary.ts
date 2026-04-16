import type { CompanyTrack } from './CompaniesScreen';

export type CompanySummary = CompanyTrack;

type AttemptLike = {
  id: string;
  quiz_id: string;
  submitted_at: string | null;
};

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
  title,
  focus: normalizeFocus(description),
  challengesCount: challengeCount,
  practicingCount: `${deterministicRange(id, 50, 150)}`,
  progress
});

export const calculateCompanyProgress = ({
  quizIds,
  questionCountByQuizId,
  latestAttemptByQuizId,
  latestActiveAttemptByQuizId,
  answeredCountByAttempt
}: {
  quizIds: string[];
  questionCountByQuizId: Record<string, number>;
  latestAttemptByQuizId: Record<string, AttemptLike>;
  latestActiveAttemptByQuizId: Record<string, AttemptLike>;
  answeredCountByAttempt: Record<string, Set<string>>;
}) => {
  const totalSteps = quizIds.reduce(
    (sum, quizId) => sum + (questionCountByQuizId[quizId] ?? 0),
    0
  );

  const answeredSteps = quizIds.reduce((sum, quizId) => {
    const attemptId =
      latestActiveAttemptByQuizId[quizId]?.id ??
      latestAttemptByQuizId[quizId]?.id;
    if (!attemptId) return sum;
    return sum + (answeredCountByAttempt[attemptId]?.size ?? 0);
  }, 0);

  return totalSteps ? Math.round((answeredSteps / totalSteps) * 100) : 0;
};

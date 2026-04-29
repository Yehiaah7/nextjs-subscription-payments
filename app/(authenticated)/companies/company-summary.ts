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

export const buildCanonicalActiveAttemptByQuizId = <T extends AttemptLike>(
  attempts: T[]
) =>
  attempts.reduce(
    (acc: Record<string, T>, attempt) => {
      if (!attempt.submitted_at && !acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt;
      }
      return acc;
    },
    {}
  );

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
  canonicalActiveAttemptByQuizId,
  answeredCountByAttempt
}: {
  quizIds: string[];
  questionCountByQuizId: Record<string, number>;
  canonicalActiveAttemptByQuizId: Record<string, AttemptLike>;
  answeredCountByAttempt: Record<string, Set<string>>;
}) => {
  const totalSteps = quizIds.reduce(
    (sum, quizId) => sum + (questionCountByQuizId[quizId] ?? 0),
    0
  );

  const answeredSteps = quizIds.reduce((sum, quizId) => {
    const attemptId = canonicalActiveAttemptByQuizId[quizId]?.id;
    if (!attemptId) return sum;
    return sum + (answeredCountByAttempt[attemptId]?.size ?? 0);
  }, 0);

  return totalSteps ? Math.round((answeredSteps / totalSteps) * 100) : 0;
};

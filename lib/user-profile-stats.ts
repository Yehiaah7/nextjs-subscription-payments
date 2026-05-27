import { createClient } from '@/utils/supabase/server';
import type { UserProfileStats } from '@/types/user-profile-stats';

type AttemptStatRow = {
  id: string;
  quiz_id: string;
  started_at: string | null;
  submitted_at: string | null;
  passed: boolean | null;
};

type AnswerStatRow = {
  attempt_id: string;
  question_id: string;
  points_awarded: number | null;
  options: { is_correct: boolean } | null;
  attempts: { user_id: string; started_at: string | null } | null;
};

const unavailableReason =
  'This stat will appear when real data becomes available.';

const unavailableStat = () => ({
  value: '-',
  isAvailable: false,
  unavailableReason
});

const availableStat = (value: number | string) => ({
  value: String(value),
  isAvailable: true
});

const toUtcDateKey = (value: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
};

export async function getUserProfileStats(
  userId: string
): Promise<UserProfileStats> {
  const db = createClient();
  const { data, error } = await db
    .from('attempts')
    .select('id,quiz_id,started_at,submitted_at,passed')
    .eq('user_id', userId);

  const rank = unavailableStat();

  if (error) {
    return {
      rank,
      solved: unavailableStat(),
      solvingDays: unavailableStat(),
      questionsSolved: unavailableStat(),
      firstTryAccuracy: unavailableStat()
    };
  }

  const attempts = (data ?? []) as AttemptStatRow[];
  const solvedChallengeIds = new Set(
    attempts
      .filter((attempt) => attempt.passed === true)
      .map((attempt) => attempt.quiz_id)
      .filter(Boolean)
  );
  const solvingDayKeys = new Set(
    attempts
      .flatMap((attempt) => [attempt.started_at, attempt.submitted_at])
      .map(toUtcDateKey)
      .filter((dateKey): dateKey is string => Boolean(dateKey))
  );

  const { data: answersData, error: answersError } = await db
    .from('answers')
    .select(
      'attempt_id,question_id,points_awarded,options(is_correct),attempts!inner(user_id,started_at)'
    )
    .eq('attempts.user_id', userId);

  const answers = answersError ? [] : ((answersData ?? []) as AnswerStatRow[]);
  const uniqueSolvedQuestionIds = new Set(
    answers.map((answer) => answer.question_id)
  );

  const firstAnswerByQuestion = new Map<string, AnswerStatRow>();

  for (const answer of answers) {
    const existing = firstAnswerByQuestion.get(answer.question_id);
    if (!existing) {
      firstAnswerByQuestion.set(answer.question_id, answer);
      continue;
    }

    // Answer rows are upserted per attempt/question. We derive "first try"
    // from the earliest persisted attempt timestamp available in storage.
    const existingTime = existing.attempts?.started_at ?? '';
    const nextTime = answer.attempts?.started_at ?? '';

    if (nextTime && (!existingTime || nextTime < existingTime)) {
      firstAnswerByQuestion.set(answer.question_id, answer);
      continue;
    }

    if (nextTime === existingTime && answer.attempt_id < existing.attempt_id) {
      firstAnswerByQuestion.set(answer.question_id, answer);
    }
  }

  const firstAnswers = Array.from(firstAnswerByQuestion.values());
  const firstTryCorrectCount = firstAnswers.filter(
    (answer) =>
      answer.options?.is_correct === true || (answer.points_awarded ?? 0) > 0
  ).length;

  const firstTryAccuracy = firstAnswers.length
    ? Math.round((firstTryCorrectCount / firstAnswers.length) * 100)
    : 0;

  return {
    rank,
    solved: availableStat(solvedChallengeIds.size),
    solvingDays: availableStat(solvingDayKeys.size),
    questionsSolved: answersError
      ? unavailableStat()
      : availableStat(uniqueSolvedQuestionIds.size),
    firstTryAccuracy: answersError
      ? unavailableStat()
      : availableStat(`${firstTryAccuracy}%`)
  };
}

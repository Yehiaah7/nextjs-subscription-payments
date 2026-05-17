import { createClient } from '@/utils/supabase/server';
import type { UserProfileStats } from '@/types/user-profile-stats';

type AttemptStatRow = {
  quiz_id: string;
  started_at: string | null;
  submitted_at: string | null;
  passed: boolean | null;
};

const unavailableReason =
  'This stat will appear when real data becomes available.';

const unavailableStat = () => ({
  value: '-',
  isAvailable: false,
  unavailableReason
});

const availableStat = (value: number) => ({
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
    .select('quiz_id,started_at,submitted_at,passed')
    .eq('user_id', userId);

  const rank = unavailableStat();

  if (error) {
    return {
      rank,
      solved: unavailableStat(),
      solvingDays: unavailableStat()
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

  return {
    rank,
    solved: availableStat(solvedChallengeIds.size),
    solvingDays: availableStat(solvingDayKeys.size)
  };
}

import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/auth/require-user';
import CompaniesScreen, { CompanyTrack } from '../CompaniesScreen';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
};

type QuizRow = {
  id: string;
  difficulty: 'junior' | 'mid' | 'senior' | null;
  modules: { track_id: string } | null;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  submitted_at: string | null;
  passed: boolean | null;
  started_at: string;
};

const hashString = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);

const deterministicRange = (seedSource: string, min: number, max: number) =>
  min + (hashString(seedSource) % (max - min + 1));

const normalizeFocus = (description: string | null) =>
  (description ?? '').replace(/^(focus:\s*)+/i, '').trim();

const toCompanyTrack = (track: TrackRow, challengeCount: number, progress: number): CompanyTrack => ({
  id: track.id,
  title: track.title,
  focus: normalizeFocus(track.description),
  challengesCount: challengeCount,
  practicingCount: `${deterministicRange(track.id, 50, 150)}`,
  progress
});

export default async function ViewAllCompaniesPage() {
  const user = await requireUser();
  const db = createClient();

  const { data: tracksData, error: tracksError } = await db
    .from('tracks')
    .select('id,title,description')
    .eq('type', 'company')
    .eq('is_published', true)
    .order('title', { ascending: true });

  if (tracksError) {
    throw new Error(`Failed to load companies: ${tracksError.message}`);
  }

  const tracks = Array.from(new Map(((tracksData ?? []) as TrackRow[]).map((track) => [track.id, track])).values());
  const trackIds = tracks.map((track) => track.id);

  const { data: allQuizzesData, error: quizzesError } = trackIds.length
    ? await db
        .from('quizzes')
        .select('id,difficulty,modules!inner(track_id)')
        .in('modules.track_id', trackIds)
    : { data: [] as QuizRow[], error: null };

  if (quizzesError) {
    throw new Error(`Failed to load quizzes: ${quizzesError.message}`);
  }

  const allQuizzes = (allQuizzesData ?? []) as QuizRow[];
  const quizIds = allQuizzes.map((quiz) => quiz.id);

  const { data: attemptsData, error: attemptsError } = quizIds.length
    ? await db
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[], error: null };

  if (attemptsError) {
    throw new Error(`Failed to load attempts: ${attemptsError.message}`);
  }

  const attempts = (attemptsData ?? []) as AttemptRow[];

  const latestAttemptByQuizId = attempts.reduce(
    (acc: Record<string, AttemptRow>, attempt) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt;
      }
      return acc;
    },
    {}
  );

  const quizzesByTrack = allQuizzes.reduce(
    (acc: Record<string, QuizRow[]>, quiz) => {
      const trackId = quiz.modules?.track_id;
      if (!trackId) return acc;
      acc[trackId] ??= [];
      acc[trackId].push(quiz);
      return acc;
    },
    {}
  );

  const companyTracks = tracks.map((track) => {
    const quizzesForTrack = quizzesByTrack[track.id] ?? [];
    const solvedQuizzes = quizzesForTrack.reduce((count, quiz) => {
      const latestAttempt = latestAttemptByQuizId[quiz.id];
      if (!latestAttempt?.submitted_at) return count;
      return latestAttempt.passed ? count + 1 : count;
    }, 0);

    const progress = quizzesForTrack.length ? Math.round((solvedQuizzes / quizzesForTrack.length) * 100) : 0;

    return toCompanyTrack(track, quizzesForTrack.length, progress);
  });

  return <CompaniesScreen companyTracks={companyTracks} />;
}

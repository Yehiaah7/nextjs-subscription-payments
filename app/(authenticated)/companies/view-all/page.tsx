import { createUntypedClient } from '@/utils/supabase/untyped';
import { requireUser } from '@/utils/auth/require-user';
import CompaniesScreen, { CompanyTrack } from '../CompaniesScreen';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
};

type QuizRow = {
  id: string;
  module_id: string | null;
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

const deterministicRange = (seedSource: string, min: number, max: number) => min + (hashString(seedSource) % (max - min + 1));

const toCompanyTrack = (
  track: TrackRow,
  challengeCount: number,
  solvedChallenges: number
): CompanyTrack => {
  const progress = challengeCount ? Math.round((solvedChallenges / challengeCount) * 100) : 0;

  return {
    id: track.id,
    title: track.title,
    focus: track.description ?? 'Company Practice',
    challengesCount: challengeCount,
    practicingCount: `${deterministicRange(track.id, 50, 150)}`,
    progress
  };
};

export default async function ViewAllCompaniesPage() {
  const user = await requireUser();

  const db = createUntypedClient();
  const { data: tracksData } = await db
    .from('tracks' as any)
    .select('id,title,description')
    .eq('type', 'company')
    .eq('is_published', true)
    .order('title', { ascending: true });

  const tracks = Array.from(new Map(((tracksData ?? []) as TrackRow[]).map((track) => [track.id, track])).values());
  const trackIds = tracks.map((track) => track.id);

  const { data: allQuizzesData } = trackIds.length
    ? await db.from('quizzes').select('id,module_id,modules!inner(track_id)').in('modules.track_id', trackIds)
    : { data: [] as QuizRow[] };
  const allQuizzes = (allQuizzesData ?? []) as QuizRow[];
  const quizIds = allQuizzes.map((quiz) => quiz.id);

  const { data: attemptsData } = quizIds.length
    ? await db
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[] };
  const attempts = (attemptsData ?? []) as AttemptRow[];

  const attemptsByQuiz = attempts.reduce(
    (acc: Record<string, AttemptRow[]>, attempt) => {
      acc[attempt.quiz_id] ??= [];
      acc[attempt.quiz_id].push(attempt);
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
    const solvedChallenges = quizzesForTrack.filter((quiz) =>
      (attemptsByQuiz[quiz.id] ?? []).some((attempt) => Boolean(attempt.submitted_at) && Boolean(attempt.passed))
    ).length;
    return toCompanyTrack(track, quizzesForTrack.length, solvedChallenges);
  });

  return <CompaniesScreen companyTracks={companyTracks} />;
}

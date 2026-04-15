import { createUntypedClient } from '@/utils/supabase/untyped';
import { requireUser } from '@/utils/auth/require-user';
import HomeScreen, { HomeTrack, SkillPathCategory, SkillPathChallenge } from './HomeScreen';

type Seniority = 'junior' | 'mid' | 'senior';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
  type: 'company';
};

type QuizRow = {
  id: string;
  title: string;
  difficulty: Seniority | null;
  module_id: string;
  modules: {
    id: string;
    title: string;
    track_id: string;
  } | null;
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
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 17);

const deterministicRange = (seedSource: string, min: number, max: number) => {
  const seed = hashString(seedSource);
  return min + (seed % (max - min + 1));
};

export default async function HomePage() {
  const user = await requireUser();
  const db = createUntypedClient();

  const { data: tracksData } = await db
    .from('tracks')
    .select('id,title,description,type')
    .eq('is_published', true)
    .eq('type', 'company')
    .order('title', { ascending: true });

  const tracks = Array.from(new Map(((tracksData ?? []) as TrackRow[]).map((track) => [track.id, track])).values());
  const trackIds = tracks.map((track) => track.id);

  const { data: quizzesData } = trackIds.length
    ? await db
        .from('quizzes')
        .select('id,title,difficulty,module_id,modules(id,title,track_id)')
        .in('modules.track_id', trackIds)
    : { data: [] as QuizRow[] };

  const quizzes = (quizzesData ?? []) as QuizRow[];

  const quizIds = quizzes.map((quiz) => quiz.id);
  const quizzesByTrack = quizzes.reduce(
    (acc: Record<string, QuizRow[]>, quiz) => {
      const trackId = quiz.modules?.track_id;
      if (!trackId) return acc;
      acc[trackId] ??= [];
      acc[trackId].push(quiz);
      return acc;
    },
    {}
  );

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

  const companyCards: HomeTrack[] = tracks.map((track) => {
    const quizzesForTrack = quizzesByTrack[track.id] ?? [];
    const totalChallenges = quizzesForTrack.length;
    const solvedChallenges = quizzesForTrack.filter((quiz) =>
      (attemptsByQuiz[quiz.id] ?? []).some((attempt) => Boolean(attempt.submitted_at) && Boolean(attempt.passed))
    ).length;
    const progress = totalChallenges ? Math.round((solvedChallenges / totalChallenges) * 100) : 0;

    return {
      id: track.id,
      title: track.title,
      description: track.description,
      moduleCount: totalChallenges,
      challengeCountsBySeniority: undefined,
      practicingCount: `${deterministicRange(track.id, 50, 150)}`,
      progress
    };
  });

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Product Gym Member';

  return (
    <HomeScreen
      companyTracks={companyCards}
      skillPathCategories={[] as SkillPathCategory[]}
      skillPathChallenges={[] as SkillPathChallenge[]}
      userName={displayName}
      userStats={{ rank: '#12', solved: '42', solvingDays: '32' }}
    />
  );
}

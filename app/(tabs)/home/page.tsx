import { createUntypedClient } from '@/utils/supabase/untyped';
import { requireUser } from '@/utils/auth/require-user';
import HomeScreen, { HomeTrack, SkillPathCategory, SkillPathChallenge } from './HomeScreen';

type Seniority = 'junior' | 'mid' | 'senior';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
  type: 'company' | 'skill';
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

const SENIORITIES: Seniority[] = ['junior', 'mid', 'senior'];
const CATEGORY_ORDER = ['Discovery', 'Strategy', 'Execution', 'Metrics', 'Frameworks'];

export default async function HomePage() {
  const user = await requireUser();
  const db = createUntypedClient();

  const { data: tracksData } = await db
    .from('tracks')
    .select('id,title,description,type')
    .eq('is_published', true)
    .in('type', ['company', 'skill'])
    .order('title', { ascending: true });

  const tracks = (tracksData ?? []) as TrackRow[];
  const trackIds = tracks.map((track) => track.id);

  const { data: quizzesData } = trackIds.length
    ? await db
        .from('quizzes')
        .select('id,title,difficulty,module_id,modules(id,title,track_id)')
        .in('modules.track_id', trackIds)
    : { data: [] as QuizRow[] };

  const quizzes = (quizzesData ?? []) as QuizRow[];

  const companyTracks = tracks.filter((track) => track.type === 'company');
  const skillTracks = tracks.filter((track) => track.type === 'skill');

  const challengesByTrackAndLevel = quizzes.reduce(
    (acc: Record<string, Record<Seniority, number>>, quiz) => {
      const level = (quiz.difficulty ?? 'junior') as Seniority;
      const trackId = quiz.modules?.track_id;
      if (!trackId || !SENIORITIES.includes(level)) return acc;
      acc[trackId] ??= { junior: 0, mid: 0, senior: 0 };
      acc[trackId][level] += 1;
      return acc;
    },
    {}
  );

  const companyCards: HomeTrack[] = companyTracks.map((track) => {
    const levelCounts = challengesByTrackAndLevel[track.id] ?? {
      junior: 0,
      mid: 0,
      senior: 0
    };

    return {
      id: track.id,
      title: track.title,
      description: track.description,
      moduleCount: Object.values(levelCounts).reduce((total, count) => total + count, 0),
      challengeCountsBySeniority: levelCounts,
      practicingCount: '1.2K',
      progress: 0
    };
  });

  const skillCategories: SkillPathCategory[] = skillTracks
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.title) - CATEGORY_ORDER.indexOf(b.title) ||
        a.title.localeCompare(b.title)
    )
    .map((track) => ({
      id: track.id,
      key: track.title.toLowerCase(),
      title: track.title
    }));

  const skillChallenges: SkillPathChallenge[] = quizzes
    .filter((quiz) => {
      const trackId = quiz.modules?.track_id;
      return !!trackId && skillTracks.some((track) => track.id === trackId);
    })
    .map((quiz) => ({
      id: quiz.id,
      categoryId: quiz.modules?.track_id ?? '',
      title: quiz.title,
      level: (quiz.difficulty ?? 'junior') as Seniority,
      practicingCount: 0,
      durationMin: 5,
      durationMax: 10
    }));

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Product Gym Member';

  return (
    <HomeScreen
      companyTracks={companyCards}
      skillPathCategories={skillCategories}
      skillPathChallenges={skillChallenges}
      userName={displayName}
      userStats={{ rank: '#12', solved: '42', solvingDays: '32' }}
    />
  );
}

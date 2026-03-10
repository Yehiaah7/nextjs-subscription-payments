import { createUntypedClient } from '@/utils/supabase/untyped';
import { requireUser } from '@/utils/auth/require-user';
import HomeScreen, {
  HomeTrack,
  Seniority,
  SkillPathCategory,
  SkillPathChallenge
} from './HomeScreen';
import { MOCK_COMPANIES } from '@/app/(authenticated)/companies/mock-data';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
  type: 'company' | 'skill';
  seniority: Seniority | null;
};

type ModuleRow = {
  track_id: string;
  seniority: Seniority | null;
};

type SkillPathCategoryRow = {
  id: string;
  key: string;
  title: string;
  sort_order: number;
};

type SkillPathChallengeRow = {
  id: string;
  category_id: string;
  title: string;
  practicing_count: number;
  duration_min: number;
  duration_max: number;
};

export default async function HomePage() {
  const user = await requireUser();

  const db = createUntypedClient();
  const { data: tracksData } = await db
    .from('tracks' as any)
    .select('id,title,description,type,seniority')
    .eq('is_published', true)
    .in('type', ['company', 'skill'])
    .order('title', { ascending: true });

  const tracks = (tracksData ?? []) as TrackRow[];
  const trackIds = tracks.map((track) => track.id);

  const { data: modulesData, error: modulesError } = trackIds.length
    ? await db
        .from('modules')
        .select('track_id,seniority')
        .in('track_id', trackIds)
    : { data: [] as ModuleRow[], error: null };

  const { data: legacyModulesData } = modulesError
    ? await db.from('modules').select('track_id').in('track_id', trackIds)
    : { data: [] as Array<Pick<ModuleRow, 'track_id'>> };

  const modules = ((modulesError ? legacyModulesData : modulesData) ?? []) as ModuleRow[];
  const challengeCountsByTrackId = modules.reduce(
    (acc: Record<string, Record<Seniority, number>>, module: ModuleRow) => {
      const seniority = module.seniority ?? 'junior';
      acc[module.track_id] ??= { junior: 0, mid: 0, senior: 0 };
      acc[module.track_id][seniority] += 1;
      return acc;
    },
    {}
  );

  const toHomeTrack = (track: TrackRow): HomeTrack => ({
    id: track.id,
    title: track.title,
    description: track.description,
    moduleCount: Object.values(challengeCountsByTrackId[track.id] ?? {}).reduce(
      (total, count) => total + count,
      0
    ),
    challengeCountsBySeniority: challengeCountsByTrackId[track.id] ?? {
      [track.seniority ?? 'junior']: 1
    },
    practicingCount: '1.2K',
    progress: 45
  });

  const dbCompanyTracks = tracks
    .filter((track) => track.type === 'company')
    .map(toHomeTrack);

  const companyTracks = dbCompanyTracks.length
    ? dbCompanyTracks
    : MOCK_COMPANIES.map((company) => ({
        id: company.id,
        title: company.title,
        description: company.description ?? company.focus,
        moduleCount: company.challengesCount,
        challengeCountsBySeniority: { [company.seniority]: company.challengesCount },
        practicingCount: company.practicingCount,
        progress: company.progress
      }));

  const { data: skillPathCategoriesData } = await db
    .from('skill_path_categories' as any)
    .select('id,key,title,sort_order')
    .order('sort_order', { ascending: true });

  const skillPathCategories = (skillPathCategoriesData ??
    []) as SkillPathCategoryRow[];

  const { data: skillPathChallengesData } = skillPathCategories.length
    ? await db
        .from('skill_path_challenges' as any)
        .select(
          'id,category_id,title,practicing_count,duration_min,duration_max'
        )
        .in(
          'category_id',
          skillPathCategories.map((category) => category.id)
        )
        .order('created_at', { ascending: true })
    : { data: [] as SkillPathChallengeRow[] };

  const skillPathChallenges = (skillPathChallengesData ??
    []) as SkillPathChallengeRow[];

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Product Gym Member';

  return (
    <HomeScreen
      companyTracks={companyTracks}
      skillPathCategories={skillPathCategories.map<SkillPathCategory>(
        (category) => ({
          id: category.id,
          key: category.key,
          title: category.title
        })
      )}
      skillPathChallenges={skillPathChallenges.map<SkillPathChallenge>(
        (challenge) => ({
          id: challenge.id,
          categoryId: challenge.category_id,
          title: challenge.title,
          practicingCount: challenge.practicing_count,
          durationMin: challenge.duration_min,
          durationMax: challenge.duration_max
        })
      )}
      userName={displayName}
      userStats={{
        rank: '#12',
        solved: '42',
        solvingDays: '32'
      }}
    />
  );
}

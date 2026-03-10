import { createUntypedClient } from '@/utils/supabase/untyped';
import { requireUser } from '@/utils/auth/require-user';
import HomeScreen, {
  HomeTrack,
  SkillPathCategory,
  SkillPathChallenge
} from './HomeScreen';
import { MOCK_COMPANIES } from '@/app/(authenticated)/companies/mock-data';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
  type: 'company' | 'skill';
};

type ModuleRow = {
  track_id: string;
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
    .select('id,title,description,type')
    .eq('is_published', true)
    .in('type', ['company', 'skill'])
    .order('title', { ascending: true });

  const tracks = (tracksData ?? []) as TrackRow[];
  const trackIds = tracks.map((track) => track.id);

  const { data: modulesData } = trackIds.length
    ? await db.from('modules').select('track_id').in('track_id', trackIds)
    : { data: [] as ModuleRow[] };

  const modules = (modulesData ?? []) as ModuleRow[];
  const modulesByTrackId = modules.reduce(
    (acc: Record<string, number>, module: ModuleRow) => {
      acc[module.track_id] = (acc[module.track_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const toHomeTrack = (track: TrackRow): HomeTrack => ({
    id: track.id,
    title: track.title,
    description: track.description,
    moduleCount: modulesByTrackId[track.id] ?? 0,
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

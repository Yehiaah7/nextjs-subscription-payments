import { createUntypedClient } from '@/utils/supabase/untyped';
import { requireUser } from '@/utils/auth/require-user';
import CompaniesScreen, { CompanyTrack } from '../CompaniesScreen';
import { MOCK_COMPANIES } from '../mock-data';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
};

type ModuleRow = {
  track_id: string;
};

const hashString = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);

const formatCompact = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return `${value}`;
};

const toCompanyTrack = (
  track: TrackRow,
  moduleCount: number,
  index: number
): CompanyTrack => {
  const seed = hashString(track.id + track.title);
  const progress = 35 + (seed % 56);

  return {
    id: track.id,
    title: track.title,
    focus: track.description ?? 'Company Practice',
    challengesCount: moduleCount,
    practicingCount: formatCompact(900 + ((seed + index * 41) % 2600)),
    progress
  };
};

export default async function ViewAllCompaniesPage() {
  await requireUser();

  const db = createUntypedClient();
  const { data: tracksData } = await db
    .from('tracks' as any)
    .select('id,title,description')
    .eq('type', 'company')
    .eq('is_published', true)
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

  const companyTracks = tracks.length
    ? tracks.map((track, index) =>
        toCompanyTrack(track, modulesByTrackId[track.id] ?? 0, index)
      )
    : MOCK_COMPANIES;

  return <CompaniesScreen companyTracks={companyTracks} />;
}

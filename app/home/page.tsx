import { createUntypedClient } from '@/utils/supabase/untyped';
import { requireUser } from '@/utils/auth/require-user';
import HomeScreen, { HomeTrack } from './HomeScreen';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
  type: 'company' | 'skill';
};

type ModuleRow = {
  track_id: string;
};

export default async function HomePage() {
  await requireUser();

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
    moduleCount: modulesByTrackId[track.id] ?? 0
  });

  const companyTracks = tracks
    .filter((track) => track.type === 'company')
    .map(toHomeTrack);
  const skillTracks = tracks
    .filter((track) => track.type === 'skill')
    .map(toHomeTrack);

  return <HomeScreen companyTracks={companyTracks} skillTracks={skillTracks} />;
}

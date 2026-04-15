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
  module_id: string;
  modules: { track_id: string } | null;
};

const hashString = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);

const deterministicRange = (seedSource: string, min: number, max: number) =>
  min + (hashString(seedSource) % (max - min + 1));

const normalizeFocus = (description: string | null) =>
  (description ?? '').replace(/^(focus:\s*)+/i, '').trim();

const toCompanyTrack = (track: TrackRow, challengeCount: number): CompanyTrack => ({
  id: track.id,
  title: track.title,
  focus: normalizeFocus(track.description),
  challengesCount: challengeCount,
  practicingCount: `${deterministicRange(track.id, 50, 150)}`,
  progress: 0
});

export default async function ViewAllCompaniesPage() {
  await requireUser();
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
        .select('id,module_id,modules!inner(track_id)')
        .in('modules.track_id', trackIds)
    : { data: [] as QuizRow[], error: null };

  if (quizzesError) {
    throw new Error(`Failed to load quizzes: ${quizzesError.message}`);
  }

  const quizzesByTrackId = ((allQuizzesData ?? []) as QuizRow[]).reduce(
    (acc: Record<string, number>, quiz) => {
      const trackId = quiz.modules?.track_id;
      if (!trackId) return acc;
      acc[trackId] = (acc[trackId] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const companyTracks = tracks.map((track) => toCompanyTrack(track, quizzesByTrackId[track.id] ?? 0));

  return <CompaniesScreen companyTracks={companyTracks} />;
}

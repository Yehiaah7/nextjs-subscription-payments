import { createClient } from '@/utils/supabase/server';
import { createUntypedClient } from '@/utils/supabase/untyped';
import { redirect } from 'next/navigation';
import CompaniesScreen, { CompanyTrack } from './CompaniesScreen';

type TrackRow = {
  id: string;
  title: string;
};

type ModuleRow = {
  id: string;
  track_id: string;
};

type QuizRow = {
  id: string;
  module_id: string;
};

type AttemptRow = {
  quiz_id: string;
};

const FOCUS_OPTIONS = [
  'Metrics • Product Sense',
  'Execution • Strategy',
  'Growth • Analytics',
  'Roadmap • Prioritization',
  'Stakeholders • Leadership'
];

const hashString = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);

const formatPracticingCount = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return `${value}`;
};

export default async function CompaniesPage() {
  const supabase = createClient();
  const db = createUntypedClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data: tracksData } = await db
      .from('tracks' as any)
      .select('id,title')
      .eq('type', 'company')
      .eq('is_published', true)
      .order('title', { ascending: true });

    const tracks = (tracksData ?? []) as TrackRow[];
    const trackIds = tracks.map((track) => track.id);

    const { data: modulesData } = trackIds.length
      ? await db.from('modules').select('id,track_id').in('track_id', trackIds)
      : { data: [] as ModuleRow[] };

    const modules = (modulesData ?? []) as ModuleRow[];
    const moduleIds = modules.map((module) => module.id);

    const { data: quizzesData } = moduleIds.length
      ? await db
          .from('quizzes')
          .select('id,module_id')
          .in('module_id', moduleIds)
      : { data: [] as QuizRow[] };

    const quizzes = (quizzesData ?? []) as QuizRow[];
    const quizIds = quizzes.map((quiz) => quiz.id);

    const { data: attemptsData } = quizIds.length
      ? await db
          .from('attempts')
          .select('quiz_id')
          .eq('user_id', user.id)
          .in('quiz_id', quizIds)
      : { data: [] as AttemptRow[] };

    const attempts = (attemptsData ?? []) as AttemptRow[];

    const modulesByTrack = modules.reduce(
      (acc: Record<string, number>, module) => {
        acc[module.track_id] = (acc[module.track_id] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const moduleTrackById = modules.reduce(
      (acc: Record<string, string>, module) => {
        acc[module.id] = module.track_id;
        return acc;
      },
      {}
    );

    const quizzesByTrack = quizzes.reduce(
      (acc: Record<string, number>, quiz) => {
        const trackId = moduleTrackById[quiz.module_id];
        if (!trackId) return acc;
        acc[trackId] = (acc[trackId] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const quizTrackById = quizzes.reduce(
      (acc: Record<string, string>, quiz) => {
        const trackId = moduleTrackById[quiz.module_id];
        if (trackId) acc[quiz.id] = trackId;
        return acc;
      },
      {}
    );

    const attemptedQuizIdsByTrack = attempts.reduce(
      (acc: Record<string, Set<string>>, attempt) => {
        const trackId = quizTrackById[attempt.quiz_id];
        if (!trackId) return acc;
        if (!acc[trackId]) acc[trackId] = new Set<string>();
        acc[trackId].add(attempt.quiz_id);
        return acc;
      },
      {}
    );

    const companyTracks: CompanyTrack[] = tracks.map((track) => {
      const hash = hashString(track.id + track.title);
      const challengesCount =
        quizzesByTrack[track.id] ?? modulesByTrack[track.id] ?? 8 + (hash % 6);
      const attemptedCount = attemptedQuizIdsByTrack[track.id]?.size ?? 0;
      const progress = challengesCount
        ? Math.max(
            5,
            Math.min(100, Math.round((attemptedCount / challengesCount) * 100))
          )
        : 35 + (hash % 41);

      const mockPracticing = Math.max(
        120,
        challengesCount * 100 + (hash % 700)
      );

      return {
        id: track.id,
        title: track.title,
        focus: FOCUS_OPTIONS[hash % FOCUS_OPTIONS.length],
        challengesCount,
        practicingCount: formatPracticingCount(mockPracticing),
        progress
      };
    });

    return <CompaniesScreen companyTracks={companyTracks} />;
  } catch (error) {
    redirect('/login');
  }
}

import { createClient } from '@/utils/supabase/server';
import { createUntypedClient } from '@/utils/supabase/untyped';
import { notFound, redirect } from 'next/navigation';
import CompanyDetailsScreen, {
  ChallengeStatus,
  CompanyChallenge
} from './CompanyDetailsScreen';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
};

type ModuleRow = {
  id: string;
  track_id: string;
  title: string;
  sort_order: number;
};

type QuizRow = {
  id: string;
  module_id: string;
};

type AttemptRow = {
  quiz_id: string;
  submitted_at: string | null;
  passed: boolean | null;
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

const deterministicStatus = (seed: string): ChallengeStatus => {
  const pattern: ChallengeStatus[] = ['in-progress', 'not-solved', 'solved', 'not-solved'];
  return pattern[hashString(seed) % pattern.length];
};

export default async function CompanyDetailsPage({
  params
}: {
  params: { id: string };
}) {
  const { id } = params;

  const supabase = createClient();
  const db = createUntypedClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { data: trackData } = await db
      .from('tracks' as any)
      .select('id,title,description')
      .eq('id', id)
      .eq('type', 'company')
      .eq('is_published', true)
      .maybeSingle();

    const company = (trackData ?? null) as TrackRow | null;

    if (!company) {
      notFound();
    }

    const { data: modulesData } = await db
      .from('modules')
      .select('id,track_id,title,sort_order')
      .eq('track_id', company.id)
      .order('sort_order', { ascending: true });

    const modules = (modulesData ?? []) as ModuleRow[];
    const moduleIds = modules.map((module) => module.id);

    const { data: quizzesData } = moduleIds.length
      ? await db.from('quizzes').select('id,module_id').in('module_id', moduleIds)
      : { data: [] as QuizRow[] };

    const quizzes = (quizzesData ?? []) as QuizRow[];
    const quizIds = quizzes.map((quiz) => quiz.id);

    const { data: attemptsData } = quizIds.length
      ? await db
          .from('attempts')
          .select('quiz_id,submitted_at,passed')
          .eq('user_id', user.id)
          .in('quiz_id', quizIds)
      : { data: [] as AttemptRow[] };

    const attempts = (attemptsData ?? []) as AttemptRow[];

    const attemptsByQuizId = attempts.reduce(
      (acc: Record<string, AttemptRow[]>, attempt) => {
        if (!acc[attempt.quiz_id]) {
          acc[attempt.quiz_id] = [];
        }

        acc[attempt.quiz_id].push(attempt);
        return acc;
      },
      {}
    );

    const quizzesByModuleId = quizzes.reduce(
      (acc: Record<string, QuizRow[]>, quiz) => {
        if (!acc[quiz.module_id]) {
          acc[quiz.module_id] = [];
        }

        acc[quiz.module_id].push(quiz);
        return acc;
      },
      {}
    );

    const hasAnyAttempts = attempts.length > 0;

    const challenges: CompanyChallenge[] = modules.map((module) => {
      const moduleQuizzes = quizzesByModuleId[module.id] ?? [];
      const moduleAttempts = moduleQuizzes.flatMap((quiz) => attemptsByQuizId[quiz.id] ?? []);

      const status = moduleAttempts.length
        ? moduleAttempts.some((attempt) => attempt.passed)
          ? 'solved'
          : moduleAttempts.some((attempt) => !attempt.submitted_at)
            ? 'in-progress'
            : 'not-solved'
        : deterministicStatus(module.id + module.title);

      const seed = hashString(module.id + module.title + company.id);
      const practicingCount = formatCompact(150 + (seed % 2200));
      const duration = `${8 + (seed % 18)} mins`;

      return {
        id: module.id,
        title: module.title,
        status,
        practicingCount,
        duration
      };
    });

    const solvedCount = challenges.filter((item) => item.status === 'solved').length;
    const inProgressCount = challenges.filter((item) => item.status === 'in-progress').length;
    const practicingCount = formatCompact(1100 + (hashString(company.id + company.title) % 3900));

    const progressPercent = challenges.length
      ? hasAnyAttempts
        ? Math.round(((solvedCount + inProgressCount * 0.5) / challenges.length) * 100)
        : 65
      : 0;

    return (
      <CompanyDetailsScreen
        company={company}
        challenges={challenges}
        progressPercent={progressPercent}
        practicingCount={practicingCount}
      />
    );
  } catch (error) {
    redirect('/login');
  }
}

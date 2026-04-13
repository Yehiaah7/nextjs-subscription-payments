import { createClient } from '@/utils/supabase/server';
import { createUntypedClient } from '@/utils/supabase/untyped';
import { notFound, redirect } from 'next/navigation';
import CompanyDetailsScreen, { CompanyChallenge } from './CompanyDetailsScreen';

type Seniority = 'junior' | 'mid' | 'senior';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
};

type QuizRow = {
  id: string;
  title: string;
  difficulty: Seniority | null;
  module_id: string;
  modules: { title: string } | null;
};

type QuestionRow = {
  id: string;
  quiz_id: string;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  submitted_at: string | null;
  passed: boolean | null;
  started_at: string;
};

type AnswerRow = {
  attempt_id: string;
  question_id: string;
  option_id: string | null;
  options: { is_correct: boolean } | null;
};

const formatCompact = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}K` : `${value}`;

export default async function CompanyDetailsPage({
  params
}: {
  params: { trackId: string };
}) {
  const { trackId } = params;

  const supabase = createClient();
  const db = createUntypedClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: companyData } = await db
    .from('tracks')
    .select('id,title,description')
    .eq('id', trackId)
    .eq('type', 'company')
    .eq('is_published', true)
    .maybeSingle();

  const company = companyData as TrackRow | null;
  if (!company) notFound();

  const { data: quizzesData } = await db
    .from('quizzes')
    .select('id,title,difficulty,module_id,modules(title)')
    .eq('modules.track_id', company.id)
    .order('title', { ascending: true });

  const quizzes = (quizzesData ?? []) as QuizRow[];
  const quizIds = quizzes.map((quiz) => quiz.id);

  const { data: questionsData } = quizIds.length
    ? await db.from('questions').select('id,quiz_id').in('quiz_id', quizIds)
    : { data: [] as QuestionRow[] };
  const questions = (questionsData ?? []) as QuestionRow[];

  const { data: attemptsData } = quizIds.length
    ? await db
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[] };
  const attempts = (attemptsData ?? []) as AttemptRow[];

  const latestAttemptByQuizId: Record<string, AttemptRow> = {};
  for (const attempt of attempts) {
    if (!latestAttemptByQuizId[attempt.quiz_id]) {
      latestAttemptByQuizId[attempt.quiz_id] = attempt;
    }
  }

  const latestAttemptIds = Object.values(latestAttemptByQuizId).map((attempt) => attempt.id);

  const { data: answersData } = latestAttemptIds.length
    ? await db
        .from('answers')
        .select('attempt_id,question_id,option_id,options(is_correct)')
        .in('attempt_id', latestAttemptIds)
    : { data: [] as AnswerRow[] };
  const answers = (answersData ?? []) as AnswerRow[];

  const correctAnswersByAttempt = answers.reduce(
    (acc: Record<string, Set<string>>, answer) => {
      if (!answer.options?.is_correct) return acc;
      acc[answer.attempt_id] ??= new Set<string>();
      acc[answer.attempt_id].add(answer.question_id);
      return acc;
    },
    {}
  );

  const totalQuestionsByQuiz = questions.reduce(
    (acc: Record<string, number>, question) => {
      acc[question.quiz_id] = (acc[question.quiz_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const challenges: CompanyChallenge[] = quizzes.map((quiz) => {
    const latestAttempt = latestAttemptByQuizId[quiz.id];
    const correctSteps = latestAttempt
      ? (correctAnswersByAttempt[latestAttempt.id]?.size ?? 0)
      : 0;
    const totalSteps = totalQuestionsByQuiz[quiz.id] ?? 0;

    const status = latestAttempt
      ? latestAttempt.passed
        ? 'solved'
        : latestAttempt.submitted_at
          ? 'not-solved'
          : 'in-progress'
      : 'not-solved';

    return {
      id: quiz.id,
      title: quiz.title,
      status,
      practicingCount: '0',
      duration: `${Math.max(totalSteps * 2, 5)} mins`,
      seniority: (quiz.difficulty ?? 'junior') as Seniority,
      completedSteps: correctSteps,
      totalSteps
    };
  });

  const solvedCount = challenges.filter((item) => item.status === 'solved').length;
  const progressPercent = challenges.length ? Math.round((solvedCount / challenges.length) * 100) : 0;

  return (
    <CompanyDetailsScreen
      company={company}
      challenges={challenges}
      progressPercent={progressPercent}
      practicingCount={formatCompact(1200 + challenges.length * 12)}
    />
  );
}

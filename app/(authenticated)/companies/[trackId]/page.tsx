import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import CompanyDetailsScreen, { CompanyChallenge } from './CompanyDetailsScreen';
import {
  buildCanonicalActiveAttemptByQuizId,
  buildCompanySummary,
  calculateCompanyProgress
} from '../company-summary';

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
  module_id: string | null;
  modules: { title: string; track_id: string } | null;
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
  score: number | null;
  started_at: string;
};

type AnswerRow = {
  attempt_id: string;
  question_id: string;
  option_id: string | null;
  points_awarded: number | null;
};

export default async function CompanyDetailsPage({
  params
}: {
  params: { trackId: string };
}) {
  const { trackId } = params;
  noStore();

  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: companyData } = await supabase
    .from('tracks')
    .select('id,title,description')
    .eq('id', trackId)
    .eq('type', 'company')
    .eq('is_published', true)
    .maybeSingle();

  const company = companyData as TrackRow | null;
  if (!company) notFound();

  const { data: quizzesData, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id,title,difficulty,module_id,modules!inner(title,track_id)')
    .eq('modules.track_id', company.id)
    .order('title', { ascending: true });

  const quizzes = (quizzesData ?? []) as QuizRow[];
  if (!quizzesData?.length) {
    console.error('[CompanyDetailsPage] quizzes query returned no rows', {
      companyId: company.id,
      quizzesError
    });
  }
  const quizIds = quizzes.map((quiz) => quiz.id);

  const { data: questionsData } = quizIds.length
    ? await supabase
        .from('questions')
        .select('id,quiz_id')
        .in('quiz_id', quizIds)
    : { data: [] as QuestionRow[] };
  const questions = (questionsData ?? []) as QuestionRow[];

  const { data: attemptsData } = quizIds.length
    ? await supabase
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,score,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[] };
  const attempts = (attemptsData ?? []) as AttemptRow[];

  const latestAttemptByQuizId = attempts.reduce(
    (acc: Record<string, AttemptRow>, attempt) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt;
      }
      return acc;
    },
    {}
  );

  const canonicalActiveAttemptByQuizId = buildCanonicalActiveAttemptByQuizId(
    attempts
  );

  const attemptIdsToLoadAnswers = Array.from(
    new Set([
      ...Object.values(latestAttemptByQuizId).map((attempt) => attempt?.id),
      ...Object.values(canonicalActiveAttemptByQuizId).map(
        (attempt) => attempt?.id
      )
    ])
  ).filter(Boolean);

  const { data: answersData } = attemptIdsToLoadAnswers.length
    ? await supabase
        .from('answers')
        .select('attempt_id,question_id,option_id,points_awarded')
        .in('attempt_id', attemptIdsToLoadAnswers)
    : { data: [] as AnswerRow[] };
  const answers = (answersData ?? []) as AnswerRow[];

  const answeredCountByAttempt = answers.reduce(
    (acc: Record<string, Set<string>>, answer) => {
      acc[answer.attempt_id] ??= new Set<string>();
      acc[answer.attempt_id].add(answer.question_id);
      return acc;
    },
    {}
  );

  console.log('[CompanyDetailsPage] loaded dataset counts', {
    companyId: company.id,
    quizzesCount: quizzesData?.length ?? 0,
    questionsCount: questionsData?.length ?? 0,
    attemptsCount: attemptsData?.length ?? 0
  });

  const totalQuestionsByQuiz = questions.reduce(
    (acc: Record<string, number>, question) => {
      acc[question.quiz_id] = (acc[question.quiz_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const challenges: CompanyChallenge[] = quizzes.map((quiz) => {
    const latestAttempt = latestAttemptByQuizId[quiz.id];
    const progressAttempt = canonicalActiveAttemptByQuizId[quiz.id];
    const currentAttempt = progressAttempt ?? latestAttempt;
    const answeredSteps = progressAttempt
      ? (answeredCountByAttempt[progressAttempt.id]?.size ?? 0)
      : 0;
    const totalSteps = totalQuestionsByQuiz[quiz.id] ?? 0;
    const isSubmitted = Boolean(currentAttempt?.submitted_at);
    const score = currentAttempt?.score ?? 0;

    const isFullyAnswered = totalSteps > 0 && answeredSteps >= totalSteps;

    const status = isFullyAnswered
      ? 'solved'
      : answeredSteps > 0
        ? 'in-progress'
        : 'not-solved';

    const completedSteps = Math.min(answeredSteps, totalSteps);
    const outerProgressValue = totalSteps
      ? (completedSteps / totalSteps) * 100
      : 0;

    console.log('[ChallengeCardTrace] quiz card progress inputs', {
      quizId: quiz.id,
      latestAttemptId: latestAttempt?.id ?? null,
      progressAttemptId: progressAttempt?.id ?? null,
      outerCardAttemptIdUsed: currentAttempt?.id ?? null,
      answeredSteps,
      totalSteps,
      outerProgressValue
    });

    return {
      id: quiz.id,
      title: quiz.title,
      category: quiz.modules?.title ?? 'Challenge',
      categorySortOrder: 99,
      status,
      practicingCount: `${10 + ((quiz.title.length * 13) % 91)}`,
      duration: `${Math.max(totalSteps * 2, 5)} mins`,
      seniority: (quiz.difficulty ?? 'junior') as Seniority,
      answeredSteps: completedSteps,
      completedSteps,
      totalSteps,
      score,
      retake: isSubmitted && score < 60,
      reviewAvailable: isSubmitted && score >= 60
    };
  });

  const companySummary = buildCompanySummary({
    id: company.id,
    title: company.title,
    description: company.description,
    challengeCount: quizzes.length,
    progress: calculateCompanyProgress({
      quizIds,
      questionCountByQuizId: totalQuestionsByQuiz,
      canonicalActiveAttemptByQuizId,
      answeredCountByAttempt
    })
  });

  return (
    <CompanyDetailsScreen
      companySummary={companySummary}
      companyId={company.id}
      challenges={challenges}
    />
  );
}

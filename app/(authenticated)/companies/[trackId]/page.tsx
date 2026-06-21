import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import {
  canAccessCompany,
  isFreeTrialActive,
  resolveTrialEndAt
} from '@/utils/access';
import { getHasProSubscription } from '@/utils/supabase/queries';
import CompanyDetailsScreen, { CompanyChallenge } from './CompanyDetailsScreen';
import {
  buildCanonicalAttemptByQuizId,
  buildCompanySummary,
  calculateCompanyProgress,
  calculateQuizAttemptProgress
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
  pass_score: number | null;
  module_id: string | null;
  modules: { title: string; track_id: string } | null;
};

type QuestionRow = {
  id: string;
  quiz_id: string;
  points: number;
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

type ChallengeCardDebugValues = {
  challengeId: string;
  attemptId: string | null;
  answeredCount: number;
  totalSteps: number;
  progressPercent: number;
  score: number;
  isCompleted: boolean;
  solvedBadgeValue: string;
  tabClassification: string;
  outerCardBadge: string;
  outerCardStatus: string;
  challengeTitle: string;
};

const logChallengeCardDebugValues = (values: ChallengeCardDebugValues[]) => {
  values.forEach((value) => {
    console.log('[ChallengeCardRawValues] card render source', value);
  });

  const samples = {
    untouched: values.find((value) => value.answeredCount === 0) ?? null,
    partiallyCompleted:
      values.find(
        (value) =>
          value.answeredCount > 0 && value.answeredCount < value.totalSteps
      ) ?? null,
    fullyCompleted:
      values.find(
        (value) => value.answeredCount === value.totalSteps && value.isCompleted
      ) ?? null
  };

  console.log('[ChallengeCardRawValues] required samples', samples);
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

  const [{ data: profileData }, isPro] = await Promise.all([
    (supabase as any)
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .maybeSingle(),
    getHasProSubscription(supabase)
  ]);
  const trialEndAt = resolveTrialEndAt({
    trialEndAt:
      user.user_metadata?.trialEndAt ?? user.user_metadata?.trial_end_at,
    trialStartedAt:
      user.user_metadata?.trialStartedAt ??
      user.user_metadata?.trial_started_at,
    createdAt:
      (profileData as { created_at?: string } | null)?.created_at ??
      user.created_at
  });
  if (
    !canAccessCompany({
      companySlug: company.title,
      isPro,
      isTrialActive: isFreeTrialActive(trialEndAt)
    })
  ) {
    redirect('/home?upgrade=1');
  }

  const { data: quizzesData, error: quizzesError } = await supabase
    .from('quizzes')
    .select(
      'id,title,difficulty,pass_score,module_id,modules!inner(title,track_id)'
    )
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
        .select('id,quiz_id,points')
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

  const canonicalAttemptByQuizId = buildCanonicalAttemptByQuizId(attempts);

  const attemptIdsToLoadAnswers = Array.from(
    new Set(
      Object.values(canonicalAttemptByQuizId).map((attempt) => attempt.id)
    )
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

  const questionIdsByQuiz = questions.reduce(
    (acc: Record<string, Set<string>>, question) => {
      acc[question.quiz_id] ??= new Set<string>();
      acc[question.quiz_id].add(question.id);
      return acc;
    },
    {}
  );

  const totalPointsByQuiz = questions.reduce(
    (acc: Record<string, number>, question) => {
      acc[question.quiz_id] = (acc[question.quiz_id] ?? 0) + question.points;
      return acc;
    },
    {}
  );

  const awardedPointsByAttempt = answers.reduce(
    (acc: Record<string, number>, answer) => {
      acc[answer.attempt_id] =
        (acc[answer.attempt_id] ?? 0) + (answer.points_awarded ?? 0);
      return acc;
    },
    {}
  );

  const challengeCardDebugValues: ChallengeCardDebugValues[] = [];

  const challenges: CompanyChallenge[] = quizzes.map((quiz) => {
    const currentAttempt = canonicalAttemptByQuizId[quiz.id] ?? null;
    const totalSteps = totalQuestionsByQuiz[quiz.id] ?? 0;
    const passScore = quiz.pass_score ?? 60;
    const progress = calculateQuizAttemptProgress({
      attempt: currentAttempt,
      answeredQuestionIds: currentAttempt
        ? new Set(
            Array.from(answeredCountByAttempt[currentAttempt.id] ?? []).filter(
              (questionId) => questionIdsByQuiz[quiz.id]?.has(questionId)
            )
          )
        : new Set<string>(),
      totalSteps,
      awardedPoints: currentAttempt
        ? (awardedPointsByAttempt[currentAttempt.id] ?? 0)
        : 0,
      totalPoints: totalPointsByQuiz[quiz.id] ?? totalSteps,
      passScore
    });

    const challengeCardDebugValue = {
      challengeId: quiz.id,
      attemptId: progress.attemptId,
      answeredCount: progress.answeredCount,
      totalSteps: progress.totalSteps,
      progressPercent: progress.progressPercent,
      score: progress.score,
      isCompleted: progress.isCompleted,
      solvedBadgeValue: progress.solvedBadgeValue,
      tabClassification: progress.tabClassification,
      outerCardBadge: progress.solvedBadgeValue,
      outerCardStatus: progress.status,
      challengeTitle: quiz.title
    };
    challengeCardDebugValues.push(challengeCardDebugValue);

    return {
      id: quiz.id,
      title: quiz.title,
      category: quiz.modules?.title ?? 'Challenge',
      categorySortOrder: 99,
      status: progress.status,
      attemptId: progress.attemptId,
      answeredCount: progress.answeredCount,
      isCompleted: progress.isCompleted,
      solvedBadgeValue: progress.solvedBadgeValue,
      tabClassification: progress.tabClassification,
      practicingCount: `${10 + ((quiz.title.length * 13) % 91)}`,
      duration: `${Math.max(totalSteps * 2, 5)} mins`,
      seniority: (quiz.difficulty ?? 'junior') as Seniority,
      answeredSteps: progress.answeredSteps,
      completedSteps: progress.completedSteps,
      totalSteps: progress.totalSteps,
      progressPercent: progress.progressPercent,
      score: progress.score,
      retake:
        progress.answeredCount === progress.totalSteps && !progress.passed,
      reviewAvailable: progress.passed
    };
  });

  logChallengeCardDebugValues(challengeCardDebugValues);

  if (company.title.toLowerCase() === 'amazon') {
    console.log(
      '[ChallengeCardRawValues] first Amazon challenge card render source',
      challengeCardDebugValues[0] ?? null
    );
  }

  const companySummary = buildCompanySummary({
    id: company.id,
    title: company.title,
    description: company.description,
    challengeCount: quizzes.length,
    progress: calculateCompanyProgress({
      quizIds,
      questionCountByQuizId: totalQuestionsByQuiz,
      canonicalAttemptByQuizId,
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

import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/auth/require-user';
import HomeScreen, { HomeTrack, SkillPathCategory, SkillPathChallenge } from './HomeScreen';
import {
  buildCompanySummary,
  calculateCompanyProgress
} from '@/app/(authenticated)/companies/company-summary';

type Seniority = 'junior' | 'mid' | 'senior';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
  type: 'company';
};

type QuizRow = {
  id: string;
  title: string;
  difficulty: Seniority | null;
  module_id: string;
  modules: {
    id: string;
    title: string;
    track_id: string;
  } | null;
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
};

type QuestionRow = {
  id: string;
  quiz_id: string;
};

export default async function HomePage() {
  const user = await requireUser();
  const db = createClient();

  const { data: tracksData } = await db
    .from('tracks')
    .select('id,title,description,type')
    .eq('is_published', true)
    .eq('type', 'company')
    .order('title', { ascending: true });

  const tracks = Array.from(new Map(((tracksData ?? []) as TrackRow[]).map((track) => [track.id, track])).values());
  const trackIds = tracks.map((track) => track.id);

  const { data: quizzesData } = trackIds.length
    ? await db
        .from('quizzes')
        .select('id,title,difficulty,module_id,modules(id,title,track_id)')
        .in('modules.track_id', trackIds)
    : { data: [] as QuizRow[] };

  const quizzes = (quizzesData ?? []) as QuizRow[];

  const quizIds = quizzes.map((quiz) => quiz.id);
  const quizzesByTrack = quizzes.reduce(
    (acc: Record<string, QuizRow[]>, quiz) => {
      const trackId = quiz.modules?.track_id;
      if (!trackId) return acc;
      acc[trackId] ??= [];
      acc[trackId].push(quiz);
      return acc;
    },
    {}
  );

  const { data: attemptsData } = quizIds.length
    ? await db
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[] };
  const attempts = (attemptsData ?? []) as AttemptRow[];

  const attemptsByQuiz = attempts.reduce(
    (acc: Record<string, AttemptRow[]>, attempt) => {
      acc[attempt.quiz_id] ??= [];
      acc[attempt.quiz_id].push(attempt);
      return acc;
    },
    {}
  );

  const latestActiveAttemptByQuiz = attempts.reduce(
    (acc: Record<string, AttemptRow>, attempt) => {
      if (!attempt.submitted_at && !acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt;
      }
      return acc;
    },
    {}
  );
  const latestAttemptByQuiz = attempts.reduce(
    (acc: Record<string, AttemptRow>, attempt) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt;
      }
      return acc;
    },
    {}
  );

  const attemptIdsToLoadAnswers = Array.from(
    new Set([
      ...Object.values(latestActiveAttemptByQuiz).map((attempt) => attempt?.id),
      ...Object.values(latestAttemptByQuiz).map((attempt) => attempt?.id)
    ])
  )
    .filter(Boolean) as string[];

  const { data: answersData } = attemptIdsToLoadAnswers.length
    ? await db
        .from('answers')
        .select('attempt_id,question_id')
        .in('attempt_id', attemptIdsToLoadAnswers)
    : { data: [] as AnswerRow[] };
  const answers = (answersData ?? []) as AnswerRow[];

  const { data: questionsData } = quizIds.length
    ? await db.from('questions').select('id,quiz_id').in('quiz_id', quizIds)
    : { data: [] as QuestionRow[] };
  const questions = (questionsData ?? []) as QuestionRow[];

  const totalQuestionsByQuiz = questions.reduce(
    (acc: Record<string, number>, question) => {
      acc[question.quiz_id] = (acc[question.quiz_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const solvedQuestionsByAttempt = answers.reduce(
    (acc: Record<string, Set<string>>, answer) => {
      acc[answer.attempt_id] ??= new Set<string>();
      acc[answer.attempt_id].add(answer.question_id);
      return acc;
    },
    {}
  );

  const companyCards: HomeTrack[] = tracks.map((track) => {
    const quizzesForTrack = quizzesByTrack[track.id] ?? [];
    const quizIdsForTrack = quizzesForTrack.map((quiz) => quiz.id);
    const seniorities = Array.from(
      new Set(
        quizzesForTrack
          .map((quiz) => quiz.difficulty)
          .filter((difficulty): difficulty is Seniority => Boolean(difficulty))
      )
    );

    return {
      companySummary: buildCompanySummary({
        id: track.id,
        title: track.title,
        description: track.description,
        challengeCount: quizzesForTrack.length,
        progress: calculateCompanyProgress({
          quizIds: quizIdsForTrack,
          questionCountByQuizId: totalQuestionsByQuiz,
          latestAttemptByQuizId: latestAttemptByQuiz,
          latestActiveAttemptByQuizId: latestActiveAttemptByQuiz,
          answeredCountByAttempt: solvedQuestionsByAttempt
        })
      }),
      seniorities
    };
  });

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Product Gym Member';

  return (
    <HomeScreen
      companyTracks={companyCards}
      skillPathCategories={[] as SkillPathCategory[]}
      skillPathChallenges={[] as SkillPathChallenge[]}
      userName={displayName}
      userStats={{ rank: '#12', solved: '42', solvingDays: '32' }}
    />
  );
}

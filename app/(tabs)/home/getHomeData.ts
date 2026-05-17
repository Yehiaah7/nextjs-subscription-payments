import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/auth/require-user';
import {
  buildCanonicalAttemptByQuizId,
  buildCompanySummary,
  calculateCompanyProgress
} from '@/app/(authenticated)/companies/company-summary';
import type {
  HomeTrack,
  SkillPathCategory,
  SkillPathChallenge
} from './HomeScreen';
import { getUserDisplayName } from '@/utils/user-avatar';
import { getUserProfileStats } from '@/lib/user-profile-stats';
import type { UserProfileStats } from '@/types/user-profile-stats';

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
  score: number | null;
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

type ProfileRecord = {
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type UserRecord = {
  full_name: string | null;
};

export async function getHomePageData(): Promise<{
  companyTracks: HomeTrack[];
  skillPathCategories: SkillPathCategory[];
  skillPathChallenges: SkillPathChallenge[];
  userId: string;
  userName: string;
  userFirstName: string | null;
  userLastName: string | null;
  userAvatarUrl: string | null;
  userEmail: string | null;
  userStats: UserProfileStats;
}> {
  const user = await requireUser();
  const db = createClient();
  const [{ data: profileData }, { data: userData }] = await Promise.all([
    (db as any)
      .from('profiles')
      .select('name, first_name, last_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    (db as any)
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
  ]);

  const profile = (profileData ?? null) as ProfileRecord | null;
  const userRecord = (userData ?? null) as UserRecord | null;

  const { data: tracksData } = await db
    .from('tracks')
    .select('id,title,description,type')
    .eq('is_published', true)
    .eq('type', 'company')
    .order('title', { ascending: true });

  const tracks = Array.from(
    new Map(
      ((tracksData ?? []) as TrackRow[]).map((track) => [track.id, track])
    ).values()
  );
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
        .select('id,quiz_id,submitted_at,passed,score,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[] };
  const attempts = (attemptsData ?? []) as AttemptRow[];

  const canonicalAttemptByQuiz = buildCanonicalAttemptByQuizId(attempts);

  const attemptIdsToLoadAnswers = Array.from(
    new Set(Object.values(canonicalAttemptByQuiz).map((attempt) => attempt.id))
  ).filter(Boolean) as string[];

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

  const companyTracks: HomeTrack[] = tracks.map((track) => {
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
          canonicalAttemptByQuizId: canonicalAttemptByQuiz,
          answeredCountByAttempt: solvedQuestionsByAttempt
        })
      }),
      seniorities
    };
  });

  const userName = getUserDisplayName({
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    fullName:
      profile?.name ??
      userRecord?.full_name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name,
    email: user.email
  });

  const userStats = await getUserProfileStats(user.id);

  return {
    companyTracks,
    userId: user.id,
    skillPathCategories: [] as SkillPathCategory[],
    skillPathChallenges: [] as SkillPathChallenge[],
    userName,
    userFirstName: profile?.first_name ?? null,
    userLastName: profile?.last_name ?? null,
    userAvatarUrl: profile?.avatar_url ?? null,
    userEmail: user.email ?? null,
    userStats
  };
}

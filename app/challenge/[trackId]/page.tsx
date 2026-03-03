import { createUntypedClient } from '@/utils/supabase/untyped';
import { notFound, redirect } from 'next/navigation';

type ModuleRow = {
  id: string;
  track_id: string;
};

type QuizRow = {
  id: string;
};

export default async function ChallengeFromModulePage({
  params
}: {
  params: { trackId: string };
}) {
  const moduleId = params.trackId;
  const db = createUntypedClient();

  const { data: moduleData } = await db
    .from('modules')
    .select('id,track_id')
    .eq('id', moduleId)
    .maybeSingle();

  const module = (moduleData ?? null) as ModuleRow | null;

  if (!module) {
    notFound();
  }

  const { data: quizData } = await db
    .from('quizzes')
    .select('id')
    .eq('module_id', module.id)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  const quiz = (quizData ?? null) as QuizRow | null;

  if (!quiz) {
    notFound();
  }

  redirect(`/challenge/${module.track_id}/${quiz.id}`);
}

import { createClient } from '@/utils/supabase/server';

type ProfilePracticeTimeRow = {
  practice_time_seconds: number | null;
};

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    secondsToAdd?: unknown;
  } | null;
  const secondsToAdd = Number(body?.secondsToAdd);

  if (!Number.isInteger(secondsToAdd) || secondsToAdd <= 0) {
    return new Response('Invalid secondsToAdd value', { status: 400 });
  }

  const { data: profileData, error: readError } = await (
    supabase.from('profiles') as any
  )
    .select('practice_time_seconds')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (readError) {
    return new Response('Failed to read practice time', { status: 500 });
  }

  const currentSeconds = Number(
    (profileData as ProfilePracticeTimeRow | null)?.practice_time_seconds ?? 0
  );
  const nextSeconds =
    (Number.isFinite(currentSeconds) ? currentSeconds : 0) + secondsToAdd;

  const { error } = await (supabase.from('profiles') as any)
    .update({ practice_time_seconds: nextSeconds })
    .eq('id', userData.user.id);

  if (error) {
    return new Response('Failed to update practice time', { status: 500 });
  }

  return Response.json({ ok: true });
}

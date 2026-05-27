import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { seconds?: number } | null;
  const seconds = Math.floor(Number(body?.seconds ?? 0));

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return Response.json({ ok: true });
  }

  await (supabase as any).rpc('increment_practice_time', {
    seconds_to_add: seconds
  });

  return Response.json({ ok: true });
}

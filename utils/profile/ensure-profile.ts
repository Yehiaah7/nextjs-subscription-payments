import { createClient } from '@/utils/supabase/server';

const USERNAME_REGEX = /[^a-z0-9._-]/g;

export function normalizeUsernameBase(input: string) {
  const cleaned = input.toLowerCase().replace(USERNAME_REGEX, '');
  const compact = cleaned.replace(/[._-]{2,}/g, '_').replace(/^[._-]+|[._-]+$/g, '');
  return compact.slice(0, 30) || 'user';
}

export async function generateUniqueUsername(baseInput: string, userId: string) {
  const supabase = createClient();
  const base = normalizeUsernameBase(baseInput).slice(0, 30);

  let suffix = 0;
  while (suffix < 500) {
    const suffixText = suffix === 0 ? '' : String(suffix);
    const candidate = `${base.slice(0, 30 - suffixText.length)}${suffixText}`;
    const { data } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .neq('id', userId)
      .limit(1)
      .maybeSingle();

    if (!data) return candidate;
    suffix += 1;
  }

  return `${base.slice(0, 24)}_${Math.floor(Math.random() * 100000)}`;
}

export async function ensureProfileForUser(user: any) {
  const supabase = createClient();
  const metadata = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const fullName = metadata.full_name || metadata.name || '';
  const [firstFromName, ...restFromName] = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = metadata.first_name || firstFromName || null;
  const lastName = metadata.last_name || (restFromName.length ? restFromName.join(' ') : null);
  const email = user.email ?? '';

  const { data: existing } = await (supabase as any)
    .from('profiles')
    .select('id, username, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle();

  const username = existing?.username || (await generateUniqueUsername(email.split('@')[0] || 'user', user.id));

  const { error } = await (supabase as any).from('profiles').upsert(
    {
      id: user.id,
      username,
      first_name: existing?.first_name ?? firstName,
      last_name: existing?.last_name ?? lastName,
      name: [existing?.first_name ?? firstName, existing?.last_name ?? lastName].filter(Boolean).join(' ').trim() || email || username
    },
    { onConflict: 'id' }
  );

  return { error, username };
}

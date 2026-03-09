'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const first_name = String(formData.get('first_name') || '').trim();
  const last_name = String(formData.get('last_name') || '').trim();
  const username = String(formData.get('username') || '').trim().toLowerCase();
  const phone = String(formData.get('phone') || '').trim();
  const name = [first_name, last_name].filter(Boolean).join(' ').trim();

  if (!USERNAME_PATTERN.test(username)) {
    return redirect(
      '/profile/edit?error=Username%20must%20be%203-20%20characters%20using%20only%20letters%2C%20numbers%2C%20or%20underscores.'
    );
  }

  const supabase = createClient();
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ first_name, last_name, username, phone, name })
    .eq('id', user.id);

  if (error) {
    if (error.message.toLowerCase().includes('username')) {
      return redirect('/profile/edit?error=This%20username%20is%20already%20taken.');
    }

    return redirect(`/profile/edit?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/profile/edit?status=Profile%20saved%20successfully.');
}

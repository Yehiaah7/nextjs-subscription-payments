'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export async function updateAccountPreferences(formData: FormData) {
  const user = await requireUser();
  const first_name = String(formData.get('first_name') || '').trim();
  const last_name = String(formData.get('last_name') || '').trim();
  const username = String(formData.get('username') || '').trim().toLowerCase();
  const phone = String(formData.get('phone') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const name = [first_name, last_name].filter(Boolean).join(' ').trim();

  if (!USERNAME_PATTERN.test(username)) {
    return redirect(
      '/profile/settings?error=Username%20must%20be%203-20%20characters%20using%20only%20letters%2C%20numbers%2C%20or%20underscores.'
    );
  }

  const supabase = createClient();

  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .update({ first_name, last_name, username, phone, name })
    .eq('id', user.id);

  if (profileError) {
    if (profileError.message.toLowerCase().includes('username')) {
      return redirect('/profile/settings?error=This%20username%20is%20already%20taken.');
    }

    return redirect(`/profile/settings?error=${encodeURIComponent(profileError.message)}`);
  }

  if (email && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });

    if (emailError) {
      return redirect(`/profile/settings?error=${encodeURIComponent(emailError.message)}`);
    }

    return redirect('/profile/settings?status=Profile%20saved.%20Check%20your%20new%20email%20for%20confirmation.');
  }

  return redirect('/profile/settings?status=Profile%20saved%20successfully.');
}

export async function changePassword(formData: FormData) {
  await requireUser();

  const password = String(formData.get('password') || '').trim();
  const passwordConfirm = String(formData.get('passwordConfirm') || '').trim();

  if (password.length < 6) {
    return redirect('/profile/settings?error=Password%20must%20be%20at%20least%206%20characters.');
  }

  if (password !== passwordConfirm) {
    return redirect('/profile/settings?error=Passwords%20do%20not%20match.');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect(`/profile/settings?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/profile/settings?status=Password%20updated%20successfully.');
}

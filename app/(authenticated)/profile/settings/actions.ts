'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_MIN_LENGTH = 8;

function normalizePhoneNational(value: string) {
  const compact = value.replace(/\s+/g, '');
  if (!compact) return '';

  if (!/^\d+$/.test(compact)) {
    return null;
  }

  return compact;
}

export async function updateAccountPreferences(formData: FormData) {
  const user = await requireUser();
  const first_name = String(formData.get('first_name') || '').trim();
  const last_name = String(formData.get('last_name') || '').trim();
  const username = String(formData.get('username') || '')
    .trim()
    .toLowerCase();
  const phone = String(formData.get('phone') || '').trim();
  const phone_country = String(formData.get('phone_country') || 'EG').trim().toUpperCase();
  const phone_dial_code = String(formData.get('phone_dial_code') || '+20').trim();
  const phone_national_raw = String(formData.get('phone_national') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const name = [first_name, last_name].filter(Boolean).join(' ').trim();

  if (!USERNAME_PATTERN.test(username)) {
    return redirect(
      '/profile/settings?error=Username%20must%20be%203-20%20characters%20using%20only%20letters%2C%20numbers%2C%20or%20underscores.'
    );
  }

  const phone_national = normalizePhoneNational(phone_national_raw);

  if (phone_national === null) {
    return redirect('/profile/settings?error=Phone%20number%20must%20contain%20digits%20only.');
  }

  const phone_e164 = phone_national ? `${phone_dial_code}${phone_national}` : '';

  const supabase = createClient();

  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .upsert(
      {
        id: user.id,
        first_name,
        last_name,
        username,
        phone: phone_e164 || phone,
        phone_country,
        phone_dial_code,
        phone_national: phone_national || null,
        phone_e164: phone_e164 || null,
        name: name || user.email || username
      },
      { onConflict: 'id' }
    );

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
  const user = await requireUser();

  const currentPassword = String(formData.get('currentPassword') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const passwordConfirm = String(formData.get('passwordConfirm') || '').trim();

  if (!currentPassword) {
    return redirect('/profile/settings?error=Current%20password%20is%20required.');
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return redirect('/profile/settings?error=New%20password%20must%20be%20at%20least%208%20characters.');
  }

  if (password !== passwordConfirm) {
    return redirect('/profile/settings?error=Passwords%20do%20not%20match.');
  }

  if (!user.email) {
    return redirect('/profile/settings?error=Could%20not%20verify%20account%20email.');
  }

  const supabase = createClient();
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });

  if (reauthError) {
    return redirect('/profile/settings?error=Current%20password%20is%20incorrect.');
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    const message = error.message.toLowerCase().includes('weak')
      ? 'New%20password%20is%20too%20weak.'
      : encodeURIComponent('Failed to update password. Please try again.');

    return redirect(`/profile/settings?error=${message}`);
  }

  return redirect('/profile/settings?status=Password%20updated%20successfully.');
}

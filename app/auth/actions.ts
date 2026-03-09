'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getURL } from '@/utils/helpers';
import { createAdminClient } from '@/utils/supabase/service-role';

const LOGIN_INVALID_CREDENTIALS = 'Invalid login credentials';
const LOGIN_EMAIL_NOT_CONFIRMED = 'Email not confirmed';
const SIGNUP_USER_EXISTS = 'User already registered';
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const formatLoginError = (message: string) => {
  if (message === LOGIN_EMAIL_NOT_CONFIRMED) {
    return 'Please confirm your email before signing in. Check your inbox for the confirmation link.';
  }

  if (message === LOGIN_INVALID_CREDENTIALS) {
    return 'Incorrect password. Please try again.';
  }

  return message;
};

const sanitizeUsername = (value: string) => value.trim().toLowerCase();

export async function login(formData: FormData) {
  const identifier = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();

  if (!identifier || !password) {
    return redirect('/login?error=Please enter your email%20or%20username%20and%20password.');
  }

  const supabase = createClient();
  let email = identifier;

  if (!identifier.includes('@')) {
    const username = sanitizeUsername(identifier);

    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await (adminClient as any)
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .maybeSingle();

    if (profileError) {
      return redirect(`/login?error=${encodeURIComponent(profileError.message)}`);
    }

    if (!profile) {
      return redirect('/login?error=Username%20not%20found.');
    }

    const { data: authUserResult, error: userError } = await adminClient.auth.admin.getUserById(profile.id);

    if (userError) {
      return redirect(`/login?error=${encodeURIComponent(userError.message)}`);
    }

    if (!authUserResult.user?.email) {
      return redirect('/login?error=Username%20not%20found.');
    }

    email = authUserResult.user.email;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(formatLoginError(error.message))}`);
  }

  return redirect('/home');
}

export async function signup(formData: FormData) {
  const first_name = String(formData.get('first_name') || '').trim();
  const last_name = String(formData.get('last_name') || '').trim();
  const username = sanitizeUsername(String(formData.get('username') || ''));
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const name = [first_name, last_name].filter(Boolean).join(' ').trim();

  if (!USERNAME_PATTERN.test(username)) {
    return redirect(
      '/signup?error=Username%20must%20be%203-20%20characters%20using%20only%20letters%2C%20numbers%2C%20or%20underscores.'
    );
  }

  const adminClient = createAdminClient();
  const { data: existingUsername } = await (adminClient as any)
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existingUsername) {
    return redirect('/signup?error=This%20username%20is%20already%20taken.');
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        first_name,
        last_name,
        username,
        phone
      },
      emailRedirectTo: getURL('auth/callback')
    }
  });

  if (error) {
    const message =
      error.message === SIGNUP_USER_EXISTS
        ? 'An account with this email already exists. Please sign in instead.'
        : error.message;

    return redirect(`/signup?error=${encodeURIComponent(message)}`);
  }

  const emailIdentities =
    data.user?.identities?.filter((identity) => identity?.provider === 'email') ?? [];
  if (emailIdentities.length === 0) {
    return redirect(
      `/signup?error=${encodeURIComponent('An account with this email already exists. Please sign in instead.')}`
    );
  }

  const userId = data.user?.id;

  if (userId) {
    const { error: upsertError } = await (adminClient as any).from('profiles').upsert({
      id: userId,
      name,
      first_name,
      last_name,
      username,
      phone
    });

    if (upsertError) {
      if (upsertError.message.toLowerCase().includes('username')) {
        return redirect('/signup?error=This%20username%20is%20already%20taken.');
      }

      return redirect(`/signup?error=${encodeURIComponent(upsertError.message)}`);
    }
  }

  if (!data.session) {
    return redirect('/login?message=Check your email to confirm your account.');
  }

  return redirect('/home');
}

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();

  if (!email) {
    return redirect('/forgot-password?error=Please enter a valid email address.');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getURL('auth/callback?next=/reset-password')
  });

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/forgot-password?message=Password reset link sent. Please check your email.');
}

export async function resetPassword(formData: FormData) {
  const password = String(formData.get('password') || '').trim();
  const passwordConfirm = String(formData.get('passwordConfirm') || '').trim();

  if (password.length < 6) {
    return redirect('/reset-password?error=Password must be at least 6 characters.');
  }

  if (password !== passwordConfirm) {
    return redirect('/reset-password?error=Passwords do not match.');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/login?message=Password updated successfully. Please sign in.');
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();

  return redirect('/login');
}

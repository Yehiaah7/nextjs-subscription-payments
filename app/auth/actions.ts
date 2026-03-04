'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getURL } from '@/utils/helpers';

const LOGIN_INVALID_CREDENTIALS = 'Invalid login credentials';
const LOGIN_EMAIL_NOT_CONFIRMED = 'Email not confirmed';
const SIGNUP_USER_EXISTS = 'User already registered';

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.message === LOGIN_EMAIL_NOT_CONFIRMED
        ? 'Please confirm your email before signing in. Check your inbox for the confirmation link.'
        : error.message === LOGIN_INVALID_CREDENTIALS
          ? 'Incorrect email or password. Please try again.'
          : error.message;

    return redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  return redirect('/home');
}

export async function signup(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const name = String(formData.get('name') || '').trim();

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
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

  const emailIdentities = data.user?.identities?.filter((identity) => identity?.provider === 'email') ?? [];
  if (emailIdentities.length === 0) {
    return redirect(
      `/signup?error=${encodeURIComponent('An account with this email already exists. Please sign in instead.')}`
    );
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

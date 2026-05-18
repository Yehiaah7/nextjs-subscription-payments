// redeploy
import Link from 'next/link';
import { ChevronLeft, Lock, UserRound } from 'lucide-react';
import { login } from '@/app/auth/actions';
import { MotionInput } from '@/components/motion';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PasswordField from '@/components/ui/PasswordField';
import AuthSubmitButton from '@/components/ui/AuthSubmitButton';
import GoogleSignInButton from '@/components/ui/AuthForms/GoogleSignInButton';
import {
  btnInteractive,
  btnInteractiveColored,
  focusRingInteractive,
  iconBtnInteractive,
  inputInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

export default async function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string };
}) {
  const supabase = createClient();
  let user = null;

  try {
    const {
      data: { user: authUser }
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    user = null;
  }

  if (user) {
    redirect('/home');
  }

  return (
    <div className="flex justify-center min-h-[calc(100vh-80px)] bg-[#F7F7F7] px-4 py-6">
      <div className="w-full max-w-sm">
        <div
          className={cn(
            'mb-7 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm',
            iconBtnInteractive,
            focusRingInteractive
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </div>

        <h1 className="text-[46px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.02]">
          Welcome back
        </h1>
        <p className="mt-2 text-lg font-extrabold uppercase tracking-[0.08em] text-blue-600">
          Resume your progress
        </p>

        <form action={login} className="mt-8 grid gap-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Email or username
            </label>
            <MotionInput className={cn('flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-4', inputInteractive)}>
              <input
                name="email"
                type="text"
                required
                placeholder="Enter your email or username"
                className={cn(
                  'h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400',
                  focusRingInteractive
                )}
              />
              <UserRound className="h-4 w-4 text-slate-300" />
            </MotionInput>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Gym password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold uppercase tracking-[0.08em] text-blue-600"
              >
                Forgot?
              </Link>
            </div>
            <PasswordField
              name="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              containerClassName={cn(
                'flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-4',
                inputInteractive
              )}
              inputClassName={cn(
                'h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400',
                focusRingInteractive
              )}
              leftIcon={<Lock className="h-4 w-4 text-slate-300" />}
              iconClassName="h-4 w-4 text-slate-300"
            />
          </div>

          <AuthSubmitButton
            className={cn(
              'mt-2 h-12 rounded-2xl bg-blue-600 text-sm font-extrabold uppercase tracking-[0.14em] text-white',
              btnInteractive,
              btnInteractiveColored,
              focusRingInteractive
            )}
          >
            Sign in
          </AuthSubmitButton>
        </form>

        <div className="mt-4">
          <GoogleSignInButton label="Sign in with Google" />
        </div>

        {searchParams.error && (
          <p className="mt-3 text-sm text-red-500">{searchParams.error}</p>
        )}
        {searchParams.message && (
          <p className="mt-3 text-sm text-emerald-600">
            {searchParams.message}
          </p>
        )}

        <p className="mt-5 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-extrabold uppercase tracking-[0.06em] text-blue-600"
          >
            Join the gym
          </Link>
        </p>
      </div>
    </div>
  );
}

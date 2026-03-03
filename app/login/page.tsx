// redeploy
import Link from 'next/link';
import { ChevronLeft, Eye, Lock, UserRound } from 'lucide-react';
import { login } from '@/app/auth/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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
    <div className="flex justify-center min-h-[calc(100vh-80px)] bg-slate-200 px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="mb-7 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
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
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
              <input
                name="email"
                type="email"
                required
                placeholder="Enter your email or username"
                className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
              />
              <UserRound className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Gym password
              </label>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-blue-600">
                Forgot?
              </span>
            </div>
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
              <Lock className="h-4 w-4 text-slate-300" />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
              />
              <Eye className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 h-12 rounded-2xl bg-blue-600 text-sm font-extrabold uppercase tracking-[0.14em] text-white"
          >
            Sign in
          </button>
        </form>

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

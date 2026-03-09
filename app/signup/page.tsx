import Link from 'next/link';
import { ChevronLeft, Eye, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { signup } from '@/app/auth/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignupPage({
  searchParams
}: {
  searchParams: { error?: string };
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
          Create account
        </h1>
        <p className="mt-2 text-lg font-extrabold uppercase tracking-[0.08em] text-blue-600">
          Join the gym floor
        </p>

        <form action={signup} className="mt-8 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                First name
              </label>
              <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-3">
                <input
                  name="first_name"
                  type="text"
                  placeholder="First"
                  className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
                />
                <UserRound className="h-4 w-4 text-slate-300" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Last name
              </label>
              <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-3">
                <input
                  name="last_name"
                  type="text"
                  placeholder="Last"
                  className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
                />
                <UserRound className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Gym username
            </label>
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
              <input
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_]{3,20}"
                placeholder="username"
                className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
              />
              <span className="text-sm font-semibold text-slate-300">@</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Email address
            </label>
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
              <input
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
              />
              <Mail className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Phone number
            </label>
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-3">
              <div className="flex h-8 items-center gap-1 rounded-xl bg-slate-100 px-2 text-slate-700">
                <span className="text-xl leading-none">+</span>
                <span className="text-sm font-semibold">20</span>
              </div>
              <input
                name="phone"
                type="tel"
                placeholder="123 456 7890"
                className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
              />
              <Phone className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Gym password
            </label>
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
              <Lock className="h-4 w-4 text-slate-300" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
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
            Create account
          </button>
        </form>

        {searchParams.error && (
          <p className="mt-3 text-sm text-red-500">{searchParams.error}</p>
        )}

        <p className="mt-5 text-center text-sm font-extrabold uppercase tracking-[0.05em] text-blue-600">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-slate-400">
          By joining, you agree to the{' '}
          <span className="underline">Terms of Service</span> and{' '}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

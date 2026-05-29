import Link from 'next/link';
import { ChevronLeft, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { signup } from '@/app/auth/actions';
import { MotionInput } from '@/components/motion';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PasswordField from '@/components/ui/PasswordField';
import AuthSubmitButton from '@/components/ui/AuthSubmitButton';
import GoogleSignInButton from '@/components/ui/AuthForms/GoogleSignInButton';
import AuthBrandHeader from '@/components/ui/AuthBrandHeader';
import {
  btnInteractive,
  btnInteractiveColored,
  focusRingInteractive,
  iconBtnInteractive,
  inputInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

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
    <div className="min-h-dvh bg-[#F7F7F7] md:flex md:flex-col">
      <AuthBrandHeader />
      <main className="flex justify-center px-4 py-6 md:flex-1 md:items-center md:py-10">
        <div className="w-full max-w-sm md:max-w-[440px] md:rounded-[20px] md:border md:border-[#dbeafe] md:bg-white md:p-8 md:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div
            className={cn(
              'mb-7 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm md:hidden',
              iconBtnInteractive,
              focusRingInteractive
            )}
          >
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
                <MotionInput
                  className={cn(
                    'flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-3',
                    inputInteractive
                  )}
                >
                  <input
                    name="first_name"
                    type="text"
                    placeholder="First"
                    className={cn(
                      'h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400',
                      focusRingInteractive
                    )}
                  />
                  <UserRound className="h-4 w-4 text-slate-300" />
                </MotionInput>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Last name
                </label>
                <MotionInput
                  className={cn(
                    'flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-3',
                    inputInteractive
                  )}
                >
                  <input
                    name="last_name"
                    type="text"
                    placeholder="Last"
                    className={cn(
                      'h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400',
                      focusRingInteractive
                    )}
                  />
                  <UserRound className="h-4 w-4 text-slate-300" />
                </MotionInput>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Gym username
              </label>
              <MotionInput
                className={cn(
                  'flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-4',
                  inputInteractive
                )}
              >
                <input
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9_]{3,20}"
                  placeholder="username"
                  className={cn(
                    'h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400',
                    focusRingInteractive
                  )}
                />
                <span className="text-sm font-semibold text-slate-300">@</span>
              </MotionInput>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Email address
              </label>
              <MotionInput
                className={cn(
                  'flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-4',
                  inputInteractive
                )}
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className={cn(
                    'h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400',
                    focusRingInteractive
                  )}
                />
                <Mail className="h-4 w-4 text-slate-300" />
              </MotionInput>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Phone number
              </label>
              <MotionInput
                className={cn(
                  'flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-3',
                  inputInteractive
                )}
              >
                <div className="flex h-8 items-center gap-1 rounded-xl bg-slate-100 px-2 text-slate-700">
                  <span className="text-xl leading-none">+</span>
                  <span className="text-sm font-semibold">20</span>
                </div>
                <input
                  name="phone"
                  type="tel"
                  placeholder="123 456 7890"
                  className={cn(
                    'h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400',
                    focusRingInteractive
                  )}
                />
                <Phone className="h-4 w-4 text-slate-300" />
              </MotionInput>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Gym password
              </label>
              <PasswordField
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
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
              Create account
            </AuthSubmitButton>
          </form>

          <div className="mt-6 grid gap-4">
            <GoogleSignInButton label="Continue with Google" />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                or continue with email
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </div>

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
      </main>
    </div>
  );
}

import Link from 'next/link';
import { Lock, Mail, Phone, UserRound } from 'lucide-react';
import { signup } from '@/app/auth/actions';
import { MotionInput } from '@/components/motion';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PasswordField from '@/components/ui/PasswordField';
import AuthSubmitButton from '@/components/ui/AuthSubmitButton';
import GoogleSignInButton from '@/components/ui/AuthForms/GoogleSignInButton';
import AuthLayout, {
  authInputShellClassName,
  authTitleClassName
} from '@/components/ui/AuthForms/AuthLayout';
import {
  btnInteractive,
  btnInteractiveColored,
  focusRingInteractive,
  inputInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';
import PhoneCountrySelect from '@/components/ui/AuthForms/PhoneCountrySelect';

const compactAuthInputShellClassName = cn(authInputShellClassName, 'px-3');

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
    <AuthLayout cardClassName="overflow-visible">
      <h1 className={authTitleClassName}>Create account</h1>
      <p className="mt-2 text-lg font-extrabold uppercase tracking-[0.08em] text-blue-600">
        Join the gym floor
      </p>

      <form
        action={signup}
        className="mt-8 grid min-w-0 max-w-full gap-4 overflow-visible"
      >
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-3">
          <div className="min-w-0">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              First name
            </label>
            <MotionInput
              className={cn(compactAuthInputShellClassName, inputInteractive)}
            >
              <input
                name="first_name"
                type="text"
                placeholder="First"
                className={cn(
                  'h-full w-full min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400',
                  focusRingInteractive
                )}
              />
              <UserRound className="h-4 w-4 shrink-0 text-slate-300" />
            </MotionInput>
          </div>
          <div className="min-w-0">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Last name
            </label>
            <MotionInput
              className={cn(compactAuthInputShellClassName, inputInteractive)}
            >
              <input
                name="last_name"
                type="text"
                placeholder="Last"
                className={cn(
                  'h-full w-full min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400',
                  focusRingInteractive
                )}
              />
              <UserRound className="h-4 w-4 shrink-0 text-slate-300" />
            </MotionInput>
          </div>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Gym username
          </label>
          <MotionInput
            className={cn(authInputShellClassName, inputInteractive)}
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
                'h-full w-full min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400',
                focusRingInteractive
              )}
            />
            <span className="text-sm font-semibold text-slate-300">@</span>
          </MotionInput>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Email address
          </label>
          <MotionInput
            className={cn(authInputShellClassName, inputInteractive)}
          >
            <input
              name="email"
              type="email"
              required
              placeholder="name@company.com"
              className={cn(
                'h-full w-full min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400',
                focusRingInteractive
              )}
            />
            <Mail className="h-4 w-4 shrink-0 text-slate-300" />
          </MotionInput>
        </div>

        <div className="relative min-w-0 overflow-visible">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Phone number
          </label>
          <MotionInput
            className={cn(
              compactAuthInputShellClassName,
              'overflow-visible',
              inputInteractive
            )}
          >
            <PhoneCountrySelect />
            <input
              name="phone"
              type="tel"
              placeholder="123 456 7890"
              className={cn(
                'h-full w-full min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400',
                focusRingInteractive
              )}
            />
            <Phone className="h-4 w-4 shrink-0 text-slate-300" />
          </MotionInput>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Gym password
          </label>
          <PasswordField
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Password"
            containerClassName={cn(authInputShellClassName, inputInteractive)}
            inputClassName={cn(
              'h-full w-full min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400',
              focusRingInteractive
            )}
            leftIcon={<Lock className="h-4 w-4 shrink-0 text-slate-300" />}
            iconClassName="h-4 w-4 shrink-0 text-slate-300"
          />
        </div>

        <AuthSubmitButton
          className={cn(
            'mt-2 h-12 w-full min-w-0 rounded-2xl bg-blue-600 text-sm font-extrabold uppercase tracking-[0.14em] text-white',
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
    </AuthLayout>
  );
}

import Link from 'next/link';
import { ChevronLeft, Lock } from 'lucide-react';
import { resetPassword } from '@/app/auth/actions';
import { MotionInput } from '@/components/motion';
import {
  btnInteractive,
  btnInteractiveColored,
  focusRingInteractive,
  iconBtnInteractive,
  inputInteractive
} from '@/components/ui/interactive';
import PasswordField from '@/components/ui/PasswordField';
import AuthSubmitButton from '@/components/ui/AuthSubmitButton';
import { cn } from '@/utils/cn';

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="flex justify-center min-h-[calc(100vh-80px)] bg-[#F7F7F7] px-4 py-6">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className={cn(
            'mb-7 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm',
            iconBtnInteractive,
            focusRingInteractive
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <h1 className="text-[40px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.05]">
          Reset password
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-blue-600">
          Set a new secure password
        </p>

        <form action={resetPassword} className="mt-8 grid gap-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              New password
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
              inputClassName={cn('h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400', focusRingInteractive)}
              leftIcon={<Lock className="h-4 w-4 text-slate-300" />}
              iconClassName="h-4 w-4 text-slate-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Confirm password
            </label>
            <PasswordField
              name="passwordConfirm"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Confirm password"
              containerClassName={cn(
                'flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-4',
                inputInteractive
              )}
              inputClassName={cn('h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400', focusRingInteractive)}
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
            Update password
          </AuthSubmitButton>
        </form>

        {searchParams.error && (
          <p className="mt-3 text-sm text-red-500">{searchParams.error}</p>
        )}
        {searchParams.message && (
          <p className="mt-3 text-sm text-emerald-600">{searchParams.message}</p>
        )}
      </div>
    </div>
  );
}

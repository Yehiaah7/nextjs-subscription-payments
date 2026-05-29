import Link from 'next/link';
import { ChevronLeft, Mail } from 'lucide-react';
import { forgotPassword } from '@/app/auth/actions';
import { MotionInput } from '@/components/motion';
import FormLoadingButton from '@/components/ui/FormLoadingButton';
import AuthBrandHeader from '@/components/ui/AuthBrandHeader';
import {
  btnInteractive,
  btnInteractiveColored,
  focusRingInteractive,
  iconBtnInteractive,
  inputInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

const authTitleClassName =
  'text-[42px] font-extrabold leading-[1.03] tracking-[-0.03em] text-slate-900';
const authInputShellClassName =
  'flex h-12 items-center gap-2 rounded-2xl border border-[#bfdbfe] bg-white px-4 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20';

export default function ForgotPasswordPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="min-h-dvh bg-[#F7F7F7] md:flex md:flex-col">
      <AuthBrandHeader />
      <main className="flex justify-center px-4 py-6 md:flex-1 md:items-center md:py-10">
        <div className="w-full max-w-sm md:max-w-[440px] md:rounded-[20px] md:border md:border-[#dbeafe] md:bg-white md:p-8 md:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <Link
            href="/login"
            className={cn(
              'mb-7 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm md:hidden',
              iconBtnInteractive,
              focusRingInteractive
            )}
            aria-label="Back to login"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <h1 className={authTitleClassName}>Forgot password</h1>
          <p className="mt-2 text-lg font-extrabold uppercase tracking-[0.08em] text-blue-600">
            Reset your account access
          </p>

          <form action={forgotPassword} className="mt-8 grid gap-4">
            <div>
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
                    'h-full min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400',
                    focusRingInteractive
                  )}
                />
                <Mail className="h-4 w-4 text-slate-300" />
              </MotionInput>
            </div>

            <FormLoadingButton
              className={cn(
                'mt-2 h-12 rounded-2xl bg-blue-600 text-sm font-extrabold uppercase tracking-[0.14em] text-white',
                btnInteractive,
                btnInteractiveColored,
                focusRingInteractive
              )}
            >
              Send reset link
            </FormLoadingButton>
          </form>

          {searchParams.error && (
            <p className="mt-3 text-sm text-red-500">{searchParams.error}</p>
          )}
          {searchParams.message && (
            <p className="mt-3 text-sm text-emerald-600">
              {searchParams.message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

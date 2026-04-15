import Link from 'next/link';
import { ChevronLeft, Mail } from 'lucide-react';
import { forgotPassword } from '@/app/auth/actions';
import {
  btnInteractive,
  btnInteractiveColored,
  focusRingInteractive,
  iconBtnInteractive,
  inputInteractive
} from '@/components/ui/interactive';
import { cn } from '@/utils/cn';

export default function ForgotPasswordPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="flex justify-center min-h-[calc(100vh-80px)] bg-slate-200 px-4 py-6">
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
          Forgot password
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-blue-600">
          Reset your account access
        </p>

        <form action={forgotPassword} className="mt-8 grid gap-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Email address
            </label>
            <div className={cn('flex h-12 items-center gap-2 rounded-2xl border border-transparent bg-white px-4', inputInteractive)}>
              <input
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                className={cn('h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400', focusRingInteractive)}
              />
              <Mail className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <button
            type="submit"
            className={cn(
              'mt-2 h-12 rounded-2xl bg-blue-600 text-sm font-extrabold uppercase tracking-[0.14em] text-white',
              btnInteractive,
              btnInteractiveColored,
              focusRingInteractive
            )}
          >
            Send reset link
          </button>
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

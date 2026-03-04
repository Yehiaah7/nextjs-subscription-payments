import Link from 'next/link';
import { ChevronLeft, Eye, Lock } from 'lucide-react';
import { resetPassword } from '@/app/auth/actions';

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="flex justify-center min-h-[calc(100vh-80px)] bg-slate-200 px-4 py-6">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-7 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm"
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

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Confirm password
            </label>
            <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4">
              <Lock className="h-4 w-4 text-slate-300" />
              <input
                name="passwordConfirm"
                type="password"
                required
                minLength={6}
                placeholder="Confirm password"
                className="h-full w-full bg-transparent text-slate-700 placeholder:text-slate-400"
              />
              <Eye className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 h-12 rounded-2xl bg-blue-600 text-sm font-extrabold uppercase tracking-[0.14em] text-white"
          >
            Update password
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

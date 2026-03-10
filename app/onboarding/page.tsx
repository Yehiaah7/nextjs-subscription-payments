import Link from 'next/link';
import { Bolt, Compass, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

const onboardingFeatures = [
  {
    icon: Bolt,
    iconColor: 'text-[#f59e0b]',
    label: 'Real-world challenges from FAANG hiring loops'
  },
  {
    icon: Compass,
    iconColor: 'text-[#0ea5e9]',
    label: 'Zero fluff, just pure decision-based training'
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-[#22c55e]',
    label: 'Expert feedback that explains the why'
  }
];

export default async function OnboardingPage() {
  const supabase = createClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      redirect('/home');
    }
  } catch {
    // keep onboarding available for unauthenticated users
  }

  return (
    <main className="min-h-screen bg-[#f1f5f9] px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col py-6">
        <section className="flex flex-1 flex-col items-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#155dfc] shadow-sm">
            <svg
              width="16"
              height="28"
              viewBox="0 0 5 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M1 1L4 4.5L1 8"
                stroke="#00bc7d"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="mt-8 text-center text-[34px] font-bold leading-[1.15] text-[#0f172b]">
            Master Product Decisions.
          </h1>

          <div className="mt-8 w-full space-y-3 pb-44">
            {onboardingFeatures.map(({ icon: Icon, iconColor, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f8fafc]">
                  <Icon className={iconColor} size={18} aria-hidden="true" />
                </div>
                <p className="text-sm font-medium leading-[1.4] text-[#45556c]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="sticky bottom-0 mt-auto w-full bg-[#f1f5f9] pt-4 [padding-bottom:calc(24px+env(safe-area-inset-bottom))]">
          <div className="space-y-4">
            <Link
              href="/sign-up"
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#155dfc] text-center text-xs font-bold uppercase tracking-[1.2px] text-white"
            >
              GET STARTED →
            </Link>

            <p className="text-center text-sm font-medium text-[#45556c]">
              Already have an account?{' '}
              <Link href="/signin" className="font-semibold uppercase text-[#155dfc]">
                SIGN IN
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

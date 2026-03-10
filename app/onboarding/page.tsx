import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

const onboardingLines = [
  'Real-world challenges from FAANG hiring loops',
  'Zero fluff, just pure decision-based training',
  'Expert feedback that explains the why'
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
    <main className="min-h-screen bg-[#f1f5f9] px-4 py-6">
      <div className="mx-auto flex w-full max-w-[393px] justify-center">
        <div className="flex h-[701px] w-full max-w-[361px] flex-col gap-4 pt-[224px]">
          <section className="flex h-[398px] flex-col gap-6">
            <div className="flex h-[194px] flex-col gap-6">
              <div className="inline-flex h-5 w-5 items-center justify-center rounded-2xl bg-[#155dfc]">
                <svg
                  width="5"
                  height="9"
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

              <div className="flex h-[180px] flex-col gap-3">
                <h1 className="text-4xl font-bold leading-[1.4] text-[#0f172b]">
                  Master Product
                  <br />
                  Interviews Faster
                </h1>

                <div className="flex flex-col gap-[10px] text-sm font-medium leading-[1.4] text-[#45556c]">
                  {onboardingLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/signup"
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#155dfc] text-center text-xs font-bold uppercase tracking-[1.2px] text-white"
              >
                Get Started
              </Link>

              <p className="text-center text-sm font-medium text-[#45556c]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#155dfc]">
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

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
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19.9961 8.33143C19.9981 7.66497 19.8668 7.00485 19.6099 6.38988C19.353 5.77492 18.9757 5.21754 18.5003 4.75051C18.0248 4.28349 17.4608 3.91625 16.8413 3.67041C16.2218 3.42456 15.5595 3.30507 14.8932 3.31896C14.2268 3.33285 13.57 3.47983 12.9614 3.75128C12.3527 4.02272 11.8044 4.41314 11.3488 4.89957C10.8933 5.38601 10.5395 5.95863 10.3085 6.58376C10.0775 7.20889 9.97375 7.87392 10.0035 8.53972C9.02405 8.79155 8.11476 9.26296 7.34449 9.91825C6.57422 10.5735 5.96316 11.3955 5.55759 12.3219C5.15203 13.2483 4.96259 14.2549 5.00363 15.2653C5.04467 16.2758 5.31511 17.2637 5.79447 18.1541C4.95163 18.8389 4.28886 19.7191 3.86382 20.7184C3.43877 21.7177 3.26432 22.8057 3.35564 23.8878C3.44697 24.9698 3.80129 26.0132 4.3878 26.9271C4.97432 27.841 5.77524 28.5978 6.72092 29.1316C6.60414 30.0351 6.67383 30.9529 6.92568 31.8285C7.17753 32.704 7.6062 33.5186 8.18521 34.222C8.76423 34.9253 9.48129 35.5025 10.2921 35.9179C11.1029 36.3333 11.9903 36.578 12.8994 36.637C13.8086 36.696 14.7201 36.568 15.5778 36.2609C16.4355 35.9538 17.2212 35.4741 17.8862 34.8515C18.5513 34.2289 19.0817 33.4765 19.4445 32.6409C19.8074 31.8052 19.9952 30.9041 19.9961 29.993V8.33143Z"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.9961 21.6617C16.395 21.1696 17.6166 20.2737 18.5064 19.0873C19.3962 17.9009 19.9142 16.4774 19.9949 14.9966"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.002 8.53955C10.0349 9.34558 10.2624 10.1317 10.6651 10.8307"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.79297 18.1559C6.0978 17.9077 6.42399 17.6869 6.76774 17.4961"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.99827 29.9931C8.84992 29.9936 7.72091 29.6975 6.7207 29.1333"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.9961 21.6616H26.6612"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.9961 29.9932H29.9938C30.8776 29.9932 31.7253 30.3443 32.3502 30.9692C32.9752 31.5942 33.3263 32.4419 33.3263 33.3257V34.992"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.9961 13.3301H33.3263"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M26.6602 13.3304V8.33158C26.6602 7.44773 27.0113 6.60008 27.6362 5.97511C28.2612 5.35013 29.1089 4.99902 29.9927 4.99902"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M26.6613 22.4949C27.1214 22.4949 27.4944 22.1219 27.4944 21.6618C27.4944 21.2016 27.1214 20.8286 26.6613 20.8286C26.2011 20.8286 25.8281 21.2016 25.8281 21.6618C25.8281 22.1219 26.2011 22.4949 26.6613 22.4949Z"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M29.9933 5.8318C30.4534 5.8318 30.8264 5.4588 30.8264 4.99867C30.8264 4.53854 30.4534 4.16553 29.9933 4.16553C29.5332 4.16553 29.1602 4.53854 29.1602 4.99867C29.1602 5.4588 29.5332 5.8318 29.9933 5.8318Z"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M33.3253 35.825C33.7855 35.825 34.1585 35.452 34.1585 34.9918C34.1585 34.5317 33.7855 34.1587 33.3253 34.1587C32.8652 34.1587 32.4922 34.5317 32.4922 34.9918C32.4922 35.452 32.8652 35.825 33.3253 35.825Z"
                stroke="white"
                strokeWidth="3.33255"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M33.3253 14.1633C33.7855 14.1633 34.1585 13.7903 34.1585 13.3302C34.1585 12.8701 33.7855 12.4971 33.3253 12.4971C32.8652 12.4971 32.4922 12.8701 32.4922 13.3302C32.4922 13.7903 32.8652 14.1633 33.3253 14.1633Z"
                stroke="white"
                strokeWidth="3.33255"
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

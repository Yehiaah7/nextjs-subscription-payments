import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { Red_Hat_Display } from 'next/font/google';
import 'styles/main.css';

const title = 'Next.js Subscription Starter';
const description = 'Brought to you by Vercel, Stripe, and Supabase.';
const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description
  }
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={redHatDisplay.variable}>
      <body className={redHatDisplay.className}>
        <main id="skip" className="min-h-dvh">
          {children}
        </main>
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}

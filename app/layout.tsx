import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { Red_Hat_Display } from 'next/font/google';
import 'styles/main.css';

const title = 'Product Gym';
const description =
  'Practice product management skills, interview questions, and product thinking challenges.';
const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  applicationName: 'Product Gym',
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    url: 'https://productgymapp.vercel.app',
    siteName: 'Product Gym'
  },
  twitter: {
    card: 'summary_large_image',
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

import { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import 'styles/main.css';

const title = 'Product Gym';
const description =
  'Practice product management skills, interview questions, and product thinking challenges.';
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Red Hat Display is the Product Gym brand font, and next/font cannot fetch Google fonts in this build environment. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
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

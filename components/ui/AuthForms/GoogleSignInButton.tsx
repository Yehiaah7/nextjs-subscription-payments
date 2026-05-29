'use client';

import { createClient } from '@/utils/supabase/client';
import { getOAuthRedirectUrl } from '@/utils/auth/oauth-redirect';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  btnInteractive,
  focusRingInteractive,
  inputInteractive
} from '@/components/ui/interactive';

type GoogleSignInButtonProps = {
  label?: string;
  className?: string;
};

export default function GoogleSignInButton({
  label = 'Continue with Google',
  className
}: GoogleSignInButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const redirectTo = getOAuthRedirectUrl('/home');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again.';
      setIsSubmitting(false);
      router.push(
        `${pathname}?error=${encodeURIComponent(
          `Google sign-in failed: ${message}`
        )}`
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isSubmitting}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-white px-4 text-sm font-bold text-slate-700',
        inputInteractive,
        btnInteractive,
        focusRingInteractive,
        isSubmitting && 'cursor-not-allowed opacity-70',
        className
      )}
    >
      <Image src="/Google.svg" alt="Google" width={16} height={16} />
      <span>{isSubmitting ? 'Redirecting...' : label}</span>
    </button>
  );
}

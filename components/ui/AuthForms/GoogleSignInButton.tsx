'use client';

import { createClient } from '@/utils/supabase/client';
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
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/home`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });

    if (error) {
      setIsSubmitting(false);
      router.push(
        `${pathname}?error=${encodeURIComponent(
          `Google sign-in failed: ${error.message}`
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
        'flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700',
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

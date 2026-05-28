'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export function useLemonSqueezyUpgrade(onUpgrade?: () => void) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const paymentProvider = 'lemonsqueezy';

  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }

    setIsUpgrading(true);

    try {
      const response = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentProvider })
      });
      const data = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? 'Unable to create checkout.');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Unable to create Lemon Squeezy checkout:', error);
      setIsUpgrading(false);
      router.push(
        `${currentPath}?error=${encodeURIComponent(
          'Unable to start checkout. Please try again.'
        )}`
      );
    }
  };

  return { handleUpgrade, isUpgrading };
}

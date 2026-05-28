'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

type PracticeTimeTrackerProps = {
  userId: string;
};

const IDLE_TIMEOUT_MS = 60_000;
const FLUSH_INTERVAL_MS = 30_000;

export default function PracticeTimeTracker({ userId }: PracticeTimeTrackerProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const activeStartedAtRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef<number>(Date.now());
  const pendingSecondsRef = useRef(0);
  const isIdleRef = useRef(false);

  const isTrackableNow = useCallback(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return false;

    return document.visibilityState === 'visible' && document.hasFocus() && !isIdleRef.current;
  }, []);

  const flush = useCallback(
    async (sync = false) => {
      const pending = pendingSecondsRef.current;
      if (pending <= 0) return;

      pendingSecondsRef.current = 0;

      try {
        if (sync && typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/profile/practice-time', JSON.stringify({ seconds: pending }));
          return;
        }

        await (supabase as any).rpc('increment_practice_time', {
          seconds_to_add: pending
        });
      } catch {
        pendingSecondsRef.current += pending;
      }
    },
    [supabase]
  );

  const stopActiveWindow = useCallback(() => {
    if (activeStartedAtRef.current === null) return;

    const elapsedMs = Date.now() - activeStartedAtRef.current;
    activeStartedAtRef.current = null;

    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    if (elapsedSeconds > 0) {
      pendingSecondsRef.current += elapsedSeconds;
    }
  }, []);

  const startActiveWindow = useCallback(() => {
    if (activeStartedAtRef.current !== null) return;
    if (!isTrackableNow()) return;

    activeStartedAtRef.current = Date.now();
  }, [isTrackableNow]);

  const markActivity = useCallback(() => {
    lastActivityAtRef.current = Date.now();

    if (isIdleRef.current) {
      isIdleRef.current = false;
      startActiveWindow();
    }
  }, [startActiveWindow]);

  useEffect(() => {
    if (!userId) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopActiveWindow();
        void flush();
        return;
      }

      startActiveWindow();
    };

    const onWindowBlur = () => {
      stopActiveWindow();
      void flush();
    };

    const onWindowFocus = () => {
      markActivity();
      startActiveWindow();
    };

    const onBeforeUnload = () => {
      stopActiveWindow();
      void flush(true);
    };

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'scroll',
      'keydown',
      'touchstart'
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onWindowFocus);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('beforeunload', onBeforeUnload);

    const idleInterval = window.setInterval(() => {
      if (Date.now() - lastActivityAtRef.current > IDLE_TIMEOUT_MS) {
        if (!isIdleRef.current) {
          isIdleRef.current = true;
          stopActiveWindow();
          void flush();
        }
        return;
      }

      if (!isIdleRef.current && isTrackableNow()) {
        startActiveWindow();
      }
    }, 1_000);

    const flushInterval = window.setInterval(() => {
      stopActiveWindow();
      void flush();
      startActiveWindow();
    }, FLUSH_INTERVAL_MS);

    markActivity();
    startActiveWindow();

    return () => {
      stopActiveWindow();
      void flush();
      window.clearInterval(idleInterval);
      window.clearInterval(flushInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
    };
  }, [flush, isTrackableNow, markActivity, startActiveWindow, stopActiveWindow, userId]);

  useEffect(() => {
    markActivity();
    stopActiveWindow();
    void flush();
    startActiveWindow();
  }, [pathname, flush, markActivity, startActiveWindow, stopActiveWindow]);

  return null;
}

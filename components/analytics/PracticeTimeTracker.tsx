'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

type PracticeTimeTrackerProps = {
  userId: string;
};

const IDLE_TIMEOUT_MS = 60_000;
const FLUSH_INTERVAL_MS = 30_000;
const PRACTICE_TIME_ENDPOINT = '/api/profile/practice-time';

export default function PracticeTimeTracker({
  userId
}: PracticeTimeTrackerProps) {
  const pathname = usePathname();

  const activeStartedAtRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef<number>(Date.now());
  const pendingSecondsRef = useRef(0);
  const hasInteractedRef = useRef(false);
  const isIdleRef = useRef(false);
  const isFlushingRef = useRef(false);

  const isTrackableNow = useCallback(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return false;
    }

    const hasRecentActivity =
      hasInteractedRef.current &&
      Date.now() - lastActivityAtRef.current <= IDLE_TIMEOUT_MS;

    return (
      document.visibilityState === 'visible' &&
      document.hasFocus() &&
      hasRecentActivity &&
      !isIdleRef.current
    );
  }, []);

  const persistPracticeTime = useCallback(
    async (
      secondsToAdd: number,
      options: { keepalive?: boolean; useBeacon?: boolean } = {}
    ) => {
      const payload = JSON.stringify({ secondsToAdd });

      if (
        options.useBeacon &&
        typeof navigator !== 'undefined' &&
        navigator.sendBeacon
      ) {
        const blob = new Blob([payload], { type: 'application/json' });
        const queued = navigator.sendBeacon(PRACTICE_TIME_ENDPOINT, blob);

        if (queued) {
          return;
        }
      }

      const response = await fetch(PRACTICE_TIME_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload,
        keepalive: options.keepalive
      });

      if (!response.ok) {
        throw new Error('Failed to persist practice time');
      }
    },
    []
  );

  const flush = useCallback(
    async (options: { keepalive?: boolean; useBeacon?: boolean } = {}) => {
      if (isFlushingRef.current) {
        return;
      }

      const pending = Math.floor(pendingSecondsRef.current);

      if (!Number.isInteger(pending) || pending <= 0) {
        return;
      }

      pendingSecondsRef.current = 0;
      isFlushingRef.current = true;

      try {
        await persistPracticeTime(pending, options);
      } catch {
        pendingSecondsRef.current += pending;
      } finally {
        isFlushingRef.current = false;
      }
    },
    [persistPracticeTime]
  );

  const stopActiveWindow = useCallback(() => {
    if (activeStartedAtRef.current === null) {
      return;
    }

    const elapsedMs = Date.now() - activeStartedAtRef.current;
    activeStartedAtRef.current = null;

    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    if (elapsedSeconds > 0) {
      pendingSecondsRef.current += elapsedSeconds;
    }
  }, []);

  const startActiveWindow = useCallback(() => {
    if (activeStartedAtRef.current !== null) {
      return;
    }

    if (!isTrackableNow()) {
      return;
    }

    activeStartedAtRef.current = Date.now();
  }, [isTrackableNow]);

  const markActivity = useCallback(() => {
    hasInteractedRef.current = true;
    lastActivityAtRef.current = Date.now();

    if (isIdleRef.current) {
      isIdleRef.current = false;
      startActiveWindow();
    }
  }, [startActiveWindow]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopActiveWindow();
        void flush({ keepalive: true });
        return;
      }

      markActivity();
      startActiveWindow();
    };

    const onWindowBlur = () => {
      stopActiveWindow();
      void flush({ keepalive: true });
    };

    const onWindowFocus = () => {
      markActivity();
      startActiveWindow();
    };

    const onBeforeUnload = () => {
      stopActiveWindow();
      void flush({ keepalive: true, useBeacon: true });
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
      const isIdle = Date.now() - lastActivityAtRef.current > IDLE_TIMEOUT_MS;

      if (isIdle) {
        if (!isIdleRef.current) {
          isIdleRef.current = true;
          stopActiveWindow();
          void flush({ keepalive: true });
        }

        return;
      }

      if (!isIdleRef.current && isTrackableNow()) {
        startActiveWindow();
      }
    }, 1_000);

    const flushInterval = window.setInterval(() => {
      stopActiveWindow();
      void flush({ keepalive: true });
      startActiveWindow();
    }, FLUSH_INTERVAL_MS);

    return () => {
      stopActiveWindow();
      void flush({ keepalive: true, useBeacon: true });

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
  }, [
    flush,
    isTrackableNow,
    markActivity,
    startActiveWindow,
    stopActiveWindow,
    userId
  ]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    stopActiveWindow();
    void flush({ keepalive: true });
    startActiveWindow();
  }, [pathname, flush, startActiveWindow, stopActiveWindow, userId]);

  return null;
}

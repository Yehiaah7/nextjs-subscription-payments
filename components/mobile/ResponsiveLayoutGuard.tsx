'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  DESKTOP_HOME_ROUTE,
  DESKTOP_LAYOUT_ENTER_EVENT,
  DESKTOP_LAYOUT_MEDIA_QUERY,
  shouldNormalizeToDesktopHome
} from './responsive-layout';

export default function ResponsiveLayoutGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const routerRef = useRef(router);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_LAYOUT_MEDIA_QUERY);
    let wasDesktop = desktopQuery.matches;

    const normalizeForDesktop = () => {
      const currentPathname = pathnameRef.current;

      if (!shouldNormalizeToDesktopHome(currentPathname)) {
        return;
      }

      window.dispatchEvent(new CustomEvent(DESKTOP_LAYOUT_ENTER_EVENT));

      if (currentPathname !== DESKTOP_HOME_ROUTE) {
        routerRef.current.replace(DESKTOP_HOME_ROUTE);
      }
    };

    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      const isDesktop = event.matches;
      const crossedIntoDesktop = !wasDesktop && isDesktop;
      wasDesktop = isDesktop;

      if (crossedIntoDesktop) {
        normalizeForDesktop();
      }
    };

    desktopQuery.addEventListener('change', handleBreakpointChange);

    return () => {
      desktopQuery.removeEventListener('change', handleBreakpointChange);
    };
  }, []);

  return null;
}

export const DESKTOP_LAYOUT_MEDIA_QUERY = '(min-width: 1024px)';
export const DESKTOP_HOME_ROUTE = '/home';
export const DESKTOP_LAYOUT_ENTER_EVENT = 'productgym:desktop-layout-enter';

export const mobileDashboardRoutes = new Set([
  '/home',
  '/profile',
  '/notifications',
  '/alerts',
  '/leaderboard',
  '/profile/settings'
]);

export const shouldNormalizeToDesktopHome = (pathname: string) =>
  mobileDashboardRoutes.has(pathname);

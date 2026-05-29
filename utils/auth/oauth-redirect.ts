const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const normalizeOrigin = (url: string | undefined) => {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return null;
  }

  const urlWithProtocol = trimmedUrl.includes('://')
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  try {
    const parsedUrl = new URL(urlWithProtocol);
    return parsedUrl.origin;
  } catch {
    return null;
  }
};

const isLocalhostOrigin = (origin: string) =>
  LOCALHOST_ORIGIN_PATTERN.test(origin);

export const getOAuthRedirectUrl = (nextPath = '/home') => {
  const currentOrigin =
    typeof window === 'undefined'
      ? null
      : normalizeOrigin(window.location.origin);
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);

  const origin =
    currentOrigin && isLocalhostOrigin(currentOrigin)
      ? currentOrigin
      : configuredOrigin && !isLocalhostOrigin(configuredOrigin)
        ? configuredOrigin
        : currentOrigin;

  if (!origin) {
    throw new Error('Unable to determine OAuth redirect origin.');
  }

  const callbackUrl = new URL('/auth/callback', origin);
  callbackUrl.searchParams.set(
    'next',
    nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/home'
  );

  return callbackUrl.toString();
};

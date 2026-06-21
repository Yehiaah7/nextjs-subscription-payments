const LEMON_SQUEEZY_API_BASE_URL = 'https://api.lemonsqueezy.com/v1';

export type LemonSqueezyRequestOptions = Omit<RequestInit, 'body'> & {
  apiKey: string;
  body?: unknown;
};

export async function lemonSqueezyRequest<TResponse>(
  path: string,
  { apiKey, ...options }: LemonSqueezyRequestOptions
): Promise<TResponse> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(
    `${LEMON_SQUEEZY_API_BASE_URL}${normalizedPath}`,
    {
      ...options,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${apiKey}`,
        ...options.headers
      },
      body:
        options.body === undefined || typeof options.body === 'string'
          ? (options.body as BodyInit | undefined)
          : JSON.stringify(options.body)
    }
  );

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    const detail =
      responseBody?.errors?.[0]?.detail ??
      responseBody?.message ??
      response.statusText;
    throw new Error(`Lemon Squeezy API request failed: ${detail}`);
  }

  return responseBody as TResponse;
}

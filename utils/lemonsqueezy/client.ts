const LEMON_SQUEEZY_API_BASE_URL = 'https://api.lemonsqueezy.com/v1';

export type LemonSqueezyRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

function getLemonSqueezyApiKey() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing LEMONSQUEEZY_API_KEY. Set it on the server before calling Lemon Squeezy.'
    );
  }

  return apiKey;
}

export async function lemonSqueezyRequest<TResponse>(
  path: string,
  options: LemonSqueezyRequestOptions = {}
): Promise<TResponse> {
  const apiKey = getLemonSqueezyApiKey();
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

const DEFAULT_AVATAR_BUCKET = 'avatars';
const LEGACY_AVATAR_BUCKET = 'avatar';

function normalizeBucketName(value: string | undefined): string | null {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

export const AVATAR_BUCKET =
  normalizeBucketName(process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET) ??
  DEFAULT_AVATAR_BUCKET;

export const AVATAR_BUCKET_CANDIDATES = Array.from(
  new Set([AVATAR_BUCKET, DEFAULT_AVATAR_BUCKET, LEGACY_AVATAR_BUCKET])
);

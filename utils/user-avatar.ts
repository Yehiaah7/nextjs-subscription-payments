export type UserInitialsInput = {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
};

const normalize = (value?: string | null) => value?.trim() ?? '';

const firstLetter = (value: string) => value.charAt(0).toUpperCase();

export function getUserInitials({
  firstName,
  lastName,
  fullName,
  email
}: UserInitialsInput): string {
  const safeFirstName = normalize(firstName);
  const safeLastName = normalize(lastName);

  if (safeFirstName && safeLastName) {
    return `${firstLetter(safeFirstName)}${firstLetter(safeLastName)}`;
  }

  if (safeFirstName) {
    return firstLetter(safeFirstName);
  }

  if (safeLastName) {
    return firstLetter(safeLastName);
  }

  const safeFullName = normalize(fullName);
  if (safeFullName) {
    const tokens = safeFullName.split(/\s+/).filter(Boolean);
    if (tokens.length >= 2) {
      return `${firstLetter(tokens[0])}${firstLetter(tokens[tokens.length - 1])}`;
    }

    if (tokens[0]) {
      return firstLetter(tokens[0]);
    }
  }

  const safeEmail = normalize(email);
  if (safeEmail) {
    return firstLetter(safeEmail);
  }

  return 'P';
}

export function getUserDisplayName({
  firstName,
  lastName,
  fullName,
  email
}: UserInitialsInput): string {
  const safeFirstName = normalize(firstName);
  const safeLastName = normalize(lastName);
  const joined = [safeFirstName, safeLastName].filter(Boolean).join(' ').trim();

  if (joined) {
    return joined;
  }

  const safeFullName = normalize(fullName);
  if (safeFullName) {
    return safeFullName;
  }

  const safeEmail = normalize(email);
  if (safeEmail) {
    return safeEmail.split('@')[0] || 'Product Gym Member';
  }

  return 'Product Gym Member';
}

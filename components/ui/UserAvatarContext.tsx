'use client';

import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState
} from 'react';

export type SharedUserAvatar = {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
  imageUrl?: string | null;
};

type UserAvatarContextValue = {
  avatar: SharedUserAvatar;
  setAvatarImageUrl: (imageUrl: string | null) => void;
};

const UserAvatarContext = createContext<UserAvatarContextValue | null>(null);

export function UserAvatarProvider({
  initialAvatar,
  children
}: PropsWithChildren<{ initialAvatar: SharedUserAvatar }>) {
  const [avatar, setAvatar] = useState<SharedUserAvatar>(initialAvatar);

  const value = useMemo<UserAvatarContextValue>(
    () => ({
      avatar,
      setAvatarImageUrl: (imageUrl) =>
        setAvatar((previous) => ({ ...previous, imageUrl }))
    }),
    [avatar]
  );

  return (
    <UserAvatarContext.Provider value={value}>
      {children}
    </UserAvatarContext.Provider>
  );
}

export function useUserAvatar() {
  const context = useContext(UserAvatarContext);

  if (!context) {
    throw new Error('useUserAvatar must be used within UserAvatarProvider');
  }

  return context;
}

'use client';

import { ChangeEvent, ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarFilledIcon,
  CheckCircleFilledIcon,
  CrownFilledIcon,
  GlobeFilledIcon,
  MedalFilledIcon,
  TrophyFilledIcon
} from '@/components/icons/FilledIcons';
import MobileScreen from '@/components/mobile/MobileScreen';
import MotionPage from '@/components/motion/MotionPage';
import ProGymPassCard from '@/components/ProGymPassCard';
import UserAvatar from '@/components/ui/UserAvatar';
import { createClient } from '@/utils/supabase/client';
import { Camera } from 'lucide-react';
import { useUserAvatar } from '@/components/ui/UserAvatarContext';

type ProfileScreenProps = {
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

async function optimizeImage(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image for upload.'));
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  const maxSize = 512;
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext('2d');
  if (!context) {
    URL.revokeObjectURL(imageUrl);
    throw new Error('Could not process image.');
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(imageUrl);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export default function ProfileScreen({
  email,
  fullName,
  firstName,
  lastName,
  avatarUrl
}: ProfileScreenProps) {
  const { avatar, setAvatarImageUrl } = useUserAvatar();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file.');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('Please upload an image smaller than 4MB.');
      return;
    }

    try {
      setUploadError(null);
      setIsUploading(true);
      const optimizedAvatarDataUrl = await optimizeImage(file);
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Please sign in again to update your avatar.');
      }

      const { error } = await (supabase as any)
        .from('users')
        .update({ avatar_url: optimizedAvatarDataUrl })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setAvatarImageUrl(optimizedAvatarDataUrl);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Could not upload avatar. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MobileScreen>
      <MotionPage>
        <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4">
          <header>
            <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.6px] text-[#0f172b]">
              Profile
            </h1>
          </header>

          <section className="rounded-[var(--profile-card-radius)] border border-[var(--profile-main-stroke)] bg-[var(--profile-main-bg)] p-3">
            <div className="flex flex-col items-center">
              <div className="relative">
                <UserAvatar
                  imageUrl={avatar.imageUrl ?? avatarUrl}
                  firstName={avatar.firstName ?? firstName}
                  lastName={avatar.lastName ?? lastName}
                  fullName={avatar.fullName ?? fullName}
                  email={avatar.email ?? email}
                  className="h-[80px] w-[80px]"
                  initialsClassName="text-2xl"
                />

                <span className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full border border-[#bfdbfe] bg-white text-[#2563eb]">
                  <CrownFilledIcon className="h-3.5 w-3.5" />
                </span>

                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm"
                  aria-label="Upload profile photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </div>

              <p className="mt-3 text-center text-[16px] font-bold tracking-[-0.3px] text-[#0f172b]">
                {fullName}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[1px] text-[var(--profile-member-color)]">
                PRODUCT GYM MEMBER
              </p>
              <p className="mt-2 text-center text-[10px] font-semibold text-slate-500">
                {isUploading
                  ? 'Uploading avatar...'
                  : 'Tap camera to upload or replace your photo'}
              </p>
              {uploadError ? (
                <p className="mt-1 text-center text-[10px] font-semibold text-rose-600">
                  {uploadError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <StatCard
                icon={<TrophyFilledIcon className="h-3.5 w-3.5" />}
                label="RANK"
                value="#12"
              />
              <StatCard
                icon={<CheckCircleFilledIcon className="h-3.5 w-3.5" />}
                label="SOLVED"
                value="42"
              />
              <StatCard
                icon={<CalendarFilledIcon className="h-3.5 w-3.5" />}
                label="SOLVING DAYS"
                value="32"
              />
              <StatCard
                icon={<MedalFilledIcon className="h-3.5 w-3.5" />}
                label="WEEKLY TOP PERFORMER"
                value="4X"
              />
              <StatCard
                icon={<GlobeFilledIcon className="h-3.5 w-3.5" />}
                label="GLOBAL STANDINGS"
                value="#98"
              />
            </div>
          </section>

          <ProGymPassCard variant="profile" managePlansLabel="Manage Plans" />

          <Link
            href="/profile/settings"
            className="flex h-[82px] items-center justify-between rounded-[16px] border border-[#d7e3f7] bg-white p-3"
          >
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.9px] text-[#cad5e2]">
                Settings
              </p>
              <p className="text-[12px] font-bold tracking-[-0.3px] text-[#0f172b]">
                Preferences & Security
              </p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#eff6ff] text-xl text-[#94a3b8]">
              ›
            </span>
          </Link>

          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.6px] text-[#94a3b8]">
            Product Gym V2.4.0
          </p>
        </section>
      </MotionPage>
    </MobileScreen>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[12px] bg-[#eff6ff] px-2 py-2 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1 text-[#2563eb]">
        {icon}
      </div>
      <p className="text-[8px] font-black uppercase tracking-[0.7px] text-[#64748b]">
        {label}
      </p>
      <p className="mt-1 text-[18px] font-bold leading-none text-[#0f172b]">
        {value}
      </p>
    </article>
  );
}

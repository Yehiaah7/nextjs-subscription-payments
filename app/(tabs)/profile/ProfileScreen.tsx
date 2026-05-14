'use client';

import {
  ChangeEvent,
  PointerEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircleFilledIcon,
  FireFilledIcon,
  CrownFilledIcon,
  TrophyFilledIcon
} from '@/components/icons/FilledIcons';
import MobileScreen from '@/components/mobile/MobileScreen';
import { MotionCard } from '@/components/motion';
import MotionPage from '@/components/motion/MotionPage';
import ProGymPassCard from '@/components/ProGymPassCard';
import UserAvatar from '@/components/ui/UserAvatar';
import { cardInteractive } from '@/components/ui/interactive';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';
import { Camera, Minus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useUserAvatar } from '@/components/ui/UserAvatarContext';

type ProfileScreenProps = {
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const AVATAR_BUCKET = 'avatars';
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);
const AVATAR_UPDATE_SUCCESS_MESSAGE = 'Profile photo updated successfully';
const AVATAR_REMOVE_SUCCESS_MESSAGE = 'Profile photo removed successfully';
const AVATAR_EDITOR_SIZE = 240;
const CROPPED_AVATAR_SIZE = 512;
const MIN_AVATAR_ZOOM = 1;
const MAX_AVATAR_ZOOM = 4;

type AvatarEditorImage = {
  previewUrl: string;
  width: number;
  height: number;
};

type AvatarOffset = {
  x: number;
  y: number;
};

type AvatarStage =
  | 'file validation'
  | 'upload to Supabase Storage bucket avatars'
  | 'generate/read final file path or public URL'
  | 'update the user profile record with the avatar path/url'
  | 'refresh avatar UI';

type AvatarStageUserMessage =
  | 'invalid file type'
  | 'file too large'
  | 'storage upload failed'
  | 'avatar URL/path save failed'
  | 'success';

class AvatarStageError extends Error {
  constructor(
    readonly stage: AvatarStage,
    readonly userMessage: AvatarStageUserMessage,
    message: string
  ) {
    super(message);
    this.name = 'AvatarStageError';
  }
}

const logAvatarStage = (label: string, value: unknown) => {
  console.log(label, value);
};

async function loadEditableImage(
  file: File | Blob
): Promise<AvatarEditorImage> {
  const previewUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error('Could not load image for edit.'));
        img.src = previewUrl;
      }
    );

    return { previewUrl, ...dimensions };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

async function loadEditableImageFromUrl(
  imageUrl: string
): Promise<AvatarEditorImage> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error('Could not load current profile photo for editing.');
  }

  const blob = await response.blob();

  if (!blob.type.startsWith('image/')) {
    throw new Error('Current profile photo is not an editable image.');
  }

  return loadEditableImage(blob);
}

function getAvatarCoverScale(image: AvatarEditorImage, frameSize: number) {
  return Math.max(frameSize / image.width, frameSize / image.height);
}

function clampAvatarOffset(
  image: AvatarEditorImage,
  zoom: number,
  offset: AvatarOffset,
  frameSize = AVATAR_EDITOR_SIZE
): AvatarOffset {
  const coverScale = getAvatarCoverScale(image, frameSize);
  const displayWidth = image.width * coverScale * zoom;
  const displayHeight = image.height * coverScale * zoom;
  const maxX = Math.max(0, (displayWidth - frameSize) / 2);
  const maxY = Math.max(0, (displayHeight - frameSize) / 2);

  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y))
  };
}

async function generateCroppedAvatarBlob({
  image,
  zoom,
  offset
}: {
  image: AvatarEditorImage;
  zoom: number;
  offset: AvatarOffset;
}): Promise<Blob> {
  const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load edited avatar.'));
    img.src = image.previewUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = CROPPED_AVATAR_SIZE;
  canvas.height = CROPPED_AVATAR_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not process edited avatar.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, CROPPED_AVATAR_SIZE, CROPPED_AVATAR_SIZE);

  const coverScale = getAvatarCoverScale(image, AVATAR_EDITOR_SIZE);
  const outputScale = CROPPED_AVATAR_SIZE / AVATAR_EDITOR_SIZE;
  const drawWidth = image.width * coverScale * zoom * outputScale;
  const drawHeight = image.height * coverScale * zoom * outputScale;
  const drawX =
    CROPPED_AVATAR_SIZE / 2 + offset.x * outputScale - drawWidth / 2;
  const drawY =
    CROPPED_AVATAR_SIZE / 2 + offset.y * outputScale - drawHeight / 2;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(loadedImage, drawX, drawY, drawWidth, drawHeight);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not process edited avatar.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      0.9
    );
  });
}

function extractAvatarLocationFromPublicUrl(
  url: string
): { bucket: string; path: string } | null {
  try {
    const parsedUrl = new URL(url);
    const matches = parsedUrl.pathname.match(
      /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
    );
    if (!matches) {
      return null;
    }

    return {
      bucket: decodeURIComponent(matches[1]),
      path: decodeURIComponent(matches[2])
    };
  } catch {
    return null;
  }
}

export default function ProfileScreen({
  email,
  fullName,
  firstName,
  lastName,
  avatarUrl
}: ProfileScreenProps) {
  const router = useRouter();
  const { avatar, setAvatarImageUrl } = useUserAvatar();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [editorImage, setEditorImage] = useState<AvatarEditorImage | null>(
    null
  );
  const [avatarZoom, setAvatarZoom] = useState(MIN_AVATAR_ZOOM);
  const [avatarOffset, setAvatarOffset] = useState<AvatarOffset>({
    x: 0,
    y: 0
  });
  const [isPreparingEditor, setIsPreparingEditor] = useState(false);
  const [isPhotoActionsOpen, setIsPhotoActionsOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const avatarUploadInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const currentAvatarUrl = avatar.imageUrl ?? null;
  const isAvatarActionPending =
    isUploading || isPreparingEditor || isRemovingAvatar;

  useEffect(() => {
    return () => {
      if (editorImage) {
        URL.revokeObjectURL(editorImage.previewUrl);
      }
    };
  }, [editorImage]);

  const closeAvatarEditor = () => {
    if (editorImage) {
      URL.revokeObjectURL(editorImage.previewUrl);
    }

    setEditorImage(null);
    setAvatarZoom(MIN_AVATAR_ZOOM);
    setAvatarOffset({ x: 0, y: 0 });
  };

  const openAvatarFilePicker = () => {
    if (isAvatarActionPending) {
      return;
    }

    avatarUploadInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    logAvatarStage('file name', file.name);
    logAvatarStage('file type', file.type);
    logAvatarStage('file size', file.size);

    setUploadError(null);
    setUploadSuccess(null);

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      logAvatarStage('validation passed', false);
      setUploadError('invalid file type');
      return;
    }

    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      logAvatarStage('validation passed', false);
      setUploadError('file too large');
      return;
    }

    logAvatarStage('validation passed', true);

    try {
      setIsPhotoActionsOpen(false);
      setIsPreparingEditor(true);
      const editableImage = await loadEditableImage(file);
      closeAvatarEditor();
      setEditorImage(editableImage);
      setAvatarZoom(MIN_AVATAR_ZOOM);
      setAvatarOffset({ x: 0, y: 0 });
    } catch (error) {
      setUploadError('invalid file type');
      console.error('avatar edit preparation failure', error);
    } finally {
      setIsPreparingEditor(false);
    }
  };

  const handleAvatarApply = async () => {
    if (!editorImage) {
      return;
    }

    let nextAvatarPath: string | null = null;

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const croppedAvatarBlob = await generateCroppedAvatarBlob({
        image: editorImage,
        zoom: avatarZoom,
        offset: clampAvatarOffset(editorImage, avatarZoom, avatarOffset)
      });

      if (croppedAvatarBlob.size > MAX_UPLOAD_BYTES) {
        throw new AvatarStageError(
          'file validation',
          'file too large',
          'Edited avatar exceeded the 4MB upload limit.'
        );
      }
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AvatarStageError(
          'update the user profile record with the avatar path/url',
          'avatar URL/path save failed',
          'No authenticated user was available for avatar profile update.'
        );
      }

      nextAvatarPath = `${user.id}/${crypto.randomUUID()}.jpg`;
      logAvatarStage('upload started', {
        bucket: AVATAR_BUCKET,
        path: nextAvatarPath
      });
      const uploadResponse = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(nextAvatarPath, croppedAvatarBlob, {
          cacheControl: '31536000',
          contentType: 'image/jpeg',
          upsert: false
        });
      logAvatarStage('raw upload response', uploadResponse);
      logAvatarStage('raw upload error', uploadResponse.error);

      if (uploadResponse.error) {
        throw new AvatarStageError(
          'upload to Supabase Storage bucket avatars',
          'storage upload failed',
          uploadResponse.error.message
        );
      }

      const storedFilePath = uploadResponse.data?.path ?? nextAvatarPath;
      logAvatarStage('stored file path', storedFilePath);

      const publicUrlResult = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(storedFilePath);
      logAvatarStage('public URL result', publicUrlResult);
      const nextAvatarUrl = publicUrlResult.data.publicUrl;

      if (!nextAvatarUrl) {
        throw new AvatarStageError(
          'generate/read final file path or public URL',
          'storage upload failed',
          'Supabase Storage did not return a public URL for the uploaded avatar.'
        );
      }

      logAvatarStage('profile update started', {
        table: 'profiles',
        id: user.id,
        avatar_url: nextAvatarUrl
      });
      const profileUpdateResponse = await (supabase as any)
        .from('profiles')
        .upsert(
          { id: user.id, avatar_url: nextAvatarUrl },
          { onConflict: 'id' }
        )
        .select('avatar_url')
        .maybeSingle();
      logAvatarStage('raw profile update response', profileUpdateResponse);
      logAvatarStage('raw profile update error', profileUpdateResponse.error);

      if (profileUpdateResponse.error) {
        throw new AvatarStageError(
          'update the user profile record with the avatar path/url',
          'avatar URL/path save failed',
          profileUpdateResponse.error.message
        );
      }

      const previousAvatarLocation = extractAvatarLocationFromPublicUrl(
        avatar.imageUrl ?? avatarUrl ?? ''
      );
      if (
        previousAvatarLocation?.bucket === AVATAR_BUCKET &&
        previousAvatarLocation.path !== storedFilePath &&
        previousAvatarLocation.path.startsWith(`${user.id}/`)
      ) {
        await supabase.storage
          .from(AVATAR_BUCKET)
          .remove([previousAvatarLocation.path]);
      }

      closeAvatarEditor();
      setAvatarImageUrl(nextAvatarUrl);
      setUploadSuccess(AVATAR_UPDATE_SUCCESS_MESSAGE);
      router.refresh();
      logAvatarStage('avatar refresh completed', {
        profilePage: true,
        homeUserThumbnail: true,
        profileTabThumbnail: true,
        avatar_url: nextAvatarUrl
      });
    } catch (error) {
      if (nextAvatarPath) {
        await supabase.storage.from(AVATAR_BUCKET).remove([nextAvatarPath]);
      }

      setUploadSuccess(null);
      setUploadError(
        error instanceof AvatarStageError
          ? error.userMessage
          : 'avatar URL/path save failed'
      );
      console.error('avatar upload stage failure', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarEditCurrent = async () => {
    if (!currentAvatarUrl) {
      setUploadError('Choose a photo before editing it.');
      setUploadSuccess(null);
      return;
    }

    try {
      setIsPhotoActionsOpen(false);
      setIsPreparingEditor(true);
      setUploadError(null);
      setUploadSuccess(null);
      const editableImage = await loadEditableImageFromUrl(currentAvatarUrl);
      closeAvatarEditor();
      setEditorImage(editableImage);
      setAvatarZoom(MIN_AVATAR_ZOOM);
      setAvatarOffset({ x: 0, y: 0 });
    } catch (error) {
      setUploadError('Could not open current profile photo for editing.');
      console.error('avatar current edit preparation failure', error);
    } finally {
      setIsPreparingEditor(false);
    }
  };

  const handleAvatarRemove = async () => {
    const avatarUrlToRemove = currentAvatarUrl;

    if (!avatarUrlToRemove) {
      setUploadSuccess(null);
      setUploadError('There is no profile photo to remove.');
      return;
    }

    try {
      setIsPhotoActionsOpen(false);
      setIsRemoveConfirmOpen(false);
      setIsRemovingAvatar(true);
      setUploadError(null);
      setUploadSuccess(null);
      closeAvatarEditor();

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AvatarStageError(
          'update the user profile record with the avatar path/url',
          'avatar URL/path save failed',
          'No authenticated user was available for avatar removal.'
        );
      }

      logAvatarStage('profile avatar removal started', {
        table: 'profiles',
        id: user.id,
        avatar_url: null
      });
      const profileUpdateResponse = await (supabase as any)
        .from('profiles')
        .upsert({ id: user.id, avatar_url: null }, { onConflict: 'id' })
        .select('avatar_url')
        .maybeSingle();
      logAvatarStage(
        'raw profile avatar removal response',
        profileUpdateResponse
      );
      logAvatarStage(
        'raw profile avatar removal error',
        profileUpdateResponse.error
      );

      if (profileUpdateResponse.error) {
        throw new AvatarStageError(
          'update the user profile record with the avatar path/url',
          'avatar URL/path save failed',
          profileUpdateResponse.error.message
        );
      }

      const previousAvatarLocation =
        extractAvatarLocationFromPublicUrl(avatarUrlToRemove);
      if (
        previousAvatarLocation?.bucket === AVATAR_BUCKET &&
        previousAvatarLocation.path.startsWith(`${user.id}/`)
      ) {
        const removeResponse = await supabase.storage
          .from(AVATAR_BUCKET)
          .remove([previousAvatarLocation.path]);
        logAvatarStage('raw avatar storage removal response', removeResponse);
        logAvatarStage(
          'raw avatar storage removal error',
          removeResponse.error
        );

        if (removeResponse.error) {
          setUploadError(
            'Profile photo was removed, but old file cleanup failed.'
          );
          console.error('avatar storage cleanup failure', removeResponse.error);
        }
      }

      setAvatarImageUrl(null);
      setUploadSuccess(AVATAR_REMOVE_SUCCESS_MESSAGE);
      router.refresh();
      logAvatarStage('avatar removal refresh completed', {
        profilePage: true,
        homeUserThumbnail: true,
        profileTabThumbnail: true,
        avatar_url: null
      });
    } catch (error) {
      setUploadSuccess(null);
      setUploadError(
        error instanceof AvatarStageError
          ? error.userMessage
          : 'avatar URL/path save failed'
      );
      console.error('avatar removal stage failure', error);
    } finally {
      setIsRemovingAvatar(false);
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

          <MotionCard
            className={cn('app-card border', cardInteractive)}
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#dbeafe'
            }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <UserAvatar
                  imageUrl={currentAvatarUrl}
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

                <div className="absolute -bottom-1 -right-1">
                  <ProfilePhotoActionTrigger
                    isOpen={isPhotoActionsOpen}
                    disabled={isAvatarActionPending}
                    onClick={() => setIsPhotoActionsOpen(true)}
                  />
                </div>

                <input
                  ref={avatarUploadInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={isAvatarActionPending}
                />
              </div>

              <p className="mt-4 text-center text-[16px] font-bold tracking-[-0.3px] text-[#0f172b]">
                {fullName}
              </p>
              <p className="mt-1 text-[10px] font-black tracking-[0.04em] text-[#2563eb]">
                Product Gym member
              </p>
              {isAvatarActionPending ? (
                <p className="mt-2 text-center text-[10px] font-semibold text-slate-500">
                  {isRemovingAvatar
                    ? 'Removing avatar...'
                    : isPreparingEditor
                      ? 'Preparing avatar editor...'
                      : 'Uploading avatar...'}
                </p>
              ) : null}
              {uploadSuccess ? (
                <p className="mt-1 text-center text-[10px] font-semibold text-emerald-600">
                  {uploadSuccess}
                </p>
              ) : null}
              {uploadError ? (
                <p className="mt-1 text-center text-[10px] font-semibold text-rose-600">
                  {uploadError}
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <StatCard
                icon={
                  <TrophyFilledIcon className="h-3.5 w-3.5 text-[#eab308]" />
                }
                label="Rank"
                value="#12"
              />
              <StatCard
                icon={
                  <CheckCircleFilledIcon className="h-3.5 w-3.5 text-[#22c55e]" />
                }
                label="Solved"
                value="42"
              />
              <StatCard
                icon={
                  <FireFilledIcon className="h-3.5 w-3.5 text-orange-500" />
                }
                label="Solving Days"
                value="32"
              />
            </div>
          </MotionCard>

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

        {isPhotoActionsOpen ? (
          <ProfilePhotoActionsModal
            hasCurrentAvatar={Boolean(currentAvatarUrl)}
            isActionPending={isAvatarActionPending}
            onClose={() => setIsPhotoActionsOpen(false)}
            onChangePhoto={() => {
              setIsPhotoActionsOpen(false);
              openAvatarFilePicker();
            }}
            onEditPhoto={handleAvatarEditCurrent}
            onRemovePhoto={() => {
              setIsPhotoActionsOpen(false);
              setIsRemoveConfirmOpen(true);
            }}
          />
        ) : null}
        {isRemoveConfirmOpen ? (
          <RemoveProfilePhotoConfirmModal
            isRemoving={isRemovingAvatar}
            onCancel={() => setIsRemoveConfirmOpen(false)}
            onConfirm={handleAvatarRemove}
          />
        ) : null}
        {editorImage ? (
          <AvatarEditorModal
            image={editorImage}
            zoom={avatarZoom}
            offset={avatarOffset}
            isSaving={isUploading}
            onCancel={closeAvatarEditor}
            onApply={handleAvatarApply}
            onZoomChange={(nextZoom) => {
              const clampedZoom = Math.min(
                MAX_AVATAR_ZOOM,
                Math.max(MIN_AVATAR_ZOOM, nextZoom)
              );
              setAvatarZoom(clampedZoom);
              setAvatarOffset((currentOffset) =>
                clampAvatarOffset(editorImage, clampedZoom, currentOffset)
              );
            }}
            onOffsetChange={(nextOffset) =>
              setAvatarOffset(
                clampAvatarOffset(editorImage, avatarZoom, nextOffset)
              )
            }
          />
        ) : null}
      </MotionPage>
    </MobileScreen>
  );
}

function ProfilePhotoActionsModal({
  hasCurrentAvatar,
  isActionPending,
  onClose,
  onChangePhoto,
  onEditPhoto,
  onRemovePhoto
}: {
  hasCurrentAvatar: boolean;
  isActionPending: boolean;
  onClose: () => void;
  onChangePhoto: () => void;
  onEditPhoto: () => void;
  onRemovePhoto: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-10">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close profile photo actions"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-photo-actions-title"
        className="relative w-full max-w-[320px] rounded-[24px] bg-white p-5 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2
              id="profile-photo-actions-title"
              className="text-[18px] font-bold leading-6 tracking-[-0.4px] text-[#0f172b]"
            >
              Profile photo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isActionPending}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 disabled:opacity-50"
            aria-label="Close profile photo actions"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onChangePhoto}
            disabled={isActionPending}
            className="flex h-12 w-full items-center gap-3 rounded-[14px] bg-[#eff6ff] px-4 text-left text-[13px] font-bold text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            Change photo
          </button>
          <button
            type="button"
            onClick={onEditPhoto}
            disabled={!hasCurrentAvatar || isActionPending}
            className="flex h-12 w-full items-center gap-3 rounded-[14px] bg-slate-50 px-4 text-left text-[13px] font-bold text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Edit photo
          </button>
          <button
            type="button"
            onClick={onRemovePhoto}
            disabled={!hasCurrentAvatar || isActionPending}
            className="flex h-12 w-full items-center gap-3 rounded-[14px] bg-rose-50 px-4 text-left text-[13px] font-bold text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove photo
          </button>
        </div>
      </div>
    </div>
  );
}

function RemoveProfilePhotoConfirmModal({
  isRemoving,
  onCancel,
  onConfirm
}: {
  isRemoving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (isRemoving) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isRemoving, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-10">
      <button
        type="button"
        className="absolute inset-0 cursor-default disabled:cursor-wait"
        aria-label="Cancel profile photo removal"
        onClick={onCancel}
        disabled={isRemoving}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="remove-profile-photo-title"
        aria-describedby="remove-profile-photo-description"
        className="relative w-full max-w-[320px] rounded-[24px] bg-white p-4 shadow-2xl"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="remove-profile-photo-title"
              className="text-[18px] font-bold tracking-[-0.4px] text-[#0f172b]"
            >
              Remove profile photo?
            </h2>
            <p
              id="remove-profile-photo-description"
              className="mt-1 text-[12px] font-semibold leading-5 text-slate-500"
            >
              Are you sure you want to remove your profile photo?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRemoving}
            className="h-11 rounded-[14px] border border-slate-200 bg-white text-[13px] font-bold text-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="h-11 rounded-[14px] bg-rose-600 text-[13px] font-bold text-white shadow-sm disabled:opacity-60"
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePhotoActionTrigger({
  isOpen,
  disabled,
  onClick
}: {
  isOpen: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Open profile photo actions"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className="grid h-8 w-8 place-items-center rounded-full border border-[#bfdbfe] bg-white text-[#2563eb] shadow-md transition hover:bg-[#eff6ff] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Camera className="h-4 w-4" />
    </button>
  );
}

function AvatarEditorModal({
  image,
  zoom,
  offset,
  isSaving,
  onCancel,
  onApply,
  onZoomChange,
  onOffsetChange
}: {
  image: AvatarEditorImage;
  zoom: number;
  offset: AvatarOffset;
  isSaving: boolean;
  onCancel: () => void;
  onApply: () => void;
  onZoomChange: (zoom: number) => void;
  onOffsetChange: (offset: AvatarOffset) => void;
}) {
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offset: AvatarOffset;
  } | null>(null);
  const coverScale = getAvatarCoverScale(image, AVATAR_EDITOR_SIZE);
  const displayWidth = image.width * coverScale * zoom;
  const displayHeight = image.height * coverScale * zoom;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isSaving) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offset
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    onOffsetChange({
      x: dragStart.offset.x + event.clientX - dragStart.startX,
      y: dragStart.offset.y + event.clientY - dragStart.startY
    });
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current?.pointerId === event.pointerId) {
      dragStartRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 pb-4 pt-10 sm:items-center">
      <div
        className="w-full max-w-[361px] rounded-[24px] bg-white p-4 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-editor-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="avatar-editor-title"
              className="text-[18px] font-bold tracking-[-0.4px] text-[#0f172b]"
            >
              Adjust profile photo
            </h2>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              Drag to position your photo and zoom until it fits the circular
              avatar.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 disabled:opacity-50"
            aria-label="Cancel avatar edit"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div
            className="relative overflow-hidden rounded-full bg-slate-100 shadow-inner ring-4 ring-white outline outline-1 outline-slate-200 touch-none cursor-grab active:cursor-grabbing"
            style={{ width: AVATAR_EDITOR_SIZE, height: AVATAR_EDITOR_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <img
              src={image.previewUrl}
              alt="Selected avatar preview"
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: displayWidth,
                height: displayHeight,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`
              }}
            />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.7px] text-slate-400">
            Final circular preview
          </p>
        </div>

        <div className="mt-5 rounded-[16px] bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Minus className="h-4 w-4 text-slate-400" />
            <input
              type="range"
              min={MIN_AVATAR_ZOOM}
              max={MAX_AVATAR_ZOOM}
              step="0.01"
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              disabled={isSaving}
              className="h-2 flex-1 accent-rose-600"
              aria-label="Zoom profile photo"
            />
            <Plus className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="h-11 rounded-[14px] border border-slate-200 bg-white text-[13px] font-bold text-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={isSaving}
            className="h-11 rounded-[14px] bg-[#2563eb] text-[13px] font-bold text-white shadow-sm disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save photo'}
          </button>
        </div>
      </div>
    </div>
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
    <article className="rounded-xl bg-[#eff6ff] px-2 py-2 text-center">
      <div className="mb-1 inline-flex items-center justify-center rounded-full bg-white p-1">
        {icon}
      </div>
      <p className="text-[9px] font-black tracking-[0.04em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-1 text-[20px] font-bold leading-none text-[#0f172a]">
        {value}
      </p>
    </article>
  );
}

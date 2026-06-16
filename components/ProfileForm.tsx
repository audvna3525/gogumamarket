"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  User,
  FileText,
  ImagePlus,
  Loader2,
  Trash2,
  AlertCircle,
  Save,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ProfileInit = {
  nickname: string;
  bio: string | null;
  avatar_url: string | null;
};

/** 내 프로필 편집 폼 */
export default function ProfileForm({
  userId,
  profile,
}: {
  userId: string;
  profile: ProfileInit;
}) {
  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfile, {});

  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatar_url ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    if (!ALLOWED.includes(file.type)) {
      setImageError("JPG·PNG·WEBP·GIF 형식의 이미지만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setImageError("사진 용량은 5MB 이하만 올릴 수 있어요.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // 내 폴더(userId) 안에 저장합니다. (보안 규칙이 본인 폴더만 허용)
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setImageError("사진 올리기에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      setAvatarUrl(publicUrl);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 올린 사진 주소를 함께 서버로 보냅니다. (사진 없으면 빈 값) */}
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />

      {/* 프로필 사진 */}
      <div className="flex flex-col items-center gap-3">
        <Avatar url={avatarUrl} name={nickname} size={96} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {uploading ? "올리는 중…" : "사진 바꾸기"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              사진 빼기
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        {imageError && (
          <p className="flex items-start gap-2 text-xs font-medium text-red-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {imageError}
          </p>
        )}
      </div>

      {/* 닉네임 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">닉네임</span>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            name="nickname"
            required
            maxLength={30}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예) 고구마러버"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
        </div>
      </label>

      {/* 자기소개 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">
          자기소개{" "}
          <span className="font-normal text-ink-500">(선택)</span>
        </span>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-ink-500" />
          <textarea
            name="bio"
            maxLength={300}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="이웃들에게 나를 소개해 보세요. (예: 안 쓰는 물건 나눔 좋아해요!)"
            className="w-full resize-y rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
        </div>
        <span className="self-end text-xs text-ink-500">{bio.length}/300</span>
      </label>

      {state.error && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-goguma-500 py-3.5 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {isPending ? "저장 중…" : "프로필 저장"}
        </button>
        <Link
          href={`/users/${userId}`}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3.5 font-bold text-ink-700 transition hover:bg-gray-50"
        >
          취소
        </Link>
      </div>
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const AVATAR_BUCKET = "avatars";

export type ProfileFormState = { error?: string };

/** 사진 공개 주소에서 저장소 경로만 뽑아냅니다. 우리 버킷이 아니면 null. */
function avatarPathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const path = url.slice(at + marker.length).split("?")[0];
  return path || null;
}

/** 저장소에서 프로필 사진 파일 하나를 조용히 지웁니다. (실패해도 막지 않음) */
async function removeAvatarFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null,
) {
  const path = avatarPathFromUrl(url);
  if (!path) return;
  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}

/** 내 프로필(닉네임 · 자기소개 · 사진) 저장 — 끝나면 내 프로필 페이지로 이동 */
export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다. 다시 로그인한 뒤 시도해 주세요." };
  }

  const nickname = String(formData.get("nickname") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarRaw = String(formData.get("avatar_url") ?? "").trim();

  if (!nickname) return { error: "닉네임을 입력해 주세요." };
  if (nickname.length > 30) {
    return { error: "닉네임은 30자 이내로 입력해 주세요." };
  }
  if (bio.length > 300) {
    return { error: "자기소개는 300자 이내로 입력해 주세요." };
  }

  // 사진은 선택 사항. 값이 있으면 우리 avatars 버킷 주소가 맞는지 확인합니다.
  let avatar_url: string | null = null;
  if (avatarRaw) {
    if (!avatarPathFromUrl(avatarRaw)) {
      return { error: "사진 주소가 올바르지 않습니다. 사진을 다시 올려 주세요." };
    }
    avatar_url = avatarRaw;
  }

  // 바뀌기 전 사진 주소를 알아 둡니다. (사진이 바뀌면 옛 파일 정리)
  const { data: before } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // 프로필은 가입 시 자동 생성되지만, 혹시 없을 경우까지 대비해 upsert 사용.
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    nickname,
    bio: bio || null,
    avatar_url,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." };
  }

  if (before?.avatar_url && before.avatar_url !== avatar_url) {
    await removeAvatarFile(supabase, before.avatar_url);
  }

  // 닉네임·사진이 곳곳(글·댓글·프로필)에 보이므로 넉넉히 새로고침합니다.
  revalidatePath("/", "layout");
  redirect(`/users/${user.id}`);
}

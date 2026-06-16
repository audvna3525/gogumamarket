"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LikeResult =
  | { ok: true; liked: boolean; count: number }
  | { ok: false; error: string };

/** 현재 글의 좋아요 개수를 셉니다. */
async function countLikes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: number,
): Promise<number> {
  const { count } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  return count ?? 0;
}

/**
 * 좋아요 누르기/취소하기 (토글).
 * 이미 눌렀으면 취소하고, 안 눌렀으면 새로 누릅니다. 로그인한 회원만 가능합니다.
 */
export async function toggleLike(productId: number): Promise<LikeResult> {
  if (!Number.isInteger(productId)) {
    return { ok: false, error: "잘못된 접근입니다." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "좋아요는 로그인 후 누를 수 있어요." };
  }

  // 내가 이 글에 이미 좋아요를 눌렀는지 확인합니다.
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // 이미 눌렀으면 취소
    const { error } = await supabase.from("likes").delete().eq("id", existing.id);
    if (error) {
      return { ok: false, error: "잠시 후 다시 시도해 주세요." };
    }
    revalidatePath(`/products/${productId}`);
    return { ok: true, liked: false, count: await countLikes(supabase, productId) };
  }

  // 안 눌렀으면 새로 추가
  const { error } = await supabase
    .from("likes")
    .insert({ product_id: productId, user_id: user.id });
  if (error) {
    return { ok: false, error: "잠시 후 다시 시도해 주세요." };
  }
  revalidatePath(`/products/${productId}`);
  return { ok: true, liked: true, count: await countLikes(supabase, productId) };
}

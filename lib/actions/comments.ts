"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CommentState = { error?: string; ok?: boolean };

const MAX_LEN = 1000;

/** 폼에서 글 번호를 안전하게 꺼냅니다. */
function readProductId(formData: FormData): number | null {
  const n = Number(formData.get("product_id"));
  return Number.isInteger(n) ? n : null;
}

/**
 * 댓글/대댓글 작성.
 *  · parent_id 가 없으면 일반 댓글 (로그인한 누구나)
 *  · parent_id 가 있으면 대댓글 (그 상품을 올린 판매자만)
 * 작성자·권한 검사는 창고 보안 규칙(RLS)과 트리거가 한 번 더 막아 줍니다.
 */
export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "댓글은 로그인 후 작성할 수 있어요." };
  }

  const productId = readProductId(formData);
  if (productId === null) {
    return { error: "잘못된 접근입니다." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "내용을 입력해 주세요." };
  if (body.length > MAX_LEN) {
    return { error: `댓글은 ${MAX_LEN}자 이내로 입력해 주세요.` };
  }

  // 대댓글이면 부모 댓글 번호가 함께 옵니다.
  const parentRaw = formData.get("parent_id");
  let parentId: number | null = null;
  if (parentRaw != null && String(parentRaw).trim() !== "") {
    const p = Number(parentRaw);
    if (!Number.isInteger(p)) return { error: "잘못된 접근입니다." };
    parentId = p;
  }

  // 대댓글은 판매자만 — UI에서도 막지만, 서버에서 한 번 더 확인합니다.
  if (parentId !== null) {
    const { data: product } = await supabase
      .from("products")
      .select("user_id")
      .eq("id", productId)
      .maybeSingle();
    if (!product || product.user_id !== user.id) {
      return { error: "답글(대댓글)은 판매자만 달 수 있어요." };
    }
  }

  const { error } = await supabase.from("comments").insert({
    product_id: productId,
    user_id: user.id,
    parent_id: parentId,
    body,
  });
  if (error) {
    return { error: "저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath(`/products/${productId}`);
  return { ok: true };
}

/** 댓글 수정 — 본인이 쓴 댓글만 (RLS가 한 번 더 강제). */
export async function updateComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const productId = readProductId(formData);
  const id = Number(formData.get("id"));
  if (productId === null || !Number.isInteger(id)) {
    return { error: "잘못된 접근입니다." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "내용을 입력해 주세요." };
  if (body.length > MAX_LEN) {
    return { error: `댓글은 ${MAX_LEN}자 이내로 입력해 주세요.` };
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: "수정 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." };
  }
  if (!data) {
    return { error: "내가 쓴 댓글만 수정할 수 있어요." };
  }

  revalidatePath(`/products/${productId}`);
  return { ok: true };
}

/** 댓글 삭제 — 본인이 쓴 댓글만. 폼에서 직접 호출합니다. */
export async function deleteComment(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const productId = readProductId(formData);
  const id = Number(formData.get("id"));
  if (productId === null || !Number.isInteger(id)) return;

  // RLS가 본인 댓글만 지우도록 강제합니다. user_id 조건은 추가 안전장치.
  // (부모 댓글을 지우면 딸린 대댓글도 함께 사라집니다 — on delete cascade)
  await supabase.from("comments").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath(`/products/${productId}`);
}

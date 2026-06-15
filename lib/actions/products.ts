"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/categories";

export type ProductFormState = {
  error?: string;
  success?: { id: number; title: string };
};

type ProductValues = {
  title: string;
  category: string;
  price: number;
  description: string;
};

/** 폼 입력값을 꺼내 검사합니다. 문제가 있으면 error, 정상이면 values를 돌려줍니다. */
function readAndValidate(
  formData: FormData,
): { error: string } | { values: ProductValues } {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceDigits = String(formData.get("price") ?? "").replace(/[^0-9]/g, "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: "제목을 입력해 주세요." };
  if (title.length > 100) return { error: "제목은 100자 이내로 입력해 주세요." };
  if (
    !category ||
    !CATEGORIES.includes(category as (typeof CATEGORIES)[number])
  ) {
    return { error: "카테고리를 선택해 주세요." };
  }
  if (priceDigits === "") {
    return { error: "가격을 입력해 주세요. (무료 나눔이면 0을 입력)" };
  }
  const price = Number(priceDigits);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "가격이 올바르지 않습니다." };
  }
  if (price > 2_000_000_000) {
    return { error: "가격이 너무 큽니다. 다시 확인해 주세요." };
  }
  if (!description) return { error: "상품 설명을 입력해 주세요." };
  if (description.length > 2000) {
    return { error: "상품 설명은 2000자 이내로 입력해 주세요." };
  }

  return { values: { title, category, price, description } };
}

/** 판매글(상품) 등록 */
export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supabase = await createClient();

  // 로그인 확인 — 서버 액션은 UI 밖에서도 호출될 수 있으므로 반드시 직접 검사합니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다. 다시 로그인한 뒤 등록해 주세요." };
  }

  const checked = readAndValidate(formData);
  if ("error" in checked) return { error: checked.error };
  const { title, category, price, description } = checked.values;

  const { data, error } = await supabase
    .from("products")
    .insert({ user_id: user.id, title, price, category, description })
    .select("id, title")
    .single();

  if (error) {
    return { error: "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/");
  revalidatePath("/products");

  return { success: { id: data.id, title: data.title } };
}

/** 판매글 수정 — 성공하면 그 글의 상세 페이지로 이동합니다. */
export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다. 다시 로그인한 뒤 수정해 주세요." };
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { error: "잘못된 접근입니다." };
  }

  const checked = readAndValidate(formData);
  if ("error" in checked) return { error: checked.error };
  const { title, category, price, description } = checked.values;

  // user_id 조건은 RLS와 별개로 한 번 더 거는 안전장치입니다.
  // (RLS 덕분에 남의 글이면 어차피 0건만 처리됩니다.)
  const { data, error } = await supabase
    .from("products")
    .update({ title, price, category, description })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: "수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (!data) {
    return { error: "내 판매글만 수정할 수 있어요." };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

/** 판매글 삭제 — 성공하면 목록으로 이동합니다. (폼에서 직접 호출) */
export async function deleteProduct(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    redirect("/products");
  }

  // RLS가 본인 글만 지우도록 강제합니다. user_id 조건은 추가 안전장치.
  await supabase.from("products").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/products");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

/** Supabase 영문 에러 메시지를 사용자 친화적인 한국어로 변환 */
function toKorean(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  if (m.includes("password should be at least"))
    return "비밀번호는 최소 6자 이상이어야 합니다.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "이메일 형식이 올바르지 않습니다.";
  if (m.includes("email not confirmed"))
    return "이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  return message;
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: toKorean(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 최소 6자 이상이어야 합니다." };
  }
  if (password !== confirm) {
    return { error: "비밀번호 확인이 일치하지 않습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: toKorean(error.message) };
  }

  // 이메일 인증이 꺼져 있으면 가입과 동시에 세션이 생겨 바로 로그인됩니다.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  // 이메일 인증이 켜져 있으면 확인 메일 안내를 보여줍니다.
  return {
    message:
      "가입 확인 메일을 보냈어요. 메일함에서 인증한 뒤 로그인해 주세요.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { AuthState } from "@/lib/actions/auth";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

export default function AuthForm({ mode, action }: Props) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const [showPw, setShowPw] = useState(false);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* 이메일 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">이메일</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="goguma@example.com"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
        </div>
      </label>

      {/* 비밀번호 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">비밀번호</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <input
            type={showPw ? "text" : "password"}
            name="password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder={isLogin ? "비밀번호 입력" : "6자 이상 입력"}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
          >
            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </label>

      {/* 비밀번호 확인 (회원가입에만) */}
      {!isLogin && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-700">
            비밀번호 확인
          </span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
            <input
              type={showPw ? "text" : "password"}
              name="confirm"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="비밀번호 다시 입력"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
            />
          </div>
        </label>
      )}

      {/* 에러 / 안내 메시지 */}
      {state.error && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="flex items-start gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-goguma-500 py-3 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLogin ? (
          <LogIn className="h-5 w-5" />
        ) : (
          <UserPlus className="h-5 w-5" />
        )}
        {isPending
          ? "처리 중…"
          : isLogin
            ? "로그인"
            : "가입하기"}
      </button>

      {/* 전환 링크 */}
      <p className="text-center text-sm text-ink-500">
        {isLogin ? (
          <>
            아직 회원이 아니신가요?{" "}
            <Link
              href="/signup"
              className="font-semibold text-goguma-600 hover:underline"
            >
              회원가입
            </Link>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold text-goguma-600 hover:underline"
            >
              로그인
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

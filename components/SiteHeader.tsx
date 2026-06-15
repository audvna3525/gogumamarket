import Link from "next/link";
import { Store, PackagePlus, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { logout } from "@/lib/actions/auth";

/** 사이트 공통 상단 헤더 (둘러보기 / 판매하기 / 로그인·로그아웃) */
export default function SiteHeader({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-gray-50"
          >
            <Store className="h-4 w-4" />
            둘러보기
          </Link>

          {userEmail ? (
            <>
              <span className="hidden text-sm text-ink-500 sm:inline">
                <span className="font-semibold text-ink-700">{userEmail}</span>{" "}
                님
              </span>
              <Link
                href="/sell"
                className="inline-flex items-center gap-1.5 rounded-lg bg-goguma-500 px-3.5 py-2 text-sm font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
              >
                <PackagePlus className="h-4 w-4" />
                판매하기
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-gray-50"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-goguma-500 px-3.5 py-2 text-sm font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

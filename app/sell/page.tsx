import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import SellForm from "@/components/SellForm";
import { createClient } from "@/lib/supabase/server";

export default async function SellPage() {
  // 로그인한 사람만 글을 쓸 수 있습니다. 아니면 로그인 화면으로 보냅니다.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-ink-900">
            내 물건 팔기 🍠
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            우리 동네 이웃에게 판매글을 올려 보세요.
          </p>
        </div>

        <SellForm />
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 text-center text-sm text-ink-500">
          🍠 고구마마켓 · 개발 학습용 프로젝트
        </div>
      </footer>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, PackageOpen } from "lucide-react";
import Logo from "@/components/Logo";
import SellForm from "@/components/SellForm";
import { createClient } from "@/lib/supabase/server";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 로그인한 사람만 수정 화면에 들어올 수 있습니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const numericId = Number(id);
  const product = Number.isInteger(numericId)
    ? (
        await supabase
          .from("products")
          .select("id, user_id, title, price, category, description, image_url")
          .eq("id", numericId)
          .maybeSingle()
      ).data
    : null;

  // 글이 없으면 안내
  if (!product) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
        <PackageOpen className="h-12 w-12 text-goguma-500" />
        <h1 className="text-xl font-extrabold text-ink-900">
          글을 찾을 수 없어요
        </h1>
        <Link
          href="/products"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-goguma-500 px-5 py-3 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
        >
          목록으로 돌아가기
        </Link>
      </main>
    );
  }

  // 남의 글은 수정 화면에 못 들어옵니다. (창고 RLS와 별개로 화면에서도 차단)
  if (product.user_id !== user.id) {
    redirect(`/products/${product.id}`);
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Logo />
          <Link
            href={`/products/${product.id}`}
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
            판매글 수정 ✏️
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            내용을 고친 뒤 “수정 완료”를 눌러 주세요.
          </p>
        </div>

        <SellForm
          userId={user.id}
          product={{
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
            description: product.description,
            image_url: product.image_url,
          }}
        />
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 text-center text-sm text-ink-500">
          🍠 고구마마켓 · 개발 학습용 프로젝트
        </div>
      </footer>
    </>
  );
}

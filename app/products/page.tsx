import Link from "next/link";
import { PackageOpen, PackagePlus, AlertCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProductCard, { type ProductListItem } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();

  // 누가 보고 있는지(헤더 메뉴 표시용)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 판매글을 최신순으로 불러옵니다.
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, price, category, status, created_at, image_url")
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader userEmail={user?.email} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">
              동네 상품 둘러보기 🍠
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              우리 동네 이웃들이 올린 판매글이에요.
            </p>
          </div>
          {user && (
            <Link
              href="/sell"
              className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-goguma-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600 sm:inline-flex"
            >
              <PackagePlus className="h-4 w-4" />
              판매글 쓰기
            </Link>
          )}
        </div>

        {/* 불러오기 실패 */}
        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {/* 글이 하나도 없을 때 */}
        {!error && (!products || products.length === 0) && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-goguma-200 bg-goguma-50/60 px-6 py-16 text-center">
            <PackageOpen className="h-10 w-10 text-goguma-500" />
            <h2 className="text-lg font-extrabold text-ink-900">
              아직 등록된 상품이 없어요
            </h2>
            <p className="max-w-sm text-sm text-ink-500">
              우리 동네 첫 판매글의 주인공이 되어 보세요!
            </p>
            <Link
              href="/sell"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-goguma-500 px-5 py-3 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
            >
              <PackagePlus className="h-5 w-5" />
              첫 판매글 쓰기
            </Link>
          </div>
        )}

        {/* 상품 목록 */}
        {products && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as ProductListItem} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-ink-500">
          🍠 고구마마켓 · 개발 학습용 프로젝트
        </div>
      </footer>
    </>
  );
}

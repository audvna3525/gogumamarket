import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CircleUser,
  PackageOpen,
  ChevronRight,
  SquarePen,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import DeleteProductButton from "@/components/DeleteProductButton";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatRelativeTime, STATUS_LABEL } from "@/lib/format";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 주소의 번호가 숫자가 맞는지 먼저 확인
  const numericId = Number(id);
  const product = Number.isInteger(numericId)
    ? (
        await supabase
          .from("products")
          .select("id, user_id, title, price, category, status, description, created_at")
          .eq("id", numericId)
          .maybeSingle()
      ).data
    : null;

  // 글을 못 찾은 경우
  if (!product) {
    return (
      <>
        <SiteHeader userEmail={user?.email} />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
          <PackageOpen className="h-12 w-12 text-goguma-500" />
          <h1 className="text-xl font-extrabold text-ink-900">
            글을 찾을 수 없어요
          </h1>
          <p className="text-sm text-ink-500">
            이미 삭제되었거나 잘못된 주소일 수 있어요.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-goguma-500 px-5 py-3 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
          >
            목록으로 돌아가기
          </Link>
        </main>
      </>
    );
  }

  const isOwner = user?.id === product.user_id;
  const isSold = product.status === "sold";

  return (
    <>
      <SiteHeader userEmail={user?.email} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        {/* 목록으로 */}
        <Link
          href="/products"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          둘러보기로 돌아가기
        </Link>

        {/* 사진 자리 (아직 사진 없음) */}
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-goguma-100 to-goguma-50 text-7xl">
          🍠
          {product.status !== "selling" && (
            <span
              className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-sm font-bold text-white ${
                isSold ? "bg-ink-700" : "bg-amber-500"
              }`}
            >
              {STATUS_LABEL[product.status] ?? product.status}
            </span>
          )}
        </div>

        {/* 글 정보 */}
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-goguma-100 px-2.5 py-0.5 text-xs font-semibold text-goguma-700">
              {product.category}
            </span>
            {isOwner && (
              <span className="inline-flex items-center rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                내 판매글
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-snug text-ink-900">
            {product.title}
          </h1>
          <p className="mt-2 text-2xl font-extrabold text-goguma-600">
            {formatPrice(product.price)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <Clock className="h-3.5 w-3.5" />
            {formatRelativeTime(product.created_at)} 등록
          </p>

          {/* 내 글일 때만 보이는 수정·삭제 (남의 글은 창고 RLS로도 막혀 있음) */}
          {isOwner && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <Link
                href={`/products/${product.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-ink-700 transition hover:bg-gray-50"
              >
                <SquarePen className="h-4 w-4" />
                수정
              </Link>
              <DeleteProductButton id={product.id} />
            </div>
          )}

          {/* 판매자 */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-goguma-50 text-goguma-600">
              <CircleUser className="h-6 w-6" />
            </span>
            <div className="text-sm">
              <p className="font-bold text-ink-900">
                {isOwner ? "나" : "우리 동네 이웃"}
              </p>
              <p className="text-ink-500">고구마마켓 판매자</p>
            </div>
          </div>

          {/* 설명 */}
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-bold text-ink-700">상품 설명</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-ink-900">
              {product.description}
            </p>
          </div>
        </div>

        {/* 하단 액션 (채팅은 다음 단계 예정) */}
        <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
          <p className="text-sm text-ink-500">
            채팅 문의 기능은 다음 단계에서 추가될 예정이에요.
          </p>
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-goguma-600 hover:underline"
          >
            다른 상품 보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="mt-6 border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 text-center text-sm text-ink-500">
          🍠 고구마마켓 · 개발 학습용 프로젝트
        </div>
      </footer>
    </>
  );
}

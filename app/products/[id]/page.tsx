import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  PackageOpen,
  ChevronRight,
  SquarePen,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Avatar from "@/components/Avatar";
import DeleteProductButton from "@/components/DeleteProductButton";
import LikeButton from "@/components/LikeButton";
import CommentSection, {
  type CommentThread,
} from "@/components/CommentSection";
import { type CommentView } from "@/components/CommentItem";
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
          .select("id, user_id, title, price, category, status, description, created_at, image_url")
          .eq("id", numericId)
          .maybeSingle()
      ).data
    : null;

  // 글을 못 찾은 경우
  if (!product) {
    return (
      <>
        <SiteHeader userEmail={user?.email} userId={user?.id} />
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

  // 좋아요: 전체 개수와, 로그인한 내가 눌렀는지 여부
  const { count: likeCount } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("product_id", product.id);

  let likedByMe = false;
  if (user) {
    const { data: myLike } = await supabase
      .from("likes")
      .select("id")
      .eq("product_id", product.id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = !!myLike;
  }

  // 댓글: 이 글의 모든 댓글을 오래된 순으로 불러와 댓글/대댓글 묶음으로 정리
  const { data: rawComments } = await supabase
    .from("comments")
    .select("id, user_id, parent_id, body, created_at, updated_at")
    .eq("product_id", product.id)
    .order("created_at", { ascending: true });

  const comments = rawComments ?? [];

  // 판매자 + 댓글 작성자들의 프로필(닉네임·사진)을 한 번에 불러와 지도를 만듭니다.
  const authorIds = Array.from(
    new Set<string>([product.user_id, ...comments.map((c) => c.user_id)]),
  );
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, nickname, avatar_url")
    .in("id", authorIds);

  const profileMap = new Map(
    (profileRows ?? []).map((p) => [p.id, p]),
  );
  const sellerProfile = profileMap.get(product.user_id);

  const toView = (c: (typeof comments)[number]): CommentView => {
    const prof = profileMap.get(c.user_id);
    return {
      id: c.id,
      body: c.body,
      parentId: c.parent_id,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      authorId: c.user_id,
      nickname: prof?.nickname ?? "이웃",
      avatarUrl: prof?.avatar_url ?? null,
      isMine: !!user && c.user_id === user.id,
      isSeller: c.user_id === product.user_id,
    };
  };

  const threads: CommentThread[] = comments
    .filter((c) => c.parent_id === null)
    .map((parent) => ({
      ...toView(parent),
      replies: comments
        .filter((c) => c.parent_id === parent.id)
        .map(toView),
    }));

  return (
    <>
      <SiteHeader userEmail={user?.email} userId={user?.id} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:py-8">
        {/* 목록으로 */}
        <Link
          href="/products"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          둘러보기로 돌아가기
        </Link>

        {/* 사진: 올린 사진이 있으면 크게 보여주고, 없으면 고구마 이모지 */}
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-goguma-100 to-goguma-50 text-7xl">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            "🍠"
          )}
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

          {/* 판매자 — 누르면 이 사람의 글 모아보기로 이동 */}
          <Link
            href={`/users/${product.user_id}`}
            className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:bg-gray-50"
          >
            <Avatar
              url={sellerProfile?.avatar_url}
              name={sellerProfile?.nickname}
              size={44}
            />
            <div className="min-w-0 text-sm">
              <p className="flex items-center gap-1.5 font-bold text-ink-900">
                <span className="truncate">
                  {sellerProfile?.nickname ?? "우리 동네 이웃"}
                </span>
                {isOwner && (
                  <span className="shrink-0 rounded-full bg-goguma-100 px-2 py-0.5 text-[11px] font-semibold text-goguma-700">
                    나
                  </span>
                )}
              </p>
              <p className="text-ink-500">고구마마켓 판매자 · 글 모아보기</p>
            </div>
            <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-ink-500" />
          </Link>

          {/* 설명 */}
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-bold text-ink-700">상품 설명</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-ink-900">
              {product.description}
            </p>
          </div>
        </div>

        {/* 좋아요 */}
        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white py-5">
          <LikeButton
            productId={product.id}
            initialLiked={likedByMe}
            initialCount={likeCount ?? 0}
            isLoggedIn={!!user}
          />
          <p className="text-xs text-ink-500">
            이 상품이 마음에 들면 좋아요를 눌러 주세요.
          </p>
        </div>

        {/* 댓글 · 대댓글 */}
        <CommentSection
          productId={product.id}
          threads={threads}
          isLoggedIn={!!user}
          isSellerViewer={isOwner}
          totalCount={comments.length}
        />

        {/* 다른 상품 보기 */}
        <div className="mt-8 flex items-center justify-end">
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

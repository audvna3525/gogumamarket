import Link from "next/link";
import { ArrowLeft, SquarePen, PackageOpen, UserX } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Avatar from "@/components/Avatar";
import ProductCard, { type ProductListItem } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이 사람의 프로필
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, bio, avatar_url")
    .eq("id", id)
    .maybeSingle();

  // 프로필을 못 찾은 경우
  if (!profile) {
    return (
      <>
        <SiteHeader userEmail={user?.email} userId={user?.id} />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
          <UserX className="h-12 w-12 text-goguma-500" />
          <h1 className="text-xl font-extrabold text-ink-900">
            회원을 찾을 수 없어요
          </h1>
          <p className="text-sm text-ink-500">
            탈퇴했거나 잘못된 주소일 수 있어요.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-goguma-500 px-5 py-3 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
          >
            둘러보기로 돌아가기
          </Link>
        </main>
      </>
    );
  }

  const isMe = user?.id === profile.id;

  // 이 사람이 올린 판매글 (최신순)
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, category, status, created_at, image_url")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const list = products ?? [];

  return (
    <>
      <SiteHeader userEmail={user?.email} userId={user?.id} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <Link
          href="/products"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          둘러보기로 돌아가기
        </Link>

        {/* 프로필 카드 */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:flex-row sm:items-start sm:text-left">
          <Avatar url={profile.avatar_url} name={profile.nickname} size={88} />
          <div className="flex-1">
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2">
              <h1 className="text-xl font-extrabold text-ink-900">
                {profile.nickname}
              </h1>
              {isMe && (
                <span className="inline-flex items-center rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                  나
                </span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
              {profile.bio ? (
                profile.bio
              ) : (
                <span className="text-ink-500">아직 자기소개가 없어요.</span>
              )}
            </p>
            {isMe && (
              <Link
                href="/profile/edit"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-gray-50"
              >
                <SquarePen className="h-4 w-4" />
                프로필 편집
              </Link>
            )}
          </div>
        </div>

        {/* 이 사람의 판매글 */}
        <h2 className="mb-4 mt-8 text-lg font-extrabold text-ink-900">
          {isMe ? "내 판매글" : `${profile.nickname}님의 판매글`}{" "}
          <span className="text-goguma-600">{list.length}</span>
        </h2>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-goguma-200 bg-goguma-50/60 px-6 py-14 text-center">
            <PackageOpen className="h-10 w-10 text-goguma-500" />
            <p className="text-sm text-ink-500">
              {isMe
                ? "아직 올린 판매글이 없어요. 첫 글을 써 보세요!"
                : "아직 올린 판매글이 없어요."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p as ProductListItem} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-6 border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-ink-500">
          🍠 고구마마켓 · 개발 학습용 프로젝트
        </div>
      </footer>
    </>
  );
}

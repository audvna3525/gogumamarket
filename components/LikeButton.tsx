"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toggleLike } from "@/lib/actions/likes";

/**
 * 좋아요 버튼 — 로그인한 회원이 한 번 누르면 좋아요, 다시 누르면 취소됩니다.
 * 누르면 바로 화면에 반영(낙관적 업데이트)하고, 서버 응답으로 정확한 개수를 맞춥니다.
 */
export default function LikeButton({
  productId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  productId: number;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);

    if (!isLoggedIn) {
      setError("좋아요는 로그인 후 누를 수 있어요.");
      return;
    }

    // 먼저 화면을 바꿔 두고(빠른 반응), 서버 결과로 보정합니다.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const res = await toggleLike(productId);
      if (!res.ok) {
        // 실패하면 원래대로 되돌립니다.
        setLiked(liked);
        setCount(count);
        setError(res.error);
        return;
      }
      setLiked(res.liked);
      setCount(res.count);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={liked}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
          liked
            ? "border-goguma-200 bg-goguma-50 text-goguma-600"
            : "border-gray-200 bg-white text-ink-700 hover:bg-gray-50"
        }`}
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart
            className={`h-5 w-5 ${liked ? "fill-goguma-500 text-goguma-500" : ""}`}
          />
        )}
        좋아요
        <span className="tabular-nums">{count}</span>
      </button>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

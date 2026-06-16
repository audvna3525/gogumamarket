"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { addComment, type CommentState } from "@/lib/actions/comments";
import CommentItem, { type CommentView } from "@/components/CommentItem";

const EMPTY: CommentState = {};

/** 일반 댓글 + 거기에 딸린 대댓글 묶음 */
export type CommentThread = CommentView & { replies: CommentView[] };

/**
 * 상품 글 하단의 댓글 영역.
 *  · 로그인한 회원은 새 댓글을 쓸 수 있습니다.
 *  · 판매자(isSellerViewer)는 각 댓글에 답글(대댓글)을 달 수 있습니다.
 */
export default function CommentSection({
  productId,
  threads,
  isLoggedIn,
  isSellerViewer,
  totalCount,
}: {
  productId: number;
  threads: CommentThread[];
  isLoggedIn: boolean;
  isSellerViewer: boolean;
  totalCount: number;
}) {
  const [state, formAction, isPending] = useActionState(addComment, EMPTY);
  const formRef = useRef<HTMLFormElement>(null);

  // 댓글이 등록되면 입력창을 비웁니다.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
        <MessageCircle className="h-5 w-5 text-goguma-500" />
        댓글 <span className="text-goguma-600">{totalCount}</span>
      </h2>

      {/* 새 댓글 입력 */}
      {isLoggedIn ? (
        <form
          ref={formRef}
          action={formAction}
          className="mt-3 flex flex-col gap-2"
        >
          <input type="hidden" name="product_id" value={productId} />
          <textarea
            name="body"
            required
            maxLength={1000}
            rows={3}
            placeholder="이 상품에 궁금한 점이나 인사를 남겨 보세요."
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
          {state.error && (
            <p className="text-xs font-medium text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-goguma-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            댓글 남기기
          </button>
        </form>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-ink-500">
          댓글을 남기려면{" "}
          <Link href="/login" className="font-semibold text-goguma-600 hover:underline">
            로그인
          </Link>
          이 필요해요.
        </p>
      )}

      {/* 댓글 목록 */}
      <div className="mt-4">
        {threads.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">
            아직 댓글이 없어요. 첫 댓글을 남겨 보세요!
          </p>
        ) : (
          threads.map((thread) => (
            <div key={thread.id} className="border-b border-gray-100 py-4 last:border-b-0">
              <CommentItem
                comment={thread}
                productId={productId}
                canReply={isSellerViewer}
              />
              {/* 대댓글 (판매자 답글) — 왼쪽에 선을 그어 들여쓰기 */}
              {thread.replies.length > 0 && (
                <div className="mt-3 flex flex-col gap-3 border-l-2 border-goguma-100 pl-4">
                  {thread.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      productId={productId}
                      canReply={isSellerViewer}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

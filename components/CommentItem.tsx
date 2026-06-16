"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { CornerDownRight, Loader2, Pencil, Trash2, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import {
  addComment,
  updateComment,
  deleteComment,
  type CommentState,
} from "@/lib/actions/comments";
import { formatRelativeTime } from "@/lib/format";

export type CommentView = {
  id: number;
  body: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string | null;
  authorId: string; // 작성자 회원 번호 (프로필 링크용)
  nickname: string; // 작성자 닉네임
  avatarUrl: string | null; // 작성자 프로필 사진
  isMine: boolean; // 내가 쓴 댓글인지
  isSeller: boolean; // 이 글의 판매자가 쓴 댓글인지 (판매자 배지)
};

const EMPTY: CommentState = {};

/** 작성자 표시: 프로필 사진 + 닉네임(프로필로 이동) + 판매자/나 배지 */
function AuthorTag({ comment }: { comment: CommentView }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Link href={`/users/${comment.authorId}`} className="shrink-0">
        <Avatar url={comment.avatarUrl} name={comment.nickname} size={28} />
      </Link>
      <Link
        href={`/users/${comment.authorId}`}
        className="text-sm font-bold text-ink-900 hover:underline"
      >
        {comment.nickname}
      </Link>
      {comment.isSeller && (
        <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[11px] font-semibold text-white">
          판매자
        </span>
      )}
      {comment.isMine && (
        <span className="rounded-full bg-goguma-100 px-2 py-0.5 text-[11px] font-semibold text-goguma-700">
          나
        </span>
      )}
    </span>
  );
}

/**
 * 댓글 한 개.
 *  · 내가 쓴 댓글이면 수정·삭제 버튼을 보여 줍니다.
 *  · 판매자(canReply=true)이고 일반 댓글이면 답글 달기 버튼을 보여 줍니다.
 */
export default function CommentItem({
  comment,
  productId,
  canReply,
  isReply = false,
}: {
  comment: CommentView;
  productId: number;
  canReply: boolean;
  isReply?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editState, editAction, editPending] = useActionState(
    updateComment,
    EMPTY,
  );
  const [replyState, replyAction, replyPending] = useActionState(
    addComment,
    EMPTY,
  );

  // 수정/답글이 성공하면 입력창을 닫습니다. (화면은 서버가 새로 그려 줍니다)
  useEffect(() => {
    if (editState.ok) setEditing(false);
  }, [editState.ok]);
  useEffect(() => {
    if (replyState.ok) setReplying(false);
  }, [replyState.ok]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <AuthorTag comment={comment} />
        <span className="shrink-0 text-xs text-ink-500">
          {formatRelativeTime(comment.createdAt)}
          {comment.updatedAt && " (수정됨)"}
        </span>
      </div>

      {/* 본문 또는 수정 입력창 */}
      {editing ? (
        <form action={editAction} className="mt-2 flex flex-col gap-2">
          <input type="hidden" name="id" value={comment.id} />
          <input type="hidden" name="product_id" value={productId} />
          <textarea
            name="body"
            required
            maxLength={1000}
            rows={3}
            defaultValue={comment.body}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
          {editState.error && (
            <p className="text-xs font-medium text-red-600">{editState.error}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={editPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-goguma-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-goguma-600 disabled:opacity-60"
            >
              {editPending && <Loader2 className="h-4 w-4 animate-spin" />}
              수정 완료
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              취소
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-900">
          {comment.body}
        </p>
      )}

      {/* 액션 버튼들 */}
      {!editing && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {canReply && !isReply && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 transition hover:text-goguma-600"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              답글
            </button>
          )}
          {comment.isMine && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 transition hover:text-ink-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </button>
              {confirmDelete ? (
                <form action={deleteComment} className="inline-flex items-center gap-2">
                  <input type="hidden" name="id" value={comment.id} />
                  <input type="hidden" name="product_id" value={productId} />
                  <span className="text-xs font-semibold text-ink-700">삭제할까요?</span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 transition hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    확정
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs font-semibold text-ink-500 transition hover:text-ink-700"
                  >
                    취소
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 transition hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  삭제
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* 답글 입력창 (판매자만) */}
      {replying && (
        <form action={replyAction} className="mt-3 flex flex-col gap-2 rounded-xl bg-gray-50 p-3">
          <input type="hidden" name="product_id" value={productId} />
          <input type="hidden" name="parent_id" value={comment.id} />
          <textarea
            name="body"
            required
            maxLength={1000}
            rows={2}
            placeholder="답글을 입력하세요"
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
          {replyState.error && (
            <p className="text-xs font-medium text-red-600">{replyState.error}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={replyPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-goguma-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-goguma-600 disabled:opacity-60"
            >
              {replyPending && <Loader2 className="h-4 w-4 animate-spin" />}
              답글 등록
            </button>
            <button
              type="button"
              onClick={() => setReplying(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

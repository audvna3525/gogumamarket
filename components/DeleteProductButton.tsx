"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { deleteProduct } from "@/lib/actions/products";

/** 내 판매글 삭제 버튼 — 실수 방지를 위해 "정말 삭제?" 확인 단계를 거칩니다. */
export default function DeleteProductButton({ id }: { id: number }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        삭제
      </button>
    );
  }

  return (
    <form action={deleteProduct} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-sm font-semibold text-ink-700">정말 삭제할까요?</span>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
      >
        <Trash2 className="h-4 w-4" />
        삭제 확정
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-gray-50"
      >
        <X className="h-4 w-4" />
        취소
      </button>
    </form>
  );
}

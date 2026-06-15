"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Tag,
  LayoutGrid,
  Banknote,
  FileText,
  PackagePlus,
  ImageOff,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "@/lib/actions/products";
import { CATEGORIES } from "@/lib/categories";

type ProductInit = {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
};

/** 판매글 등록/수정 폼. product를 넘기면 수정 모드로 동작합니다. */
export default function SellForm({ product }: { product?: ProductInit }) {
  const isEdit = !!product;
  const [state, formAction, isPending] = useActionState<
    ProductFormState,
    FormData
  >(isEdit ? updateProduct : createProduct, {});
  const [price, setPrice] = useState(
    product ? product.price.toLocaleString("ko-KR") : "",
  );

  // 등록이 끝나면 폼 대신 성공 안내를 보여줍니다. (수정은 끝나면 상세 페이지로 바로 이동)
  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-ink-900">
            판매글이 등록됐어요! 🎉
          </h2>
          <p className="mt-1.5 text-sm text-ink-500">
            <span className="font-semibold text-ink-700">
              “{state.success.title}”
            </span>{" "}
            글이 우리 동네에 올라갔어요.
          </p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/products/${state.success.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-goguma-500 px-5 py-3 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
          >
            방금 올린 글 보기
          </Link>
          <Link
            href="/sell"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-bold text-ink-700 transition hover:bg-gray-50"
          >
            <PackagePlus className="h-5 w-5" />
            글 하나 더 쓰기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 수정 모드일 때 어떤 글인지 함께 보냅니다. */}
      {isEdit && <input type="hidden" name="id" value={product.id} />}

      {/* 제목 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">제목</span>
        <div className="relative">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            name="title"
            required
            maxLength={100}
            defaultValue={product?.title}
            placeholder="예) 거의 새것 무선 키보드 팝니다"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
        </div>
      </label>

      {/* 카테고리 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">카테고리</span>
        <div className="relative">
          <LayoutGrid className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <select
            name="category"
            required
            defaultValue={product?.category ?? ""}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          >
            <option value="" disabled>
              카테고리를 선택해 주세요
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
        </div>
      </label>

      {/* 가격 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">가격</span>
        <div className="relative">
          <Banknote className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <input
            type="text"
            name="price"
            required
            inputMode="numeric"
            value={price}
            onChange={(e) => {
              // 숫자만 남기고 천 단위 콤마로 보기 좋게 표시합니다.
              const digits = e.target.value.replace(/[^0-9]/g, "");
              setPrice(digits ? Number(digits).toLocaleString("ko-KR") : "");
            }}
            placeholder="0"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-500">
            원
          </span>
        </div>
        <span className="text-xs text-ink-500">
          무료로 나눔하려면 0을 입력하세요.
        </span>
      </label>

      {/* 상품 설명 */}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">상품 설명</span>
        <div className="relative">
          <FileText className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-ink-500" />
          <textarea
            name="description"
            required
            maxLength={2000}
            rows={7}
            defaultValue={product?.description}
            placeholder="상품 상태, 구매 시기, 거래 희망 장소 등을 적어 주세요."
            className="w-full resize-y rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-ink-900 outline-none transition focus:border-goguma-500 focus:ring-2 focus:ring-goguma-200"
          />
        </div>
      </label>

      {/* 사진은 다음 단계 안내 */}
      <p className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-ink-500">
        <ImageOff className="h-4 w-4 shrink-0" />
        사진 첨부 기능은 다음 단계에서 추가할 예정이에요. 지금은 글만 저장됩니다.
      </p>

      {/* 에러 메시지 */}
      {state.error && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-goguma-500 py-3.5 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isEdit ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <PackagePlus className="h-5 w-5" />
        )}
        {isEdit
          ? isPending
            ? "수정 중…"
            : "수정 완료"
          : isPending
            ? "등록 중…"
            : "판매글 등록하기"}
      </button>
    </form>
  );
}

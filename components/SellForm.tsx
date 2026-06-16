"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  Tag,
  LayoutGrid,
  Banknote,
  FileText,
  PackagePlus,
  ImagePlus,
  Loader2,
  X,
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
import { createClient } from "@/lib/supabase/client";

const IMAGE_BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ProductInit = {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image_url: string | null;
};

/** 판매글 등록/수정 폼. product를 넘기면 수정 모드로 동작합니다. */
export default function SellForm({
  userId,
  product,
}: {
  userId: string;
  product?: ProductInit;
}) {
  const isEdit = !!product;
  const [state, formAction, isPending] = useActionState<
    ProductFormState,
    FormData
  >(isEdit ? updateProduct : createProduct, {});
  const [price, setPrice] = useState(
    product ? product.price.toLocaleString("ko-KR") : "",
  );

  // 사진: 저장된 주소(imageUrl), 올리는 중 표시(uploading), 사진 관련 에러
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.image_url ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사진 파일을 골랐을 때: 검사 → 저장소에 올리기 → 받은 공개 주소를 기억
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    if (!ALLOWED.includes(file.type)) {
      setImageError("JPG·PNG·WEBP·GIF 형식의 이미지만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setImageError("사진 용량은 5MB 이하만 올릴 수 있어요.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // 내 폴더(userId) 안에 저장합니다. (보안 규칙이 본인 폴더만 허용)
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setImageError("사진 올리기에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      setImageUrl(publicUrl);
    } finally {
      setUploading(false);
      // 같은 파일을 다시 골라도 동작하도록 입력값을 비웁니다.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // 미리보기에서 사진 제거 (실제 파일 정리는 저장 시 서버가 처리)
  function removeImage() {
    setImageUrl(null);
    setImageError(null);
  }

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
      {/* 올린 사진 주소를 폼과 함께 서버로 보냅니다. (사진 없으면 빈 값) */}
      <input type="hidden" name="image_url" value={imageUrl ?? ""} />

      {/* 사진 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-ink-700">
          대표 사진{" "}
          <span className="font-normal text-ink-500">(선택)</span>
        </span>

        {imageUrl ? (
          // 사진이 있으면 미리보기 + 제거 버튼
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="상품 사진 미리보기"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-black/75"
            >
              <X className="h-4 w-4" />
              사진 빼기
            </button>
          </div>
        ) : (
          // 사진이 없으면 올리기 영역
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-ink-500 transition hover:border-goguma-300 hover:bg-goguma-50/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-goguma-500" />
                <span className="text-sm font-semibold">사진 올리는 중…</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-7 w-7" />
                <span className="text-sm font-semibold">
                  사진 올리기 (탭하여 선택)
                </span>
                <span className="text-xs">JPG·PNG·WEBP·GIF · 최대 5MB</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {imageError && (
          <p className="flex items-start gap-2 text-xs font-medium text-red-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {imageError}
          </p>
        )}
      </div>

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
        disabled={isPending || uploading}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-goguma-500 py-3.5 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isEdit ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <PackagePlus className="h-5 w-5" />
        )}
        {uploading
          ? "사진 올리는 중…"
          : isEdit
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

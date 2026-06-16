import Link from "next/link";
import { Clock } from "lucide-react";
import { formatPrice, formatRelativeTime, STATUS_LABEL } from "@/lib/format";

export type ProductListItem = {
  id: number;
  title: string;
  price: number;
  category: string;
  status: string;
  created_at: string;
  image_url: string | null;
};

/** 목록에 보이는 상품 카드 하나 */
export default function ProductCard({ product }: { product: ProductListItem }) {
  const isSold = product.status === "sold";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      {/* 사진: 올린 사진이 있으면 보여주고, 없으면 고구마 이모지 자리 */}
      <div className="relative grid aspect-square place-items-center overflow-hidden bg-gradient-to-br from-goguma-100 to-goguma-50 text-4xl">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <span className="transition group-hover:scale-110">🍠</span>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-ink-700 backdrop-blur">
          {product.category}
        </span>
        {product.status !== "selling" && (
          <span
            className={`absolute right-2 top-2 rounded-md px-2 py-0.5 text-xs font-bold text-white ${
              isSold ? "bg-ink-700" : "bg-amber-500"
            }`}
          >
            {STATUS_LABEL[product.status] ?? product.status}
          </span>
        )}
      </div>

      {/* 글 정보 */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink-900">
          {product.title}
        </h3>
        <p className="mt-1 font-extrabold text-ink-900">
          {formatPrice(product.price)}
        </p>
        <p className="mt-auto flex items-center gap-1 pt-2 text-xs text-ink-500">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(product.created_at)}
        </p>
      </div>
    </Link>
  );
}

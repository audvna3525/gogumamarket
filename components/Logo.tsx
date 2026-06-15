import Link from "next/link";

/** 고구마마켓 로고 (고구마 이모지 칩 + 워드마크) */
export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 select-none">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-goguma-500 text-lg shadow-sm shadow-goguma-500/30">
        🍠
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink-900">
        고구마<span className="text-goguma-600">마켓</span>
      </span>
    </Link>
  );
}

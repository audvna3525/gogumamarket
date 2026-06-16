import { CircleUser } from "lucide-react";

/**
 * 프로필 사진 동그라미.
 * 사진(url)이 있으면 사진을, 없으면 기본 사람 아이콘을 보여 줍니다.
 */
export default function Avatar({
  url,
  name,
  size = 40,
  className = "",
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const dimension = { width: size, height: size };

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name ? `${name}님의 프로필 사진` : "프로필 사진"}
        style={dimension}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      style={dimension}
      className={`grid shrink-0 place-items-center rounded-full bg-goguma-50 text-goguma-500 ${className}`}
    >
      <CircleUser style={{ width: size * 0.62, height: size * 0.62 }} />
    </span>
  );
}

/** 화면 표시용 공통 도구 (목록·상세 페이지가 함께 사용) */

/** 가격을 보기 좋게: 0원이면 "나눔", 그 외엔 "35,000원" */
export function formatPrice(price: number): string {
  if (price === 0) return "나눔";
  return `${price.toLocaleString("ko-KR")}원`;
}

/** 등록 시각을 "방금 전 / 3분 전 / 2시간 전 / 4일 전 / 날짜"로 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

/** 판매 상태 한글 라벨 */
export const STATUS_LABEL: Record<string, string> = {
  selling: "판매중",
  reserved: "예약중",
  sold: "판매완료",
};

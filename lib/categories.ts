/** 고구마마켓 상품 카테고리 목록 (글쓰기 폼과 저장 로직이 함께 사용) */
export const CATEGORIES = [
  "디지털기기",
  "가구/인테리어",
  "유아동",
  "생활/주방",
  "의류",
  "뷰티/미용",
  "스포츠/레저",
  "도서/취미/음반",
  "반려동물용품",
  "기타 중고물품",
] as const;

export type Category = (typeof CATEGORIES)[number];

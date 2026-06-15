import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16부터 middleware.ts → proxy.ts 로 이름이 바뀌었습니다.
// 함수 이름도 middleware → proxy 입니다.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래를 제외한 모든 경로에서 세션을 갱신합니다.
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico, 이미지 파일들
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

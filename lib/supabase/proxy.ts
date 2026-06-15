import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 매 요청마다 Supabase 세션(인증 쿠키)을 새로 고쳐 응답에 실어 보냅니다.
 * Next.js 16의 proxy.ts(구 middleware.ts)에서 호출합니다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser()를 호출하면 만료된 토큰이 자동으로 갱신됩니다.
  // (getSession 대신 getUser를 쓰는 것이 서버에서 더 안전합니다.)
  await supabase.auth.getUser();

  return supabaseResponse;
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버(서버 컴포넌트 · 서버 액션 · Route Handler)에서 사용하는 Supabase 클라이언트.
 * Next.js 15+ 에서 cookies()는 비동기이므로 이 함수도 async 입니다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 호출되면 set이 막힐 수 있습니다.
            // 세션 갱신은 proxy.ts가 처리하므로 무시해도 안전합니다.
          }
        },
      },
    },
  );
}

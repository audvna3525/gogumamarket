import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  // 이미 로그인한 사용자는 홈으로 보냅니다.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="text-2xl font-extrabold text-ink-900">
            다시 만나서 반가워요 👋
          </h1>
          <p className="text-sm text-ink-500">
            로그인하고 우리 동네 이웃들과 거래해 보세요.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <AuthForm mode="login" action={login} />
        </div>
      </div>
    </main>
  );
}

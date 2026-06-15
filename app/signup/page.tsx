import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AuthForm from "@/components/AuthForm";
import { signup } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
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
            고구마마켓 시작하기 🍠
          </h1>
          <p className="text-sm text-ink-500">
            30초면 가입 끝! 따뜻한 동네 거래를 시작해요.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <AuthForm mode="signup" action={signup} />
        </div>
      </div>
    </main>
  );
}

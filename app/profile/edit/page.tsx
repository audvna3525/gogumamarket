import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ProfileForm from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인하지 않았으면 로그인 페이지로 보냅니다.
  if (!user) {
    redirect("/login");
  }

  // 내 프로필을 불러옵니다. (가입 시 자동 생성되지만, 없으면 기본값으로 채움)
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const initial = {
    nickname: profile?.nickname ?? (user.email?.split("@")[0] ?? "이웃"),
    bio: profile?.bio ?? null,
    avatar_url: profile?.avatar_url ?? null,
  };

  return (
    <>
      <SiteHeader userEmail={user.email} userId={user.id} />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:py-8">
        <Link
          href={`/users/${user.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          내 프로필로 돌아가기
        </Link>

        <h1 className="mb-1 text-2xl font-extrabold text-ink-900">프로필 편집</h1>
        <p className="mb-6 text-sm text-ink-500">
          닉네임·사진·자기소개는 내 판매글과 댓글에 함께 보여요.
        </p>

        <ProfileForm userId={user.id} profile={initial} />
      </main>

      <footer className="mt-6 border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-lg px-4 py-6 text-center text-sm text-ink-500">
          🍠 고구마마켓 · 개발 학습용 프로젝트
        </div>
      </footer>
    </>
  );
}

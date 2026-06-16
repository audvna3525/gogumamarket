import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  MessagesSquare,
  Heart,
  Store,
  ArrowRight,
  PackagePlus,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    icon: ShieldCheck,
    title: "안전한 거래",
    desc: "본인 인증과 매너온도로 믿고 거래할 수 있어요.",
  },
  {
    icon: MapPin,
    title: "동네 인증",
    desc: "내 위치 주변 이웃과 가까운 거리에서 직거래해요.",
  },
  {
    icon: MessagesSquare,
    title: "간편한 채팅",
    desc: "관심 상품을 바로 채팅으로 문의하고 약속을 잡아요.",
  },
  {
    icon: Heart,
    title: "따뜻한 나눔",
    desc: "필요 없는 물건이 이웃에겐 보물이 되는 즐거움.",
  },
];

const stats = [
  { value: "1.8만+", label: "우리 동네 이웃" },
  { value: "4.9", label: "평균 매너온도 ℃" },
  { value: "30초", label: "간편 가입" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      {/* 상단 헤더 */}
      <SiteHeader userEmail={user?.email} userId={user?.id} />

      <main className="flex-1">
        {/* 히어로 */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-goguma-100 px-3 py-1 text-sm font-semibold text-goguma-700">
            <MapPin className="h-4 w-4" />
            우리 동네 중고 직거래
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            가까운 이웃과 나누는
            <br />
            <span className="text-goguma-600">따뜻한 중고 거래</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">
            고구마마켓에서 우리 동네 이웃과 안전하게 사고팔아요.
            <br className="hidden sm:block" />
            필요 없는 물건은 나누고, 필요한 물건은 합리적으로.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? (
              <>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-goguma-500 px-6 py-3.5 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
                >
                  <Store className="h-5 w-5" />
                  동네 상품 둘러보기
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-bold text-ink-700 transition hover:bg-gray-50"
                >
                  <PackagePlus className="h-5 w-5" />
                  판매글 쓰기
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-goguma-500 px-6 py-3.5 font-bold text-white shadow-sm shadow-goguma-500/30 transition hover:bg-goguma-600"
                >
                  지금 시작하기
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-bold text-ink-700 transition hover:bg-gray-50"
                >
                  로그인
                </Link>
              </>
            )}
          </div>

          {/* 통계 인포그래픽 */}
          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm"
              >
                <dt className="text-2xl font-extrabold text-goguma-600">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-ink-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 특징 카드 (인포그래픽) */}
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-ink-900">
            왜 고구마마켓일까요?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-goguma-50 text-goguma-600 transition group-hover:bg-goguma-500 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 다음 단계 안내 (개발 학습용) */}
        <section className="mx-auto max-w-5xl px-4 pb-24">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-goguma-200 bg-goguma-50/60 px-6 py-10 text-center">
            <Store className="h-8 w-8 text-goguma-500" />
            <h2 className="text-xl font-extrabold text-ink-900">
              다음 단계: 사진 첨부 &amp; 채팅 문의
            </h2>
            <p className="max-w-md text-sm text-ink-500">
              지금까지 회원가입·로그인과 판매글 등록·목록·상세 화면을 완성했어요.
              다음 단계에서 사진 첨부와 이웃 간 채팅 문의 기능을 함께 만들어요.
            </p>
            <Link
              href="/products"
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-goguma-600 hover:underline"
            >
              동네 상품 둘러보러 가기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-ink-500">
          🍠 고구마마켓 · 개발 학습용 프로젝트
        </div>
      </footer>
    </>
  );
}

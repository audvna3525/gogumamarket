# 🍠 고구마마켓 (gogumamarket)

당근마켓 스타일의 우리 동네 중고 직거래 마켓. **Next.js + Supabase** 학습용으로 단계적으로 개발합니다.

- 기존 가계부(`../index.html`)와 **같은 Supabase 프로젝트**(`isjmnzlhyregojcbyofs`)를 공유합니다.
- 배포는 나중에 가계부와 **별도 링크**로 진행합니다.

## 실행 방법

```bash
cd gogumamarket
npm install      # 최초 1회
npm run dev      # http://localhost:3000
```

환경 변수는 `.env.local`에 들어 있습니다 (Supabase URL + 공개 키).

## 기술 스택

- **Next.js 16** (App Router, Turbopack) — `middleware.ts`는 16부터 **`proxy.ts`**로 이름이 바뀌었습니다.
- **TypeScript + Tailwind CSS v4**
- **Supabase Auth** (`@supabase/ssr`) — 쿠키 기반 세션
- **lucide-react** — 인포그래픽 아이콘

## 폴더 구조 (1단계 기준)

```
gogumamarket/
├─ proxy.ts                     # 매 요청 세션 갱신 (구 middleware)
├─ app/
│  ├─ layout.tsx                # 공통 레이아웃 (한국어, 메타데이터)
│  ├─ globals.css               # 디자인 토큰(고구마 브랜드 컬러)
│  ├─ page.tsx                  # 홈(랜딩) — 로그인 상태에 따라 헤더 변화
│  ├─ login/page.tsx            # 로그인 페이지
│  └─ signup/page.tsx           # 회원가입 페이지
├─ components/
│  ├─ Logo.tsx                  # 로고
│  └─ AuthForm.tsx              # 로그인/회원가입 공용 폼 (클라이언트)
└─ lib/
   ├─ actions/auth.ts           # 서버 액션: login / signup / logout
   └─ supabase/
      ├─ client.ts              # 브라우저용 클라이언트
      ├─ server.ts              # 서버용 클라이언트(async cookies)
      └─ proxy.ts               # 세션 갱신 헬퍼
```

## 인증 동작 방식

1. `proxy.ts`가 모든 요청에서 Supabase 세션 쿠키를 갱신합니다.
2. 서버 컴포넌트/액션은 `lib/supabase/server.ts`의 `createClient()`로 `auth.getUser()`를 호출해 로그인 상태를 확인합니다.
3. 로그인/회원가입/로그아웃은 모두 **서버 액션**(`lib/actions/auth.ts`)으로 처리합니다.

> **이메일 인증 안내**: 현재 Supabase 프로젝트는 이메일 인증이 꺼져 있어 **가입 즉시 로그인**됩니다.
> 켜져 있으면 코드가 "확인 메일을 보냈어요" 안내를 보여줍니다.
> 설정: Supabase 대시보드 → Authentication → Sign In / Providers → Email → *Confirm email*.

## 단계별 개발 로드맵

- [x] **1단계 — 인증**: 회원가입 · 로그인 · 로그아웃, 랜딩 페이지, 디자인 시스템
- [ ] **2단계 — 프로필**: `profiles` 테이블 + RLS, 닉네임/동네 설정
- [ ] **3단계 — 상품**: `products` 테이블, 상품 목록 · 상세 · 등록
- [ ] **4단계 — 이미지**: Supabase Storage로 상품 사진 업로드
- [ ] **5단계 — 거래**: 찜하기, 채팅, 거래 상태 관리
- [ ] **6단계 — 배포**: Vercel에 별도 링크로 배포

---

🤖 학습용 프로젝트 · 한 단계씩 천천히 만들어 갑니다.

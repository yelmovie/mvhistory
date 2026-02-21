# AI와 함께하는 한국사 여행 🏛️

초등학생을 위한 역사 학습 웹앱입니다. 암기 중심이 아닌 탐험 경험으로 역사를 학습할 수 있습니다.

## 주요 기능 ✨

- 📚 **시대별 퀴즈** - 삼국시대, 고려, 조선, 근현대 (총 500개 문제)
- 🎭 **역사 인물과 AI 채팅** - OpenAI GPT-4o-mini로 실제 대화하는 느낌
- 🖼️ **AI 생성 인물 초상화** - OpenAI DALL-E로 생성
- 📸 **질문별 맞춤 이미지** - Google Custom Search로 자동 검색 및 캐싱
- 🎯 **3단계 힌트 시스템** - 단계별 도움말
- 🃏 **인물 카드 수집** - 퀴즈 정답 시 획득
- 📝 **오답노트** - 틀린 문제 복습
- 🏆 **순위 등록** - 상위 10명 랭킹

## 설치 및 실행 🚀

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd korean-history-app
```

### 2. 의존성 설치

```bash
npm install
# or
pnpm install
```

### 3. API 키 설정 (필수)

이 앱은 다음 API를 사용합니다:

#### 3.1 OpenAI API (AI 채팅 및 이미지 생성)
1. https://platform.openai.com/api-keys 방문
2. 로그인 후 "Create new secret key" 클릭
3. 생성된 키를 Supabase 환경 변수에 등록
   - 변수명: `OPENAI_API_KEY`
   - GPT-4o-mini는 비용 효율적이며 한국어를 잘 이해합니다

#### 3.2 Google Custom Search API (퀴즈 이미지 검색) ⭐ NEW
퀴즈 질문에 맞는 이미지를 자동으로 검색하여 표시합니다.

**설정 방법:**
1. [상세 가이드 문서](/GOOGLE_IMAGE_SETUP.md) 참조
2. Google Cloud Console에서 Custom Search API 활성화
3. Programmable Search Engine 생성
4. 다음 환경 변수 설정:
   - `GOOGLE_SEARCH_API_KEY`: Google API 키
   - `GOOGLE_SEARCH_ENGINE_ID`: 검색 엔진 ID (cx=...)

**무료 할당량:**
- 하루 100회 검색 무료
- 검색 결과는 자동으로 캐시되어 중복 API 호출 방지

**자세한 설정 방법은 [GOOGLE_IMAGE_SETUP.md](/GOOGLE_IMAGE_SETUP.md)를 참조하세요.**

### 4. 개발 서버 실행

```bash
npm run dev
# or
pnpm dev
```

브라우저에서 http://localhost:5173 을 열어주세요.

## 기술 스택 🛠️

- **React** - UI 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS v4** - 스타일링
- **Motion (Framer Motion)** - 애니메이션
- **Vite** - 빌드 도구
- **Supabase** - 백엔드 데이터베이스 및 인증
- **OpenAI GPT-4o-mini** - AI 채팅
- **OpenAI DALL-E** - 인물 초상화 생성
- **Google Custom Search API** - 퀴즈 이미지 검색

## 이미지 시스템 🖼️

### 자동 이미지 검색 및 캐싱
1. **키워드 추출**: 퀴즈 질문에서 역사 관련 키워드 자동 추출
2. **Google 검색**: Custom Search API로 관련 이미지 검색
3. **캐싱**: 검색 결과를 Supabase KV Store에 저장
4. **재사용**: 동일 질문에 대해 캐시된 이미지 사용 (API 호출 절감)

### 지원하는 키워드 예시
- 고조선 → "고조선 단군"
- 세종대왕 → "세종대왕 한글"
- 불국사 → "불국사 석가탑"
- 임진왜란 → "임진왜란 조선"

## 디자인 컨셉 🎨

- **Blue 계열 통일** - Primary Blue (#2563EB), Cyan Accent (#22D3EE)
- **글래스모피즘** - 세련된 반투명 효과
- **반응형 디자인** - 데스크톱, 태블릿, 모바일 지원
- **초등학생 친화적** - Pretendard 폰트, 둥근 모서리

## 빌드 📦

```bash
npm run build
# or
pnpm build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

## 환경 변수 보안 ⚠️

- API 키는 Supabase 환경 변수로 안전하게 관리됩니다
- 서버 사이드에서만 API 호출이 이루어집니다
- 프론트엔드에는 API 키가 노출되지 않습니다

## API 사용량 및 비용 💰

### Google Custom Search API
- 무료 할당량: 하루 100회
- 초과 비용: 검색 1000회당 $5
- 캐싱으로 중복 호출 최소화

### OpenAI API
- GPT-4o-mini: 매우 저렴한 비용
- DALL-E: 이미지당 약 $0.02

## 문서 📚

- [Google Image Setup Guide](/GOOGLE_IMAGE_SETUP.md) - 이미지 검색 API 설정
- [API Setup](/API_SETUP.md) - 전체 API 설정 가이드
- [Design Compliance](/DESIGN_COMPLIANCE.md) - 디자인 시스템

## 라이센스 📄

MIT License

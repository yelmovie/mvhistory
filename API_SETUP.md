# 🎨 OpenAI 이미지 생성 API 설정 가이드

## 개요

이 앱은 OpenAI의 DALL-E API를 사용하여 퀴즈 질문과 관련된 이미지를 자동으로 생성합니다.

## 🔑 API 키 설정 방법

### 1. OpenAI API 키 발급

1. [OpenAI 플랫폼](https://platform.openai.com/)에 가입/로그인
2. 우측 상단 프로필 → "API keys" 클릭
3. "+ Create new secret key" 버튼 클릭
4. 생성된 API 키를 안전하게 복사 (한 번만 표시됩니다!)

### 2. 코드에 API 키 적용

`/src/app/utils/imageGenerator.ts` 파일을 열고 다음 부분을 수정하세요:

```typescript
// 변경 전
const apiKey = "YOUR_OPENAI_API_KEY";

// 변경 후 (실제 API 키로 교체)
const apiKey = "sk-proj-xxxxxxxxxxxxxxxxxxxx";
```

### 3. 환경 변수 사용 (권장)

더 안전한 방법은 환경 변수를 사용하는 것입니다:

1. 프로젝트 루트에 `.env.local` 파일 생성:
```bash
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```

2. `imageGenerator.ts` 파일 수정:
```typescript
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";
```

3. `.gitignore`에 `.env.local` 추가 (이미 추가되어 있어야 함)

## 💰 비용 안내

### DALL-E 3 가격 (2024년 기준)
- **Standard Quality**: $0.040 / 이미지 (1024×1024)
- **HD Quality**: $0.080 / 이미지 (1024×1024)

### DALL-E 2 가격 (더 저렴한 옵션)
- **1024×1024**: $0.020 / 이미지
- **512×512**: $0.018 / 이미지
- **256×256**: $0.016 / 이미지

### 모델 변경 방법

비용 절감을 위해 DALL-E 2를 사용하려면:

```typescript
// imageGenerator.ts에서
body: JSON.stringify({
  model: "dall-e-2", // dall-e-3 → dall-e-2로 변경
  // ... 나머지 옵션
})
```

## 🎭 목(Mock) 이미지 사용

API 키가 설정되지 않은 경우, 앱은 자동으로 Unsplash의 무료 이미지를 사용합니다.

### Mock 이미지 커스터마이징

`imageGenerator.ts`에서 `mockImages` 객체를 수정하여 원하는 이미지 URL을 추가할 수 있습니다:

```typescript
const mockImages: Record<string, string> = {
  "민주항쟁": "https://your-image-url.com/image1.jpg",
  "세종대왕": "https://your-image-url.com/image2.jpg",
  // ... 더 추가
};
```

## ⚙️ API 옵션 설정

### 이미지 크기
- `"1024x1024"` - 정사각형 (기본)
- `"1792x1024"` - 가로형
- `"1024x1792"` - 세로형

### 이미지 품질
- `"standard"` - 표준 (기본, 더 저렴)
- `"hd"` - 고화질 (더 비싸지만 품질 우수)

### 이미지 스타일
- `"vivid"` - 생생하고 극적인 이미지 (기본)
- `"natural"` - 자연스럽고 사실적인 이미지

### 설정 예시

```typescript
const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: "한국 역사 관련 일러스트레이션",
    n: 1,
    size: "1024x1024",     // 크기 변경
    quality: "standard",   // 품질 변경
    style: "vivid"        // 스타일 변경
  })
});
```

## 🚨 보안 주의사항

⚠️ **절대 API 키를 코드에 직접 포함하지 마세요!**

- 환경 변수 사용
- `.env.local` 파일을 `.gitignore`에 추가
- Git에 커밋하기 전 API 키가 포함되지 않았는지 확인

## 🔧 문제 해결

### "API error: 401" 오류
- API 키가 올바르지 않습니다
- API 키 앞뒤 공백 제거
- 새 API 키 발급

### "API error: 429" 오류
- API 사용량 한도 초과
- OpenAI 대시보드에서 사용량 확인
- 결제 정보 확인

### 이미지가 로드되지 않음
- 네트워크 연결 확인
- 브라우저 콘솔에서 에러 메시지 확인
- Mock 이미지로 대체되는지 확인

## 📚 추가 자료

- [OpenAI API 문서](https://platform.openai.com/docs/api-reference/images)
- [DALL-E 가이드](https://platform.openai.com/docs/guides/images)
- [가격 정보](https://openai.com/pricing)

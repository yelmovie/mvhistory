# Google Custom Search API 설정 가이드

## 개요
"AI와 함께하는 한국사여행" 웹앱은 Google Custom Search API를 사용하여 퀴즈 질문과 관련된 이미지를 자동으로 검색하고 표시합니다. 검색된 이미지는 Supabase 데이터베이스에 캐시되어 재사용됩니다.

## 1. Google Cloud Console 설정

### 1.1 Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: "Korean History Quiz" (또는 원하는 이름)

### 1.2 Custom Search API 활성화
1. Google Cloud Console에서 "API 및 서비스" > "라이브러리" 선택
2. "Custom Search API" 검색
3. "Custom Search API" 선택 후 "사용" 버튼 클릭

### 1.3 API 키 생성
1. "API 및 서비스" > "사용자 인증 정보" 선택
2. "+ 사용자 인증 정보 만들기" > "API 키" 선택
3. 생성된 API 키를 복사하여 안전한 곳에 보관
4. (선택사항) API 키 제한 설정:
   - "API 제한사항" 섹션에서 "Custom Search API"만 선택
   - "애플리케이션 제한사항"에서 HTTP 리퍼러 제한 추가

## 2. Custom Search Engine 생성

### 2.1 Programmable Search Engine 설정
1. [Programmable Search Engine](https://programmablesearchengine.google.com/) 접속
2. "시작하기" 또는 "Add" 버튼 클릭
3. 다음 설정 입력:
   - **검색할 사이트**: `www.google.com` (전체 웹 검색)
   - **언어**: 한국어
   - **검색 엔진 이름**: "Korean History Images"

### 2.2 이미지 검색 설정
1. 생성된 검색 엔진에서 "설정" 또는 "Edit" 버튼 클릭
2. "검색 기능" 탭에서:
   - ✅ "이미지 검색" 활성화
   - ✅ "전체 웹 검색" 활성화 (사이트 제한 제거)
3. "검색 엔진 ID" 복사 (cx=로 시작하는 ID)

### 2.3 SafeSearch 설정
1. "설정" > "기본 설정"에서:
   - SafeSearch: **보통** 또는 **엄격** 선택 (초등학생 대상이므로)

## 3. Figma Make 환경 변수 설정

### 3.1 Supabase 환경 변수 추가
Figma Make에서 다음 두 개의 환경 변수를 설정해야 합니다:

1. **GOOGLE_SEARCH_API_KEY**
   - 값: 1.3단계에서 생성한 Google API 키 입력
   - 예: `AIzaSyC9XyZ...`

2. **GOOGLE_SEARCH_ENGINE_ID**
   - 값: 2.2단계에서 복사한 검색 엔진 ID 입력
   - 예: `a1b2c3d4e5f6g7h8i`

### 3.2 환경 변수 입력 방법
앱을 처음 실행하면 자동으로 환경 변수 입력 모달이 표시됩니다.
또는 웹 UI의 설정 메뉴에서 직접 입력할 수 있습니다.

## 4. API 사용량 및 비용

### 4.1 무료 할당량
- **Custom Search API**: 하루 100회 검색 무료
- 100회 초과 시: 검색 1000회당 $5 (USD)

### 4.2 할당량 관리
- Google Cloud Console > "API 및 서비스" > "할당량"에서 사용량 모니터링
- 할당량 초과 방지를 위한 권장 사항:
  - 앱은 자동으로 검색 결과를 캐시하여 중복 검색 방지
  - 동일한 질문에 대해 한 번만 검색 수행
  - 캐시된 이미지는 Supabase KV Store에 영구 저장

### 4.3 비용 절감 팁
1. **캐싱 활용**: 앱이 자동으로 이미지 URL을 캐시하므로 중복 API 호출 없음
2. **테스트 환경**: 개발/테스트 시 별도의 API 키 사용
3. **할당량 알림**: Google Cloud Console에서 예산 알림 설정

## 5. 동작 원리

### 5.1 이미지 검색 프로세스
1. 사용자가 퀴즈 문제를 로드
2. 앱이 캐시에서 해당 문제의 이미지 확인
3. 캐시에 없으면:
   - 질문에서 키워드 자동 추출
   - Google Custom Search API로 이미지 검색
   - 첫 번째 결과를 선택하여 표시
   - 결과를 Supabase에 캐시
4. 다음번에는 캐시된 이미지 사용 (API 호출 없음)

### 5.2 키워드 추출 예시
- "고조선을 세운 인물은?" → 검색: "고조선 단군 한국 역사"
- "세종대왕이 만든 문자는?" → 검색: "세종대왕 한글 한국 역사"
- "신라의 천문대는?" → 검색: "첨성대 신라 한국 역사"

### 5.3 캐시 구조
```json
{
  "key": "image:quiz:123",
  "value": {
    "url": "https://example.com/image.jpg",
    "query": "고조선 단군 한국 역사",
    "timestamp": "2026-02-21T10:30:00Z"
  }
}
```

## 6. 문제 해결

### 6.1 이미지가 표시되지 않을 때
1. 브라우저 콘솔에서 에러 메시지 확인
2. API 키와 검색 엔진 ID가 올바른지 확인
3. Google Cloud Console에서 API가 활성화되어 있는지 확인
4. 할당량을 초과하지 않았는지 확인

### 6.2 검색 결과가 부적절할 때
1. Programmable Search Engine 설정에서 SafeSearch 레벨 조정
2. 특정 사이트만 검색하도록 제한 추가
3. 부적절한 도메인을 제외 목록에 추가

### 6.3 API 할당량 초과
- 할당량 초과 시 폴백 이미지가 자동으로 표시됨
- 다음 날 자정(UTC) 이후 할당량 초기화
- 필요 시 Google Cloud Console에서 할당량 증가 요청

## 7. 보안 권장사항

### 7.1 API 키 보호
- ✅ 환경 변수로 안전하게 저장
- ✅ 서버 사이드에서만 사용 (프론트엔드 노출 방지)
- ❌ GitHub 등 공개 저장소에 커밋하지 않기

### 7.2 API 키 제한 설정
1. Google Cloud Console에서 API 키 편집
2. "애플리케이션 제한사항" 설정:
   - HTTP 리퍼러: `your-domain.com/*`
3. "API 제한사항" 설정:
   - Custom Search API만 허용

## 8. 참고 문서

- [Google Custom Search JSON API 문서](https://developers.google.com/custom-search/v1/overview)
- [Programmable Search Engine 문서](https://developers.google.com/custom-search/docs/tutorial/introduction)
- [API 키 관리 가이드](https://cloud.google.com/docs/authentication/api-keys)

---

## 요약 체크리스트

- [ ] Google Cloud 프로젝트 생성
- [ ] Custom Search API 활성화
- [ ] API 키 생성 및 복사
- [ ] Programmable Search Engine 생성
- [ ] 검색 엔진 ID 복사
- [ ] Figma Make에 GOOGLE_SEARCH_API_KEY 설정
- [ ] Figma Make에 GOOGLE_SEARCH_ENGINE_ID 설정
- [ ] 퀴즈 화면에서 이미지 로딩 확인
- [ ] (선택) API 키 제한 설정
- [ ] (선택) 예산 알림 설정

모든 설정이 완료되면 앱이 자동으로 질문에 맞는 이미지를 검색하여 표시합니다! 🎉

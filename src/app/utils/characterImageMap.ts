/**
 * 인물 카드 이미지 매핑 유틸
 *
 * 규칙:
 *  - 이미지는 public/characters/{시대폴더}/{id}.{ext} 에 저장
 *  - 지원 확장자: webp, jpg, jpeg, png (우선순위 순)
 *  - 이미지가 없으면 빈 문자열 반환 → ImageWithFallback이 emoji fallback 표시
 *
 * 시대 폴더 매핑:
 *  고조선     → gojoseon
 *  삼국시대   → three-kingdoms
 *  고려       → goryeo
 *  조선       → joseon
 *  근현대     → modern
 */

// ── 시대 → 폴더 매핑 ──────────────────────────────────────────────
const PERIOD_FOLDER: Record<string, string> = {
  고조선: "gojoseon",
  삼국시대: "three-kingdoms",
  고려: "goryeo",
  조선: "joseon",
  근현대: "modern",
};

// ── 지원 확장자 ───────────────────────────────────────────────────
const SUPPORTED_EXTS = ["webp", "jpg", "jpeg", "png"];

/**
 * 인물 ID와 시대를 받아 `/characters/{폴더}/{id}.{ext}` URL을 반환.
 * Vite dev 환경에서는 public 폴더 파일이 바로 접근됨.
 * 확장자 우선순위: png → webp (png 우선)
 */
export function getCharacterImagePath(id: string, period: string): string {
  const folder = PERIOD_FOLDER[period];
  if (!folder) return "";
  // png 우선 반환 (현재 이미지가 png로 저장됨)
  return `/characters/${folder}/${id}.png`;
}

/**
 * 주요 경로(png) 실패 시 시도할 대체 경로들 반환
 */
export function getCharacterImageFallbackPath(id: string, period: string): string {
  const folder = PERIOD_FOLDER[period];
  if (!folder) return "";
  return `/characters/${folder}/${id}.webp`;
}

/**
 * 주어진 ID와 시대에 대해 존재하는 이미지 확장자를 순서대로 시도하는 URL 목록 반환
 */
export function getCharacterImageCandidates(id: string, period: string): string[] {
  const folder = PERIOD_FOLDER[period];
  if (!folder) return [];
  return SUPPORTED_EXTS.map(ext => `/characters/${folder}/${id}.${ext}`);
}

/**
 * 이미지 URL 우선순위 결정:
 * 1. 로컬 저장 이미지 (localStorage에서 base64 확인)
 * 2. public 폴더 이미지 경로
 * 3. 캐시된 외부 URL (imageCache state)
 * 4. character.imageUrl (수동 지정 외부 URL)
 * 5. 빈 문자열 (→ emoji fallback)
 */
export function resolveCharacterImage(
  id: string,
  period: string,
  externalUrl?: string,
  imageCache?: Record<string, string>
): string {
  // 1. 로컬 base64 (AdminImageManager가 저장)
  const localKey = `char_img_${id}`;
  const local = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
  if (local) return local;

  // 2. 캐시된 외부 URL (API 응답)
  if (imageCache?.[id]) return imageCache[id];

  // 3. character.imageUrl (직접 지정)
  if (externalUrl) return externalUrl;

  // 4. public 폴더 경로 (파일이 없으면 ImageWithFallback이 처리)
  return getCharacterImagePath(id, period);
}

/** localStorage에 이미지 저장 */
export function saveCharacterImageToLocal(id: string, dataUrl: string): void {
  try {
    localStorage.setItem(`char_img_${id}`, dataUrl);
  } catch {
    // localStorage quota 초과 시 무시
    console.warn(`이미지 저장 실패: ${id}`);
  }
}

/** localStorage에서 이미지 삭제 */
export function deleteCharacterImageFromLocal(id: string): void {
  localStorage.removeItem(`char_img_${id}`);
}

/** localStorage에 저장된 모든 인물 이미지 ID 목록 */
export function getLocalImageIds(): string[] {
  const ids: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("char_img_")) {
      ids.push(key.replace("char_img_", ""));
    }
  }
  return ids;
}

export { PERIOD_FOLDER, SUPPORTED_EXTS };

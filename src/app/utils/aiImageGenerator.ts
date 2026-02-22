// AI 이미지 생성 및 캐싱 유틸리티

export interface CharacterImageCache {
  [characterId: string]: string; // characterId -> imageUrl
}

const STORAGE_KEY = 'character_images_cache';

// Supabase 정보
const _supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngvsfcekfzzykvcsjktp.supabase.co';
const _anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndnNmY2VrZnp6eWt2Y3Nqa3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDYyMDksImV4cCI6MjA4NjQ4MjIwOX0.49FGaOySPc63Pxf6G-QS5T3LVoAie3XWGJsBY1djSZY';

// localStorage에서 이미지 캐시 가져오기
export function getImageCache(): CharacterImageCache {
  try {
    const cache = localStorage.getItem(STORAGE_KEY);
    return cache ? JSON.parse(cache) : {};
  } catch (error) {
    console.error('Failed to load image cache:', error);
    return {};
  }
}

// localStorage에 이미지 캐시 저장
export function saveImageCache(cache: CharacterImageCache): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save image cache:', error);
  }
}

// 특정 캐릭터의 이미지 URL 가져오기
export function getCachedImage(characterId: string): string | null {
  const cache = getImageCache();
  return cache[characterId] || null;
}

// 특정 캐릭터의 이미지 URL 저장
export function cacheCharacterImage(characterId: string, imageUrl: string): void {
  const cache = getImageCache();
  cache[characterId] = imageUrl;
  saveImageCache(cache);
}

// OpenAI DALL-E API를 사용하여 캐릭터 이미지 생성 (서버를 통해)
export async function generateCharacterImage(
  characterName: string,
  characterPeriod: string,
  characterRole: string
): Promise<string> {
  try {
    const response = await fetch(
      `${_supabaseUrl}/functions/v1/make-server-48be01a5/generate-character-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_anonKey}`
        },
        body: JSON.stringify({
          characterName,
          characterPeriod,
          characterRole
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate image');
    }

    const data = await response.json();
    const imageUrl = data.imageUrl;

    if (!imageUrl) {
      throw new Error('No image URL returned from API');
    }

    return imageUrl;
  } catch (error) {
    console.error('Failed to generate character image:', error);
    throw error;
  }
}

// 캐릭터 이미지 가져오기 (캐시 우선, 없으면 생성)
export async function getOrGenerateCharacterImage(
  characterId: string,
  characterName: string,
  characterPeriod: string,
  characterRole: string,
  onProgress?: (status: string) => void
): Promise<string> {
  // 먼저 캐시 확인
  const cachedImage = getCachedImage(characterId);
  if (cachedImage) {
    onProgress?.('캐시된 이미지를 불러왔습니다');
    return cachedImage;
  }

  // 캐시에 없으면 생성
  try {
    onProgress?.('AI로 인물 초상화를 그리는 중...');
    const imageUrl = await generateCharacterImage(characterName, characterPeriod, characterRole);
    
    // 생성된 이미지 캐시에 저장
    cacheCharacterImage(characterId, imageUrl);
    onProgress?.('이미지 생성 완료!');
    
    return imageUrl;
  } catch (error) {
    onProgress?.('이미지 생성 실패');
    throw error;
  }
}

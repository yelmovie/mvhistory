// DALL-E API를 통한 이미지 생성 및 캐싱 시스템

interface CachedImage {
  url: string;
  timestamp: number;
  prompt: string;
}

const IMAGE_CACHE_KEY = 'quiz_image_cache';
const CACHE_EXPIRY_DAYS = 30; // 30일간 캐시 유지

export class ImageCacheService {
  private cache: Map<string, CachedImage>;

  constructor() {
    this.cache = new Map();
    this.loadCache();
  }

  // localStorage에서 캐시 로드
  private loadCache() {
    try {
      const cached = localStorage.getItem(IMAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.cache = new Map(Object.entries(parsed));
        
        // 만료된 캐시 제거
        this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('Failed to load image cache:', error);
    }
  }

  // localStorage에 캐시 저장
  private saveCache() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save image cache:', error);
      // 용량 초과시 오래된 항목 제거
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanOldCache(10); // 가장 오래된 10개 제거
        this.saveCache(); // 재시도
      }
    }
  }

  // 만료된 캐시 제거
  private cleanExpiredCache() {
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > expiryTime) {
        this.cache.delete(key);
      }
    }
    
    this.saveCache();
  }

  // 오래된 캐시 제거
  private cleanOldCache(count: number) {
    const sorted = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    for (let i = 0; i < Math.min(count, sorted.length); i++) {
      this.cache.delete(sorted[i][0]);
    }
  }

  // 캐시 키 생성
  private getCacheKey(quizId: number): string {
    return `quiz_${quizId}`;
  }

  // 캐시에서 이미지 가져오기
  getCachedImage(quizId: number): string | null {
    const key = this.getCacheKey(quizId);
    const cached = this.cache.get(key);
    
    if (cached) {
      const now = Date.now();
      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      
      if (now - cached.timestamp < expiryTime) {
        return cached.url;
      } else {
        // 만료된 캐시 제거
        this.cache.delete(key);
        this.saveCache();
      }
    }
    
    return null;
  }

  // DALL-E API로 이미지 생성
  async generateImage(quizId: number, prompt: string, apiKey: string): Promise<string> {
    // 캐시 확인
    const cached = this.getCachedImage(quizId);
    if (cached) {
      return cached;
    }

    // API 키가 없으면 플레이스홀더 반환
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
      return this.getPlaceholderImage(prompt);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `한국 역사 교육용 이미지: ${prompt}. 초등학생이 이해하기 쉬운 삽화 스타일, 밝고 친근한 분위기, 교육적이고 정확한 역사적 묘사`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        })
      });

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      // 캐시에 저장
      this.cacheImage(quizId, imageUrl, prompt);

      return imageUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      return this.getPlaceholderImage(prompt);
    }
  }

  // 이미지를 캐시에 저장
  cacheImage(quizId: number, url: string, prompt: string) {
    const key = this.getCacheKey(quizId);
    this.cache.set(key, {
      url,
      timestamp: Date.now(),
      prompt
    });
    this.saveCache();
  }

  // 플레이스홀더 이미지 생성 (API 키가 없을 때)
  private getPlaceholderImage(prompt: string): string {
    // 프롬프트 기반으로 Unsplash 검색 키워드 생성
    const keywords = this.extractKeywords(prompt);
    return `https://images.unsplash.com/photo-1578648693974-9438ebc063bb?w=800&q=80`;
  }

  // 프롬프트에서 키워드 추출
  private extractKeywords(prompt: string): string {
    // 한국 역사 관련 키워드 매핑
    const keywordMap: Record<string, string> = {
      '고조선': 'ancient korea temple',
      '삼국시대': 'ancient korea castle',
      '고구려': 'ancient korea fortress',
      '백제': 'ancient korea temple',
      '신라': 'ancient korea pagoda',
      '고려': 'goryeo korea temple',
      '조선': 'joseon korea palace',
      '한글': 'korean alphabet',
      '세종대왕': 'korean king statue',
      '이순신': 'korean admiral statue',
      '임진왜란': 'korean war ship',
      '거북선': 'turtle ship',
      '독립운동': 'korean independence',
      '3·1운동': 'korean independence movement',
      '광복': 'korean liberation',
      '6·25전쟁': 'korean war memorial'
    };

    for (const [key, value] of Object.entries(keywordMap)) {
      if (prompt.includes(key)) {
        return value;
      }
    }

    return 'korean history';
  }

  // 캐시 통계
  getCacheStats() {
    return {
      total: this.cache.size,
      oldest: this.getOldestCacheDate(),
      newest: this.getNewestCacheDate()
    };
  }

  private getOldestCacheDate(): Date | null {
    if (this.cache.size === 0) return null;
    
    const oldest = Array.from(this.cache.values())
      .reduce((min, item) => item.timestamp < min ? item.timestamp : min, Infinity);
    
    return new Date(oldest);
  }

  private getNewestCacheDate(): Date | null {
    if (this.cache.size === 0) return null;
    
    const newest = Array.from(this.cache.values())
      .reduce((max, item) => item.timestamp > max ? item.timestamp : max, 0);
    
    return new Date(newest);
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
    localStorage.removeItem(IMAGE_CACHE_KEY);
  }
}

// 싱글톤 인스턴스
export const imageCacheService = new ImageCacheService();

/**
 * Client-side helper for the quiz image pipeline.
 *
 * Calls the Supabase Edge Function endpoint POST /quiz-image/generate and
 * returns a public image URL.  Never exposes secrets; all sensitive keys
 * stay in the Edge Function (server side).
 *
 * Usage:
 *   const url = await getQuizImage({ era: '조선시대', topic: '훈민정음', keywords: ['세종대왕', '한글'] });
 */

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://ngvsfcekfzzykvcsjktp.supabase.co";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const EDGE_BASE = `${SUPABASE_URL}/functions/v1/make-server-48be01a5`;

// ---------------------------------------------------------------------------
// Fallback images by category (used when Edge Function is unreachable)
// ---------------------------------------------------------------------------
const CATEGORY_FALLBACKS: Record<string, string> = {
  고조선: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  청동기시대: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  철기시대: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  부여: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80",
  삼국시대: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  고구려: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1024&q=80",
  백제: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  신라: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  통일신라: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1024&q=80",
  고려: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1024&q=80",
  고려시대: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1024&q=80",
  조선: "https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1024&q=80",
  조선시대: "https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1024&q=80",
  근현대: "https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1024&q=80",
  인물: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1024&q=80",
};
const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80";

export function getFallbackImageUrl(category?: string): string {
  if (!category) return DEFAULT_FALLBACK;
  // Partial match
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (category.includes(key) || key.includes(category)) return url;
  }
  return DEFAULT_FALLBACK;
}

// ---------------------------------------------------------------------------
// Era / topic mapping from quizData category strings
// ---------------------------------------------------------------------------
interface EraInfo {
  era: string;
  topic: string;
}

const CATEGORY_TO_ERA: Record<string, EraInfo> = {
  고조선: { era: "고조선", topic: "고조선 문명" },
  청동기시대: { era: "고조선", topic: "청동기 문화" },
  철기시대: { era: "삼국시대 이전", topic: "철기 문화" },
  부여: { era: "삼국시대 이전", topic: "부여 왕국" },
  옥저: { era: "삼국시대 이전", topic: "옥저" },
  동예: { era: "삼국시대 이전", topic: "동예" },
  삼한: { era: "삼국시대 이전", topic: "삼한" },
  고구려: { era: "삼국시대", topic: "고구려" },
  백제: { era: "삼국시대", topic: "백제" },
  신라: { era: "삼국시대", topic: "신라" },
  삼국시대: { era: "삼국시대", topic: "삼국 문화" },
  통일신라: { era: "통일신라", topic: "통일신라 불교 문화" },
  발해: { era: "통일신라", topic: "발해" },
  고려: { era: "고려시대", topic: "고려 문화" },
  고려시대: { era: "고려시대", topic: "고려 문화" },
  조선: { era: "조선시대", topic: "조선 유교 문화" },
  조선시대: { era: "조선시대", topic: "조선 유교 문화" },
  근현대: { era: "근현대", topic: "한국 근현대사" },
  인물: { era: "조선시대", topic: "역사 인물" },
};

export function categoryToEraInfo(category?: string): EraInfo {
  if (!category) return { era: "한국 역사", topic: "한국 문화" };
  // Exact match first
  if (CATEGORY_TO_ERA[category]) return CATEGORY_TO_ERA[category];
  // Partial match
  for (const [key, info] of Object.entries(CATEGORY_TO_ERA)) {
    if (category.includes(key) || key.includes(category)) return info;
  }
  return { era: "한국 역사", topic: category };
}

// ---------------------------------------------------------------------------
// Extract keywords from question text
// ---------------------------------------------------------------------------
const HISTORICAL_KEYWORD_MAP: Array<{ kr: string; keywords: string[] }> = [
  { kr: "고조선", keywords: ["고조선", "단군"] },
  { kr: "단군", keywords: ["단군왕검", "고조선"] },
  { kr: "고구려", keywords: ["고구려", "광개토대왕"] },
  { kr: "백제", keywords: ["백제", "석탑"] },
  { kr: "신라", keywords: ["신라", "불국사"] },
  { kr: "통일신라", keywords: ["통일신라", "석굴암"] },
  { kr: "고려", keywords: ["고려", "청자"] },
  { kr: "세종", keywords: ["세종대왕", "훈민정음", "한글"] },
  { kr: "한글", keywords: ["한글", "훈민정음"] },
  { kr: "불국사", keywords: ["불국사", "석가탑"] },
  { kr: "첨성대", keywords: ["첨성대", "신라"] },
  { kr: "석굴암", keywords: ["석굴암", "불상"] },
  { kr: "거북선", keywords: ["거북선", "이순신"] },
  { kr: "이순신", keywords: ["이순신", "거북선", "임진왜란"] },
  { kr: "독립", keywords: ["독립운동", "만세"] },
  { kr: "3.1운동", keywords: ["3.1운동", "독립"] },
  { kr: "임진왜란", keywords: ["임진왜란", "조선"] },
  { kr: "팔만대장경", keywords: ["팔만대장경", "고려"] },
  { kr: "청자", keywords: ["고려청자", "청자"] },
  { kr: "백자", keywords: ["조선백자", "백자"] },
  { kr: "경복궁", keywords: ["경복궁", "궁궐"] },
  { kr: "훈민정음", keywords: ["훈민정음", "세종대왕"] },
  { kr: "금속활자", keywords: ["금속활자", "직지"] },
];

export function extractKeywordsFromText(
  questionText: string,
  category?: string,
): string[] {
  const found: string[] = [];

  for (const { kr, keywords } of HISTORICAL_KEYWORD_MAP) {
    if (questionText.includes(kr)) {
      found.push(...keywords);
      if (found.length >= 4) break;
    }
  }

  if (found.length === 0 && category) {
    found.push(category);
  }

  // Deduplicate
  return [...new Set(found)].slice(0, 4);
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------
export interface QuizImageRequest {
  quizItemId?: string | number;
  era: string;
  topic: string;
  keywords: string[];
  styleHints?: string;
}

export interface QuizImageResult {
  publicUrl: string;
  cacheKey?: string;
  status: "ready" | "pending" | "failed" | "fallback";
  source?: string;
}

/**
 * Fetch (or generate) an image for a quiz item.
 * Returns a URL immediately; falls back to a local Unsplash URL if the
 * Edge Function is unreachable or fails.
 */
export async function getQuizImage(
  req: QuizImageRequest,
): Promise<QuizImageResult> {
  try {
    const res = await fetch(`${EDGE_BASE}/quiz-image/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quizItemId: req.quizItemId != null ? String(req.quizItemId) : undefined,
        era: req.era,
        topic: req.topic,
        keywords: req.keywords,
        styleHints: req.styleHints,
      }),
      signal: AbortSignal.timeout(20_000), // 20 s timeout
    });

    if (res.status === 429) {
      console.warn("Quiz image rate limit hit, using fallback");
      return {
        publicUrl: DEFAULT_FALLBACK,
        status: "fallback",
        source: "rate-limited",
      };
    }

    const data = await res.json();

    if (data.publicUrl) {
      return {
        publicUrl: data.publicUrl,
        cacheKey: data.cacheKey,
        status: data.status ?? "ready",
        source: data.source,
      };
    }

    throw new Error(data.error ?? "No publicUrl in response");
  } catch (err) {
    console.error("getQuizImage failed:", err);
    return {
      publicUrl: DEFAULT_FALLBACK,
      status: "fallback",
      source: "error",
    };
  }
}

/**
 * Convenience wrapper that accepts a raw quiz item object and derives
 * era/topic/keywords automatically from category and question text.
 */
export async function getQuizImageFromItem(item: {
  id: number | string;
  question: string;
  category?: string;
  imagePrompt?: string;
}): Promise<QuizImageResult> {
  const eraInfo = categoryToEraInfo(item.category);
  const keywords = extractKeywordsFromText(item.question, item.category);

  return getQuizImage({
    quizItemId: item.id,
    era: eraInfo.era,
    topic: eraInfo.topic,
    keywords: keywords.length > 0 ? keywords : [item.category ?? "한국역사"],
    styleHints: item.imagePrompt,
  });
}

/**
 * Prompt builder and deterministic cache-key generator for quiz images.
 *
 * Style target: cute chibi educational illustration — child-friendly for elementary students.
 * Scary prevention: all "warrior / battle / grim" descriptions are rewritten to friendly variants.
 */

// ---------------------------------------------------------------------------
// Cache key
// ---------------------------------------------------------------------------

export async function buildCacheKey(
  era: string,
  topic: string,
  keywords: string[],
  size = "1024x1024",
  quality = "low",
  version = "v2", // bump version to invalidate old scary images
): Promise<string> {
  const sorted = [...keywords].sort().join(",");
  const raw = [era, topic, sorted, size, quality, version]
    .map((s) => s.trim().toLowerCase())
    .join("|");

  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hexHash.slice(0, 40);
}

// ---------------------------------------------------------------------------
// Chibi-style subject descriptions (child-friendly, no scary elements)
// ---------------------------------------------------------------------------

const SUBJECT_CHIBI: Record<string, string> = {
  "동명성왕": "cute chibi Korean king Jumong with a friendly smile, wearing colorful ancient Korean royal robes, sitting on a throne, round cute face, big eyes",
  "주몽": "cute chibi Korean hero Jumong with a big smile, colorful ancient Korean clothes, holding a bow, round friendly face",
  "광개토대왕": "cute chibi Korean king Gwanggaeto the Great with a cheerful expression, wearing bright royal armor, holding a small map scroll",
  "장수왕": "cute chibi Korean king Jangsu smiling warmly, colorful royal Korean robes, round cute face",
  "을지문덕": "cute chibi Korean general Eulji Mundeok with a confident smile, colorful ancient Korean uniform, big round eyes",
  "무용총": "cute chibi illustration of ancient Goguryeo people happily dancing on colorful wall murals, bright cheerful colors",
  "근초고왕": "cute chibi King Geunchogo of Baekje with a kind smile, colorful Korean royal clothes",
  "성왕": "cute chibi King Seong of Baekje smiling gently near a cute Buddhist temple",
  "의자왕": "cute chibi King Uija of Baekje with a thoughtful expression, colorful Korean royal robes",
  "박혁거세": "cute chibi founder of Silla kingdom with a big smile, bright colorful Korean clothes, hatching from a golden egg",
  "진흥왕": "cute chibi King Jinheung of Silla smiling proudly next to a cute stone monument",
  "선덕여왕": "cute chibi Queen Seondeok of Silla with a wise smile, colorful Korean royal dress, standing near a cute round tower",
  "김유신": "cute chibi General Kim Yusin with a heroic smile, bright colorful Korean armor, big round eyes",
  "계백": "cute chibi General Gyebaek with a determined smile, colorful Korean warrior costume, round friendly face",
  "단군왕검": "cute chibi Dangun the legendary Korean founder smiling warmly, standing among cute pine trees and dolmen stones",
  "세종대왕": "cute chibi King Sejong the Great smiling happily, holding a colorful scroll of Hangeul alphabet, wearing royal Korean robes",
  "이순신": "cute chibi Admiral Yi Sun-sin with a brave smile, standing on a cute colorful turtle ship",
  "신사임당": "cute chibi artist Shin Saimdang smiling gently, painting colorful flowers and butterflies on hanji paper",
  "유관순": "cute chibi independence activist Yu Gwan-sun smiling bravely, holding a small Korean flag",
  "안중근": "cute chibi patriot An Jung-geun smiling with dignity, wearing a colorful coat",
  "정약용": "cute chibi scholar Jeong Yak-yong smiling curiously at books and inventions",
  "불국사": "cute chibi illustration of Bulguksa Temple with colorful curved roofs, stone pagodas, blooming cherry blossoms",
  "석굴암": "cute chibi illustration of Seokguram Grotto with a friendly smiling stone Buddha statue, soft golden light",
  "첨성대": "cute chibi illustration of the Cheomseongdae observatory tower surrounded by stars and flowers",
  "훈민정음": "cute chibi illustration of King Sejong and scholars happily creating Korean alphabet letters with colorful ink brushes",
  "한글": "cute chibi illustration of colorful Hangeul Korean alphabet characters floating like balloons",
  "거북선": "cute chibi turtle ship (geobukseon) with a friendly turtle face, colorful flags, sailing on calm blue water",
  "경복궁": "cute chibi Gyeongbokgung Palace with colorful curved roofs, cherry blossoms, and a cute blue sky",
  "팔만대장경": "cute chibi illustration of Haeinsa Temple with colorful wooden shelves of Buddhist scripture blocks",
  "고려청자": "cute chibi jade-green celadon pottery with cute crane designs on a wooden shelf",
  "조선백자": "cute chibi white porcelain vase with cute blue flower patterns on a wooden shelf",
  "금속활자": "cute chibi illustration of Goryeo craftsmen smiling while arranging metal printing blocks",
  "직지심체요절": "cute chibi illustration of an old book glowing with golden light, monks smiling around it",
  "측우기": "cute chibi rain gauge instrument with raindrops falling happily into it",
  "앙부일구": "cute chibi sundial instrument shaped like a bowl with a happy sun above it",
  "살수대첩": "cute chibi illustration of Korean soldiers cheering happily at a river battle victory, no violence shown",
  "3.1운동": "cute chibi illustration of Korean people happily waving small flags for independence, spring flowers everywhere",
  "임진왜란": "cute chibi turtle ships with friendly turtle faces sailing on calm blue ocean",
  "병자호란": "cute chibi Korean soldiers smiling bravely inside a colorful fortress",
  "씨름": "cute chibi two friendly Korean wrestlers smiling and competing in a sand ring with cheering crowd",
  "청동기": "cute chibi ancient Korean village with thatched-roof houses, smiling people, dolmen stones",
  "고구려": "cute chibi ancient Korean Goguryeo kingdom scene with colorful fortresses and mountains",
  "백제": "cute chibi ancient Baekje kingdom scene with colorful Buddhist temples",
  "신라": "cute chibi ancient Silla kingdom scene with colorful pagodas and Gyeongju landscape",
  "고려": "cute chibi Goryeo dynasty scene with jade celadon pottery and Buddhist temples",
  "조선": "cute chibi Joseon dynasty scene with colorful Hanok village and palace buildings",
};

function getChibiDescription(keywords: string[]): string {
  for (const kw of keywords) {
    if (SUBJECT_CHIBI[kw]) return SUBJECT_CHIBI[kw];
    for (const [kr, desc] of Object.entries(SUBJECT_CHIBI)) {
      if (kw.includes(kr) || kr.includes(kw)) return desc;
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// Scary word guard — rewrite scary terms to child-friendly variants
// ---------------------------------------------------------------------------

export function sanitizePrompt(prompt: string): string {
  return prompt
    .replace(/\b(grim|grimac|grim-face)\b/gi, "cheerful")
    .replace(/\b(angry|rage|furious|fierce)\b/gi, "friendly")
    .replace(/\b(dark|darkness|shadow|shadowy)\b/gi, "bright")
    .replace(/\bscary\b/gi, "cute")
    .replace(/\bhorror\b/gi, "friendly")
    .replace(/\bblood(y)?\b/gi, "colorful")
    .replace(/\bwar\b/gi, "historic")
    .replace(/\bbattle\b/gi, "historic event")
    .replace(/\bkilling\b/gi, "victory")
    .replace(/\bdead\b/gi, "past")
    .replace(/\bweapon\b/gi, "historical tool")
    .replace(/\bsword\b/gi, "historical prop")
    .replace(/\bspear\b/gi, "historical prop")
    .replace(/\b(menacing|threatening|intimidating)\b/gi, "confident")
    .replace(/realistic grim face/gi, "cute round face with big eyes");
}

// ---------------------------------------------------------------------------
// Google Search query builder
// ---------------------------------------------------------------------------

export function buildGoogleSearchQuery(
  topic: string,
  keywords: string[],
  era: string,
): string {
  // Prefer specific subject name for search
  const main = keywords[0] || topic;
  return `${main} 한국 역사 ${era} 교육`;
}

// ---------------------------------------------------------------------------
// Relevance checker for Google Search results
// ---------------------------------------------------------------------------

const RELEVANCE_SIGNALS = [
  "korea", "korean", "한국", "조선", "고려", "삼국", "신라", "백제",
  "고구려", "고조선", "역사", "문화재", "heritage", "history", "위키", "백과",
  "museum", "나무위키",
];

const BANNED_TERMS = [
  "instagram", "pinterest", "shutterstock", "gettyimages", "alamy",
  "adobe.stock", "dreamstime", "depositphotos",
];

export function isGoogleResultRelevant(
  item: { link: string; title: string; snippet?: string },
  era: string,
  keywords: string[],
): boolean {
  const combined = `${item.link} ${item.title} ${item.snippet ?? ""}`.toLowerCase();

  // Reject stock photo sites
  if (BANNED_TERMS.some((t) => combined.includes(t))) return false;

  // Must contain at least one relevance signal or keyword
  const allSignals = [
    ...RELEVANCE_SIGNALS,
    era.toLowerCase(),
    ...keywords.map((k) => k.toLowerCase()),
  ];
  return allSignals.some((s) => combined.includes(s));
}

// ---------------------------------------------------------------------------
// Main prompt builder (chibi style)
// ---------------------------------------------------------------------------

export function buildQuizImagePrompt(
  era: string,
  topic: string,
  keywords: string[],
  _styleHints?: string, // ignored — we enforce chibi style
): string {
  const chibiDesc = getChibiDescription(keywords);

  const subject = chibiDesc
    ? chibiDesc
    : `cute chibi educational illustration of ${keywords[0] || topic} in Korean history, friendly smile, round face, big eyes`;

  const basePrompt = [
    subject,
    "Style: cute chibi cartoon, rounded shapes, big friendly eyes, warm pastel colors, soft clean lines, flat simple background.",
    "Target audience: Korean elementary school children aged 7-13.",
    "MUST HAVE: friendly smile, cheerful expression, bright pastel palette (sky blue, mint green, peach, light yellow).",
    "STRICTLY NO: scary faces, grim expressions, realistic violence, dark shadows, horror elements, blood, weapons shown aggressively.",
    "STRICTLY NO: text, letters, watermarks, logos, speech bubbles.",
    "STRICTLY NO: Southeast Asian temples, Chinese architecture, Japanese architecture, non-Korean settings.",
    `Historical context: ${era} Korean history — ${topic}.`,
    "The image must be 100% appropriate for young children — cute, educational, fun.",
  ].join(" ");

  return sanitizePrompt(basePrompt);
}

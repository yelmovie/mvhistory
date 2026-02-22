/**
 * Prompt builder and deterministic cache-key generator for quiz images.
 *
 * Rules:
 * - Prompts are tightly grounded to Korean history era/topic.
 * - Negative constraints prevent unrelated landmarks, modern elements, text, watermarks.
 * - No warm/yellow tone override (styleHints may add tone, but defaults to cool/neutral).
 * - Cache keys are deterministic: same inputs always produce the same key.
 */

// ---------------------------------------------------------------------------
// Cache key
// ---------------------------------------------------------------------------

/**
 * Build a deterministic, URL-safe cache key from image parameters.
 * Format: base64url(sha256(normalized-string)), truncated to 40 chars.
 *
 * The key is stable: same era + topic + sorted keywords + size + quality + version
 * always yield the same string, so a quiz item is generated exactly once.
 */
export async function buildCacheKey(
  era: string,
  topic: string,
  keywords: string[],
  size = "1024x1024",
  quality = "low",
  version = "v1",
): Promise<string> {
  const sorted = [...keywords].sort().join(",");
  const raw = [era, topic, sorted, size, quality, version]
    .map((s) => s.trim().toLowerCase())
    .join("|");

  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  // 40 hex chars (160 bits) is more than enough for collision resistance
  return hexHash.slice(0, 40);
}

// ---------------------------------------------------------------------------
// Era-specific historical context
// ---------------------------------------------------------------------------

interface EraContext {
  environment: string;
  props: string;
  forbiddenLandmarks: string;
  palette: string;
}

const ERA_CONTEXTS: Record<string, EraContext> = {
  "고조선": {
    environment: "ancient Korean Bronze Age village with thatched-roof dwellings and dolmen stones",
    props: "bronze daggers, pottery, dolmens, stone tools",
    forbiddenLandmarks: "no Joseon-era palaces, no Buddhist temples, no modern structures",
    palette: "muted earth tones, ochre, grey stone",
  },
  "삼국시대": {
    environment: "Three Kingdoms period Korean fortress or royal court with traditional wooden architecture",
    props: "iron armor, celadon pottery, Buddhist statues, pagodas",
    forbiddenLandmarks: "no Goryeo-era celadon, no Joseon palaces, no modern buildings",
    palette: "deep reds, gold accents, natural wood",
  },
  "고려시대": {
    environment: "Goryeo dynasty Korean temple courtyard or palace with curved roof tiles",
    props: "celadon pottery, Buddhist sutras, wooden printing blocks, silk robes",
    forbiddenLandmarks: "no Joseon palaces, no modern architecture, no Japanese structures",
    palette: "jade green, warm wood browns, temple red",
  },
  "조선시대": {
    environment: "Joseon dynasty Korean palace courtyard or traditional hanok village",
    props: "joseon robes (hanbok), hanji paper, ink brushes, ceramic white porcelain",
    forbiddenLandmarks: "no Buddhist temples as primary subject (unless relevant), no modern structures, no Japanese colonial architecture",
    palette: "white porcelain, indigo, natural wood",
  },
  "근현대": {
    environment: "early 20th century Korean street or independence movement gathering",
    props: "period clothing, traditional flags, newspapers, lanterns",
    forbiddenLandmarks: "no contemporary skyscrapers, no foreign national flags as primary subject",
    palette: "desaturated tones, ink black, white",
  },
  "default": {
    environment: "traditional Korean historical setting",
    props: "Korean historical artifacts appropriate to the topic",
    forbiddenLandmarks: "no modern buildings, no non-Korean architecture",
    palette: "neutral, historically appropriate colors",
  },
};

function getEraContext(era: string): EraContext {
  for (const [key, ctx] of Object.entries(ERA_CONTEXTS)) {
    if (era.includes(key)) return ctx;
  }
  return ERA_CONTEXTS["default"];
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Korean historical subject → English description map
// ---------------------------------------------------------------------------
const SUBJECT_EN: Record<string, string> = {
  "동명성왕": "King Dongmyeonseong (Jumong), the founder of Goguryeo, a heroic Korean warrior-king in ancient armor",
  "주몽": "Jumong (King Dongmyeonseong), the legendary founder of Goguryeo kingdom, wearing ancient Korean warrior armor",
  "광개토대왕": "King Gwanggaeto the Great of Goguryeo, a powerful Korean king in royal armor surrounded by maps",
  "장수왕": "King Jangsu of Goguryeo in a royal court setting",
  "을지문덕": "General Eulji Mundeok of Goguryeo, a military commander in ancient Korean armor",
  "무용총": "ancient Goguryeo tomb mural showing people dancing, painted on stone walls",
  "근초고왕": "King Geunchogo of Baekje in a royal court",
  "성왕": "King Seong of Baekje in a Buddhist temple setting",
  "의자왕": "King Uija of Baekje at Baengmagang River",
  "박혁거세": "Park Hyeokgeose, the legendary founder of Silla kingdom",
  "진흥왕": "King Jinheung of Silla in a royal court with stone monuments",
  "선덕여왕": "Queen Seondeok of Silla, Korea's first female ruler, near Cheomseongdae observatory",
  "김유신": "General Kim Yu-sin of Silla in military armor",
  "계백": "General Gyebaek of Baekje in armor at a decisive battle",
  "단군왕검": "Dangun, the legendary founder of Gojoseon, in an ancient Korean mountain setting with dolmens",
  "세종대왕": "King Sejong the Great of Joseon studying Hunminjeongeum (Korean alphabet) scrolls",
  "이순신": "Admiral Yi Sun-sin of Joseon aboard a turtle ship (Geobukseon) in naval battle",
  "신사임당": "Shin Saimdang, Joseon artist and scholar, painting nature scenes",
  "유관순": "Yu Gwan-sun, Korean independence activist, holding a Korean flag",
  "안중근": "An Jung-geun, Korean independence activist in early 20th century setting",
  "정약용": "Jeong Yak-yong (Dasan), Joseon scholar and inventor, studying at a writing desk",
  "불국사": "Bulguksa Temple in Silla period, UNESCO heritage stone pagodas and wooden halls",
  "석굴암": "Seokguram Grotto, a magnificent stone Buddhist statue inside a granite cave",
  "첨성대": "Cheomseongdae observatory tower in Silla capital Gyeongju",
  "훈민정음": "the creation of Hunminjeongeum (the Korean alphabet) with scholars writing on paper scrolls",
  "한글": "Hangeul Korean alphabet characters being written with ink brushes on hanji paper",
  "거북선": "the Geobukseon (turtle ship), the iron-clad warship of Admiral Yi Sun-sin",
  "경복궁": "Gyeongbokgung Palace in Joseon dynasty, grand wooden architecture with curved roofs",
  "팔만대장경": "the Tripitaka Koreana (Palman Daejanggyeong), thousands of wooden printing blocks at Haeinsa Temple",
  "고려청자": "Goryeo celadon pottery with jade-green glaze and crane inlay designs",
  "조선백자": "Joseon white porcelain (baekja) with clean minimalist design on a wooden shelf",
  "금속활자": "Goryeo metal movable type printing blocks, the world's first metal type printing",
  "직지심체요절": "Jikji, the world's oldest metal-printed book, in Goryeo period monastic setting",
  "측우기": "Cheugugi (rain gauge), a Joseon scientific instrument for measuring rainfall",
  "앙부일구": "Angbuilgu (hemispherical sundial), a Joseon astronomical instrument in a palace courtyard",
  "살수대첩": "Battle of Salsu, Goguryeo general Eulji Mundeok defeating Sui dynasty army at a river",
  "3.1운동": "the March 1st Movement, Korean people waving white flags for independence in 1919",
  "임진왜란": "the Imjin War (Japanese invasion of 1592), Joseon defenders and turtle ships at sea",
  "병자호란": "the Manchu invasion of 1636, Joseon soldiers defending Namhansanseong fortress",
};

function getSubjectDescription(keywords: string[]): string {
  for (const kw of keywords) {
    if (SUBJECT_EN[kw]) return SUBJECT_EN[kw];
    // partial match
    for (const [kr, desc] of Object.entries(SUBJECT_EN)) {
      if (kw.includes(kr) || kr.includes(kw)) return desc;
    }
  }
  return "";
}

/**
 * Build a strict, era-grounded image generation prompt.
 *
 * @param era        Korean historical era, e.g. "조선시대".
 * @param topic      Specific topic within the era, e.g. "동명성왕 — 삼국시대".
 * @param keywords   Key subjects to depict, e.g. ["동명성왕", "고구려"].
 * @param styleHints Optional extra style guidance. Must not override era constraints.
 * @returns          A detailed English prompt for OpenAI image generation.
 */
export function buildQuizImagePrompt(
  era: string,
  topic: string,
  keywords: string[],
  styleHints?: string,
): string {
  const ctx = getEraContext(era);

  // Try to get a very specific English description for the main subject
  const subjectDesc = getSubjectDescription(keywords);
  const subjectList = keywords.slice(0, 3).join(", ");

  // Primary subject line — use the specific English description if available
  const primarySubject = subjectDesc
    ? subjectDesc
    : `${subjectList || topic} in Korean history`;

  // styleHints are merged only if they don't conflict with era constraints.
  const safeStyleHints = styleHints
    ? styleHints.replace(/warm|yellow|golden\s*hour|sepia/gi, "").trim()
    : "";

  const styleSection = safeStyleHints ? `Additional style: ${safeStyleHints}.` : "";

  const prompt = [
    // Primary subject — most important line
    `Educational illustration of ${primarySubject}.`,

    // Era grounding
    `Historical period: ${era} Korean history.`,

    // Background / environment
    `Scene: ${ctx.environment}.`,

    // Era-appropriate props
    `Show historically accurate Korean props: ${ctx.props}.`,

    // Style requirements
    `Style: clean educational illustration, detailed, high contrast, flat perspective, no text, no letters, no watermarks, no logos, no captions.`,

    // Palette
    `Color palette: ${ctx.palette}; cool to neutral tones.`,

    styleSection,

    // Hard negative constraints
    `STRICTLY EXCLUDE: ${ctx.forbiddenLandmarks}.`,
    `STRICTLY EXCLUDE: Southeast Asian temples (Angkor Wat, Borobudur, Prambanan), Hindu temples, Chinese architecture, Japanese architecture.`,
    `STRICTLY EXCLUDE: Indian subcontinent, Indonesia, Thailand, Cambodia architecture or landscapes.`,
    `STRICTLY EXCLUDE: any written text, letters, numbers, watermarks, logos, captions.`,
    `STRICTLY EXCLUDE: modern elements (cars, electricity poles, smartphones, contemporary clothing).`,
    `This image must depict KOREAN history ONLY. If uncertain, show a traditional Korean palace, Korean warrior, or Korean artifact.`,
  ]
    .filter(Boolean)
    .join(" ");

  return prompt;
}

// ---------------------------------------------------------------------------
// Relevance checker for Google Search results
// ---------------------------------------------------------------------------

const ALLOWED_DOMAINS = [
  "ko.wikipedia.org",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
  "museum.go.kr",
  "heritage.go.kr",
  "nrich.go.kr",
  "encykorea.aks.ac.kr",
  "db.history.go.kr",
];

const RELEVANCE_SIGNALS = [
  "korea", "korean", "한국", "조선", "고려", "삼국", "신라", "백제",
  "고구려", "고조선", "역사", "문화재", "heritage", "history",
];

/**
 * Returns true when a Google image URL is considered sufficiently relevant
 * to Korean history to be used without AI re-generation.
 *
 * Criteria:
 * 1. URL domain is in the trusted allow-list, OR
 * 2. URL path contains at least one Korean-history relevance signal.
 */
export function isImageRelevant(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    const domain = url.hostname.toLowerCase();
    const fullUrl = imageUrl.toLowerCase();

    if (ALLOWED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
      return true;
    }

    return RELEVANCE_SIGNALS.some((signal) => fullUrl.includes(signal));
  } catch {
    return false;
  }
}

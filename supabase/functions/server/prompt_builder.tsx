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

/**
 * Build a strict, era-grounded image generation prompt.
 *
 * @param era        Korean historical era, e.g. "조선시대".
 * @param topic      Specific topic within the era, e.g. "훈민정음 창제".
 * @param keywords   Key subjects to depict, e.g. ["세종대왕", "한글"].
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
  const subjectList = keywords.slice(0, 3).join(", ");

  // styleHints are merged only if they don't conflict with era constraints.
  // We strip any warm/yellow-tone bias from styleHints.
  const safeStyleHints = styleHints
    ? styleHints
        .replace(/warm|yellow|golden\s*hour|sepia/gi, "")
        .trim()
    : "";

  const styleSection = safeStyleHints
    ? `Additional style: ${safeStyleHints}.`
    : "";

  const prompt = [
    // Subject
    `Educational illustration of ${subjectList || topic} in ${era} Korean history.`,

    // Background / environment
    `Scene: ${ctx.environment}.`,

    // Era-appropriate props
    `Show historically accurate props: ${ctx.props}.`,

    // Topic context
    `The image must depict: ${topic}.`,

    // Style requirements
    `Style: clean educational illustration, detailed, high contrast, flat perspective, no text, no letters, no watermarks, no logos, no captions.`,

    // Palette
    `Color palette: ${ctx.palette}; cool to neutral tones, no warm or yellow bias.`,

    styleSection,

    // Negative constraints (comprehensive)
    `STRICTLY EXCLUDE: ${ctx.forbiddenLandmarks}.`,
    `STRICTLY EXCLUDE: Southeast Asian temples, Chinese architecture, Japanese architecture unless explicitly part of topic.`,
    `STRICTLY EXCLUDE: any written text, letters, numbers, watermarks, logos, captions, speech bubbles.`,
    `STRICTLY EXCLUDE: modern elements (cars, electricity poles, smartphones, computers, contemporary clothing).`,
    `STRICTLY EXCLUDE: non-Korean flags or national symbols unless historically directly relevant.`,
    `The image must be historically plausible for ${era} Korea only.`,
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

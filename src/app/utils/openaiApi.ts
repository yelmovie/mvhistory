// OpenAI GPT-4o-mini API Integration

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

// ── 세션 토큰 사용량 트래커 (과금 방지) ──────────────────────
// 앱 실행 중 누적 토큰 수를 메모리에 추적
// gpt-4o-mini 기준: 입력 $0.15/1M, 출력 $0.60/1M 토큰
const SESSION_TRACKER = {
  totalTokens: 0,
  callCount: 0,
  /** 세션당 최대 토큰 (약 $0.05 이내 — gpt-4o-mini 기준) */
  MAX_SESSION_TOKENS: 100_000,
};

/** 현재 세션 토큰 사용량 조회 */
export function getSessionUsage() {
  return {
    totalTokens: SESSION_TRACKER.totalTokens,
    callCount: SESSION_TRACKER.callCount,
    estimatedCostKRW: Math.round((SESSION_TRACKER.totalTokens / 1_000_000) * 0.60 * 1400),
    isOverLimit: SESSION_TRACKER.totalTokens >= SESSION_TRACKER.MAX_SESSION_TOKENS,
  };
}

// ── API 키 해석 ──────────────────────────────────────────────
// 우선순위: 환경변수(VITE_OPENAI_API_KEY) → localStorage(openai_api_key)
export function getOpenAIApiKey(): string {
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey && envKey.startsWith('sk-')) return envKey;
  return localStorage.getItem('openai_api_key') || '';
}

// ── 핵심 API 호출 ─────────────────────────────────────────────
export async function chatWithOpenAI(
  messages: ChatMessage[],
  apiKey?: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const key = apiKey || getOpenAIApiKey();
  if (!key) throw new Error('OpenAI API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.');

  // 세션 토큰 한도 초과 시 차단
  if (SESSION_TRACKER.totalTokens >= SESSION_TRACKER.MAX_SESSION_TOKENS) {
    throw new Error('SESSION_LIMIT');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 500 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message;
    if (response.status === 401) throw new Error('API 키가 올바르지 않습니다. 다시 확인해주세요.');
    if (response.status === 429) throw new Error('API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    throw new Error(msg || `API 오류: ${response.status}`);
  }

  const data: ChatResponse = await response.json();
  if (!data.choices?.length) throw new Error('응답이 없습니다.');

  // 토큰 사용량 누적 기록
  if (data.usage) {
    SESSION_TRACKER.totalTokens += data.usage.total_tokens;
    SESSION_TRACKER.callCount += 1;
  }

  return data.choices[0].message.content;
}

// ── API 키 유효성 검사 ─────────────────────────────────────────
export async function validateOpenAIApiKey(apiKey: string): Promise<boolean> {
  try {
    await chatWithOpenAI(
      [{ role: 'user', content: '안녕' }],
      apiKey
    );
    return true;
  } catch {
    return false;
  }
}

// ── 역사 인물 시스템 프롬프트 ─────────────────────────────────
export function createHistoricalCharacterPrompt(
  characterName: string,
  period: string,
  role?: string,
  description?: string
): string {
  return `당신은 한국의 역사 인물 "${characterName}"입니다.
시대: ${period}${role ? ` / 역할: ${role}` : ''}${description ? ` / 소개: ${description}` : ''}

초등학생(8-13세)과 대화하고 있습니다. 반드시 아래 규칙을 지켜주세요:

1. 초등학생이 이해하는 쉬운 단어와 짧은 문장(2-3문장) 사용
2. 존댓말을 쓰되 친근하고 따뜻한 톤 유지
3. 이모지를 적절히 사용해 친근감 표현
4. 역사적 사실을 재미있게, 정확하게 전달
5. 폭력·선정·정치적으로 민감한 내용 절대 금지
6. 어려운 한자어는 풀어서 설명`;
}

// ── 역사 인물 채팅 (CharacterChatScreen용) ──────────────────
export async function sendChatMessage(
  chatHistory: ChatMessage[],
  characterName: string,
  period: string,
  role?: string,
  description?: string
): Promise<string> {
  const systemPrompt = createHistoricalCharacterPrompt(characterName, period, role, description);

  // 시스템 메시지가 없으면 앞에 삽입
  const messages: ChatMessage[] =
    chatHistory[0]?.role === 'system'
      ? chatHistory
      : [{ role: 'system', content: systemPrompt }, ...chatHistory];

  return chatWithOpenAI(messages);
}

// ── 대화 히스토리 트림 ─────────────────────────────────────────
export function trimChatHistory(history: ChatMessage[], maxLength: number = 10): ChatMessage[] {
  if (history.length <= maxLength) return history;
  return history.slice(history.length - maxLength);
}

// ── 퀴즈 힌트 생성 ────────────────────────────────────────────
/**
 * 자이가르닉 효과 기반 단계별 개념 힌트
 *
 * 목표: 글자수·첫글자 같은 형태 힌트가 아니라,
 *       관련 역사 개념을 점진적으로 설명해 학습자가
 *       스스로 답을 떠올리도록 유도한다.
 *
 * 1단계: 넓은 역사적 배경 · 맥락 설명
 * 2단계: 좁혀진 구체적 연관 개념 설명
 * 3단계: 거의 답을 유추할 수 있는 핵심 설명
 *         (정답 단어는 절대 포함하지 않음)
 */
export async function generateQuizHint(
  question: string,
  answer: string,
  hintIndex: number,
  category?: string
): Promise<string> {
  const systemPrompt = `당신은 초등·중등 한국사 학습을 돕는 선생님입니다.
학습 목표: 자이가르닉 효과를 활용해, 학생이 오답을 경험하면서도 관련 개념을 자연스럽게 습득하게 합니다.

힌트 작성 규칙 (반드시 준수):
1. 정답 단어("${answer}")를 절대 그대로 말하지 마세요.
2. 글자 수, 첫 글자, 마지막 글자 같은 '형태 정보'는 절대 쓰지 마세요.
3. 대신 정답과 관련된 역사적 개념·사건·인물·배경을 설명하세요.
4. 초등학생이 이해할 수 있는 쉬운 말로, 2~3문장으로 작성하세요.
5. 힌트 단계가 높을수록 더 구체적이고 핵심에 가까운 설명을 하세요.`;

  const stepGuide = [
    `1단계 힌트: 이 문제와 관련된 넓은 역사적 배경이나 시대적 맥락을 설명해주세요. 정답을 직접 가리키지 않고, 관련 개념의 큰 그림을 그려주세요.`,
    `2단계 힌트: 정답과 더 직접적으로 연관된 구체적인 역사 개념이나 사건을 설명해주세요. 학생이 범위를 좁힐 수 있도록 도와주세요.`,
    `3단계 힌트: 학생이 정답을 거의 유추할 수 있도록 핵심 특징이나 역할을 설명해주세요. 단, 정답 단어 자체는 절대 쓰지 마세요.`,
  ];

  const apiKey = getOpenAIApiKey();

  if (apiKey) {
    try {
      return await chatWithOpenAI([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `문제: "${question}"
정답: "${answer}"
카테고리: ${category ?? '한국사'}

${stepGuide[Math.min(hintIndex - 1, 2)]}`,
        },
      ]);
    } catch { /* fallback으로 */ }
  }

  // API 키 없거나 실패 시 — quizData의 hints 배열을 활용한 개념 fallback
  const dataHint = question
    ? (hintIndex === 1
        ? `이 문제는 ${category ?? '한국사'} 시간에 배우는 내용이에요. 교과서에서 배운 개념을 떠올려보세요!`
        : hintIndex === 2
          ? `문제를 다시 천천히 읽어보세요. 문제 속에 중요한 단서가 숨어 있어요. 관련된 역사적 사건이나 인물을 생각해보세요!`
          : `이 개념은 우리 역사에서 매우 중요한 역할을 했어요. 문제에서 언급된 시대나 상황을 중심으로 다시 생각해보세요!`)
    : '관련 개념을 교과서에서 찾아보세요!';

  return dataHint;
}

// ── 인물별 기본 정보 (fallback용) ──────────────────────────────
export const historicalCharacters = {
  세종대왕: { period: '조선시대', description: '한글을 만드신 조선의 위대한 왕', personality: '백성을 사랑하고 학문을 중시하는', expertise: ['한글 창제', '과학 기술', '백성 사랑', '음악·예술'] },
  이순신:   { period: '조선시대', description: '임진왜란에서 나라를 구한 장군', personality: '나라를 위해 헌신하는', expertise: ['거북선', '전쟁 전략', '충성심', '리더십'] },
  신사임당: { period: '조선시대', description: '예술과 학문에 뛰어난 여성', personality: '자녀 교육에 힘쓰는', expertise: ['그림', '글씨', '자녀 교육', '효도'] },
  유관순:   { period: '근현대',   description: '독립운동에 앞장선 소녀', personality: '용감하고 나라를 사랑하는', expertise: ['3.1 운동', '독립 정신', '용기', '희생'] },
  김구:     { period: '근현대',   description: '대한민국 임시정부를 이끈 독립운동가', personality: '평화를 사랑하는', expertise: ['독립운동', '평화', '교육', '민주주의'] },
  장영실:   { period: '조선시대', description: '뛰어난 과학자이자 발명가', personality: '창의적이고 끈기있는', expertise: ['측우기', '해시계', '물시계', '과학 기술'] },
};

export function getWelcomeMessage(characterName: string): string {
  const c = historicalCharacters[characterName as keyof typeof historicalCharacters];
  if (!c) return `안녕하세요! 저는 역사 속 인물 ${characterName}입니다. 무엇이든 물어보세요! 😊`;
  const msgs = [
    `안녕하세요! 저는 ${c.period}의 ${characterName}입니다. 😊\n${c.description}이에요. 궁금한 것이 있나요?`,
    `반가워요! 나는 ${characterName}이라고 해요. ✨\n${c.expertise[0]}에 대해 이야기해볼까요?`,
    `어서오세요! ${characterName}입니다. 🌟\n여러분과 우리 역사에 대해 이야기하게 되어 기쁘네요!`,
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ── DALL-E 3 이미지 생성 ──────────────────────────────────────
export interface ImageGenerationResult {
  url: string;
  revisedPrompt?: string;
}

/**
 * OpenAI DALL-E 3 API로 이미지 생성
 * @param prompt  영문 또는 한국어 프롬프트
 * @param size    '1024x1024' | '1792x1024' | '1024x1792'
 * @param quality 'standard' | 'hd'
 */
export async function generateImage(
  prompt: string,
  size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024',
  quality: 'standard' | 'hd' = 'standard',
  apiKey?: string,
): Promise<ImageGenerationResult> {
  const key = apiKey || getOpenAIApiKey();
  if (!key) throw new Error('OpenAI API 키가 설정되지 않았습니다.');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality,
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message;
    if (response.status === 401) throw new Error('API 키가 올바르지 않습니다. 다시 확인해주세요.');
    if (response.status === 429) throw new Error('API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    if (response.status === 400) throw new Error(msg || '프롬프트가 콘텐츠 정책에 위배됩니다. 다른 내용으로 시도해주세요.');
    throw new Error(msg || `이미지 생성 오류: ${response.status}`);
  }

  const data = await response.json();
  const item = data?.data?.[0];
  if (!item?.url) throw new Error('이미지 URL을 받지 못했습니다.');
  return { url: item.url, revisedPrompt: item.revised_prompt };
}

/**
 * 한국어 굿즈 프롬프트를 DALL-E용 영문 프롬프트로 변환
 */
export async function translateGoodsPrompt(
  koreanPrompt: string,
  goodsType: string,
  apiKey?: string,
): Promise<string> {
  const key = apiKey || getOpenAIApiKey();
  if (!key) {
    // API 키 없을 때 기본 번역 시도
    return `Korean history themed ${goodsType} design: ${koreanPrompt}. 
Flat illustration style, vibrant colors, suitable for merchandise printing, 
clean background, high quality graphic design.`;
  }

  try {
    const result = await chatWithOpenAI(
      [
        {
          role: 'system',
          content: `You are a professional merchandise designer specializing in Korean history themes. 
Convert Korean design prompts into detailed English prompts for DALL-E 3 image generation.
The output should describe a ${goodsType} design with:
- Clear subject matter related to Korean history
- Flat illustration or graphic design style suitable for printing on merchandise
- Vibrant, visually appealing colors
- Clean composition with good contrast
- No text/letters in the image (purely visual)
Reply with ONLY the English prompt, no explanation.`,
        },
        {
          role: 'user',
          content: `Korean prompt: "${koreanPrompt}"\nGoods type: ${goodsType}`,
        },
      ],
      key,
    );
    return result.trim();
  } catch {
    return `Korean history themed ${goodsType} graphic design illustration: ${koreanPrompt}. 
Flat design style, bold colors, suitable for merchandise printing, 
transparent or white background, high resolution.`;
  }
}

// ── 하루 생성 횟수 관리 (localStorage) ────────────────────────
const DAILY_LIMIT_KEY = 'goods_daily_limit';
const DAILY_MAX = 3;

interface DailyLimit {
  date: string;   // YYYY-MM-DD
  count: number;
}

export function getDailyGenerationInfo(): { count: number; remaining: number; resetAt: string } {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(DAILY_LIMIT_KEY);
    const data: DailyLimit = raw ? JSON.parse(raw) : { date: today, count: 0 };
    if (data.date !== today) {
      // 날짜 바뀌면 리셋
      localStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify({ date: today, count: 0 }));
      return { count: 0, remaining: DAILY_MAX, resetAt: '내일 자정' };
    }
    const remaining = Math.max(0, DAILY_MAX - data.count);
    // 다음날 자정까지 남은 시간
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const diffH = Math.floor((midnight.getTime() - now.getTime()) / 3600000);
    const diffM = Math.floor(((midnight.getTime() - now.getTime()) % 3600000) / 60000);
    const resetAt = `${diffH}시간 ${diffM}분 후`;
    return { count: data.count, remaining, resetAt };
  } catch {
    return { count: 0, remaining: DAILY_MAX, resetAt: '내일' };
  }
}

export function incrementDailyCount(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(DAILY_LIMIT_KEY);
    const data: DailyLimit = raw ? JSON.parse(raw) : { date: today, count: 0 };
    const newData: DailyLimit = {
      date: today,
      count: data.date === today ? data.count + 1 : 1,
    };
    localStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(newData));
  } catch { /* ignore */ }
}

export function canGenerateToday(): boolean {
  return getDailyGenerationInfo().remaining > 0;
}

// ── ConversationManager (AIChat용) ────────────────────────────
export class ConversationManager {
  private messages: ChatMessage[] = [];
  private characterName: string;
  private turnCount: number = 0;

  constructor(characterName: string, period?: string, role?: string, description?: string) {
    this.characterName = characterName;
    const c = historicalCharacters[characterName as keyof typeof historicalCharacters];
    const p = period || c?.period || '';
    this.messages.push({
      role: 'system',
      content: createHistoricalCharacterPrompt(characterName, p, role, description),
    });
  }

  addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content });
    this.turnCount++;
  }

  addAssistantMessage(content: string): void {
    this.messages.push({ role: 'assistant', content });
  }

  getMessages(): ChatMessage[] { return this.messages; }
  getTurnCount(): number { return this.turnCount; }

  trimHistory(maxMessages: number = 10): void {
    if (this.messages.length > maxMessages + 1) {
      const [sys, ...rest] = this.messages;
      this.messages = [sys, ...rest.slice(-maxMessages)];
    }
  }

  getStats() {
    return {
      totalMessages: this.messages.length - 1,
      userMessages: this.messages.filter(m => m.role === 'user').length,
      assistantMessages: this.messages.filter(m => m.role === 'assistant').length,
      turnCount: this.turnCount,
    };
  }
}

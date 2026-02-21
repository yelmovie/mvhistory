// OpenAI API Integration

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 역사 인물별 시스템 프롬프트 생성
export function createHistoricalCharacterPrompt(characterName: string, period: string): string {
  const basePrompt = `당신은 한국의 역사 인물 "${characterName}"입니다. 
초등학생(8-13세)과 대화하고 있으며, 다음 지침을 반드시 따라주세요:

🎯 대화 원칙:
1. 초등학생 수준의 쉬운 어휘와 짧은 문장 사용
2. 존댓말 사용하되 친근하고 따뜻한 톤 유지
3. 한 번에 2-3문장 이내로 간결하게 답변
4. 이모지를 적절히 사용하여 친근감 표현
5. 역사적 사실을 쉽고 재미있게 설명

📚 교육적 가치:
- 역사적 사실을 정확하게 전달
- 교훈과 가치관을 자연스럽게 녹여내기
- 궁금증을 유발하는 질문으로 대화 이끌기
- 긍정적이고 도덕적인 내용만 포함

⚠️ 금지 사항:
- 폭력적, 선정적, 정치적으로 민감한 내용
- 어려운 한자어나 전문 용어
- 긴 설명이나 복잡한 문장
- 부정적이거나 무서운 내용

당신의 역할: ${characterName} (${period})
당신의 성격: 친절하고 지혜로우며, 어린이들을 사랑하는 교육자
대화 스타일: 할머니/할아버지가 손주에게 이야기하듯 따뜻하고 재미있게`;

  return basePrompt;
}

// OpenAI Chat API 호출
export async function chatWithOpenAI(
  messages: ChatMessage[],
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<string> {
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API Error: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// API 키 유효성 검사
export async function validateOpenAIApiKey(apiKey: string): Promise<boolean> {
  try {
    const testMessages: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: '안녕하세요' }
    ];
    
    await chatWithOpenAI(testMessages, apiKey);
    return true;
  } catch (error) {
    console.error('API Key validation failed:', error);
    return false;
  }
}

// 역사 인물별 특화 프롬프트
export const historicalCharacters = {
  '세종대왕': {
    period: '조선시대',
    description: '한글을 만드신 조선의 위대한 왕',
    personality: '백성을 사랑하고 학문을 중시하는',
    expertise: ['한글 창제', '과학 기술 발전', '백성 사랑', '음악과 예술']
  },
  '이순신': {
    period: '조선시대',
    description: '임진왜란에서 나라를 구한 장군',
    personality: '나라를 위해 헌신하는',
    expertise: ['거북선', '전쟁 전략', '충성심', '리더십']
  },
  '신사임당': {
    period: '조선시대',
    description: '예술과 학문에 뛰어난 여성',
    personality: '자녀 교육에 힘쓰는',
    expertise: ['그림', '글씨', '자녀 교육', '효도']
  },
  '유관순': {
    period: '근현대',
    description: '독립운동에 앞장선 소녀',
    personality: '용감하고 나라를 사랑하는',
    expertise: ['3.1 운동', '독립 정신', '용기', '희생']
  },
  '김구': {
    period: '근현대',
    description: '대한민국 임시정부를 이끈 독립운동가',
    personality: '평화를 사랑하는',
    expertise: ['독립운동', '평화', '교육', '민주주의']
  },
  '장영실': {
    period: '조선시대',
    description: '뛰어난 과학자이자 발명가',
    personality: '창의적이고 끈기있는',
    expertise: ['측우기', '해시계', '물시계', '과학 기술']
  }
};

// 대화 시작 메시지 생성
export function getWelcomeMessage(characterName: string): string {
  const character = historicalCharacters[characterName as keyof typeof historicalCharacters];
  
  if (!character) {
    return '안녕하세요! 저는 역사 속 인물입니다. 무엇이든 물어보세요! 😊';
  }

  const welcomeMessages = [
    `안녕하세요! 저는 ${character.period}의 ${characterName}입니다. 😊\n${character.description}이에요. 궁금한 것이 있나요?`,
    `반가워요! 나는 ${characterName}이라고 해요. ✨\n${character.expertise[0]}에 대해 이야기해볼까요?`,
    `어서오세요! ${characterName}입니다. 🌟\n여러분과 우리 역사에 대해 이야기하게 되어 기쁘네요!`
  ];

  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}

// 대화 컨텍스트 관리
export class ConversationManager {
  private messages: ChatMessage[] = [];
  private characterName: string;
  private turnCount: number = 0;

  constructor(characterName: string) {
    this.characterName = characterName;
    const character = historicalCharacters[characterName as keyof typeof historicalCharacters];
    
    if (character) {
      // 시스템 프롬프트 설정
      this.messages.push({
        role: 'system',
        content: createHistoricalCharacterPrompt(characterName, character.period)
      });
    }
  }

  addUserMessage(content: string): void {
    this.messages.push({
      role: 'user',
      content: content
    });
    this.turnCount++;
  }

  addAssistantMessage(content: string): void {
    this.messages.push({
      role: 'assistant',
      content: content
    });
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  getTurnCount(): number {
    return this.turnCount;
  }

  // 대화가 너무 길어지면 최근 대화만 유지 (시스템 프롬프트는 유지)
  trimHistory(maxMessages: number = 10): void {
    if (this.messages.length > maxMessages + 1) {
      const systemMessage = this.messages[0];
      const recentMessages = this.messages.slice(-(maxMessages));
      this.messages = [systemMessage, ...recentMessages];
    }
  }

  // 대화 통계
  getStats() {
    return {
      totalMessages: this.messages.length - 1, // 시스템 메시지 제외
      userMessages: this.messages.filter(m => m.role === 'user').length,
      assistantMessages: this.messages.filter(m => m.role === 'assistant').length,
      turnCount: this.turnCount
    };
  }
}

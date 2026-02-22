import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";
import {
  uploadImageToStorage,
  detectContentType,
  extensionForContentType,
} from "./storage_helper.tsx";
import {
  buildCacheKey,
  buildQuizImagePrompt,
} from "./prompt_builder.tsx";
import { checkRateLimit, retryAfterSeconds, pruneExpiredEntries } from "./rate_limiter.tsx";

const app = new Hono();

// ---------------------------------------------------------------------------
// Config from environment (Edge Function Secrets)
// ---------------------------------------------------------------------------
const STORAGE_BUCKET = Deno.env.get("STORAGE_BUCKET") ?? "quiz-images";
const MAX_RETRIES = parseInt(Deno.env.get("IMAGE_MAX_RETRIES") ?? "2", 10);
const RATE_LIMIT_PER_MIN = parseInt(Deno.env.get("IMAGE_RATE_LIMIT_PER_MIN") ?? "30", 10);
const OPENAI_API_KEY = () => Deno.env.get("OPENAI_API_KEY") ?? "";
const SUPABASE_URL = () => Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Fallback placeholder shown when all generation attempts fail
const PLACEHOLDER_IMAGE_URL =
  "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1024&q=80";

// Supabase DB client (service role) for quiz_images table
function dbClient() {
  return createClient(SUPABASE_URL(), SERVICE_ROLE_KEY());
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-48be01a5/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== User Profile ====================

// Get user profile
app.get("/make-server-48be01a5/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const profileKey = `user:${userId}:profile`;
    const profile = await kv.get(profileKey);
    
    if (!profile) {
      // Create default profile
      const defaultProfile = {
        userId,
        name: "학습자",
        email: "",
        level: 1,
        exp: 0,
        maxExp: 100,
        points: 0,
        streak: 0,
        lastLoginDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await kv.set(profileKey, defaultProfile);
      return c.json({ success: true, data: defaultProfile });
    }
    
    return c.json({ success: true, data: profile });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user profile
app.put("/make-server-48be01a5/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const updates = await c.req.json();
    const profileKey = `user:${userId}:profile`;
    
    const currentProfile = await kv.get(profileKey);
    if (!currentProfile) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    
    const updatedProfile = { ...currentProfile, ...updates };
    await kv.set(profileKey, updatedProfile);
    
    return c.json({ success: true, data: updatedProfile });
  } catch (error: any) {
    console.error("Update user profile error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==================== Quiz Progress ====================

// Save quiz result
app.post("/make-server-48be01a5/quiz/result", async (c) => {
  try {
    const result = await c.req.json();
    const { userId, period, questionId, isCorrect, hintsUsed, earnedPoints } = result;
    
    const resultKey = `quiz:${userId}:${period}:${questionId}`;
    const resultData = {
      userId,
      period,
      questionId,
      isCorrect,
      hintsUsed,
      earnedPoints,
      timestamp: new Date().toISOString()
    };
    
    await kv.set(resultKey, resultData);
    
    // Update user stats
    const profileKey = `user:${userId}:profile`;
    const profile = await kv.get(profileKey);
    
    if (profile) {
      const updatedProfile = {
        ...profile,
        points: (profile.points || 0) + earnedPoints,
        exp: (profile.exp || 0) + earnedPoints
      };
      
      // Check level up
      if (updatedProfile.exp >= updatedProfile.maxExp) {
        updatedProfile.level = (profile.level || 1) + 1;
        updatedProfile.exp = updatedProfile.exp - updatedProfile.maxExp;
        updatedProfile.maxExp = Math.floor(updatedProfile.maxExp * 1.5);
      }
      
      await kv.set(profileKey, updatedProfile);
    }
    
    return c.json({ success: true, data: resultData });
  } catch (error: any) {
    console.error("Save quiz result error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get quiz history for a period
app.get("/make-server-48be01a5/quiz/:userId/:period", async (c) => {
  try {
    const userId = c.req.param("userId");
    const period = c.req.param("period");
    
    const prefix = `quiz:${userId}:${period}:`;
    const results = await kv.getByPrefix(prefix);
    
    return c.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Get quiz history error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==================== Character Cards ====================

// Unlock character card
app.post("/make-server-48be01a5/card/unlock", async (c) => {
  try {
    const { userId, characterId, characterName, period, unlockedBy } = await c.req.json();
    
    const cardKey = `card:${userId}:${characterId}`;
    const cardData = {
      userId,
      characterId,
      characterName,
      period,
      unlockedBy, // 'quiz' or 'chat'
      unlockedAt: new Date().toISOString()
    };
    
    await kv.set(cardKey, cardData);
    
    return c.json({ success: true, data: cardData });
  } catch (error: any) {
    console.error("Unlock card error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get all unlocked cards for user
app.get("/make-server-48be01a5/cards/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const prefix = `card:${userId}:`;
    const cards = await kv.getByPrefix(prefix);
    
    return c.json({ success: true, data: cards, total: cards.length });
  } catch (error: any) {
    console.error("Get cards error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Check if card is unlocked
app.get("/make-server-48be01a5/card/:userId/:characterId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const characterId = c.req.param("characterId");
    
    const cardKey = `card:${userId}:${characterId}`;
    const card = await kv.get(cardKey);
    
    return c.json({ success: true, unlocked: !!card, data: card });
  } catch (error: any) {
    console.error("Check card error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==================== Chat History ====================

// Save chat message
app.post("/make-server-48be01a5/chat/message", async (c) => {
  try {
    const { userId, characterName, role, content } = await c.req.json();
    
    const timestamp = Date.now();
    const messageKey = `chat:${userId}:${characterName}:${timestamp}`;
    const messageData = {
      userId,
      characterName,
      role,
      content,
      timestamp: new Date(timestamp).toISOString()
    };
    
    await kv.set(messageKey, messageData);
    
    return c.json({ success: true, data: messageData });
  } catch (error: any) {
    console.error("Save chat message error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get chat history with character
app.get("/make-server-48be01a5/chat/:userId/:characterName", async (c) => {
  try {
    const userId = c.req.param("userId");
    const characterName = c.req.param("characterName");
    
    const prefix = `chat:${userId}:${characterName}:`;
    const messages = await kv.getByPrefix(prefix);
    
    // Sort by timestamp
    messages.sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return c.json({ success: true, data: messages });
  } catch (error: any) {
    console.error("Get chat history error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==================== Leaderboard ====================

// Get top users by points
app.get("/make-server-48be01a5/leaderboard", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    
    const prefix = "user:";
    const allUsers = await kv.getByPrefix(prefix);
    
    // Filter only profiles and sort by points
    const profiles = allUsers
      .filter((item: any) => item.key.endsWith(":profile"))
      .sort((a: any, b: any) => (b.value.points || 0) - (a.value.points || 0))
      .slice(0, limit)
      .map((item: any, index: number) => ({
        rank: index + 1,
        ...item.value
      }));
    
    return c.json({ success: true, data: profiles });
  } catch (error: any) {
    console.error("Get leaderboard error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==================== Statistics ====================

// Get user statistics
app.get("/make-server-48be01a5/stats/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    // Get profile
    const profile = await kv.get(`user:${userId}:profile`);
    
    // Get total cards
    const cards = await kv.getByPrefix(`card:${userId}:`);
    
    // Get quiz results
    const quizResults = await kv.getByPrefix(`quiz:${userId}:`);
    const correctAnswers = quizResults.filter((r: any) => r.value.isCorrect).length;
    const totalQuestions = quizResults.length;
    
    // Get chat messages
    const chatMessages = await kv.getByPrefix(`chat:${userId}:`);
    const totalConversations = new Set(
      chatMessages.map((m: any) => m.value.characterName)
    ).size;
    
    const stats = {
      profile,
      totalCards: cards.length,
      totalCardsAvailable: 210,
      totalQuestions,
      correctAnswers,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0,
      totalConversations,
      totalMessages: chatMessages.length
    };
    
    return c.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Get stats error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==================== Completed Questions Tracking ====================

// Mark question as completed
app.post("/make-server-48be01a5/quiz/completed", async (c) => {
  try {
    const { userId, questionId, period } = await c.req.json();
    
    if (!userId || !questionId) {
      return c.json({ success: false, error: "userId and questionId are required" }, 400);
    }

    const completedKey = `user:${userId}:completed`;
    const completedQuestions = await kv.get(completedKey) || { questions: [] };
    
    // Add question to completed list if not already there
    if (!completedQuestions.questions.includes(questionId)) {
      completedQuestions.questions.push(questionId);
      completedQuestions.lastUpdated = new Date().toISOString();
      
      await kv.set(completedKey, completedQuestions);
    }

    return c.json({ success: true, data: completedQuestions });
  } catch (error: any) {
    console.error("Mark question completed error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get completed questions for user
app.get("/make-server-48be01a5/quiz/completed/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const completedKey = `user:${userId}:completed`;
    const completedQuestions = await kv.get(completedKey) || { questions: [] };
    
    return c.json({ success: true, data: completedQuestions });
  } catch (error: any) {
    console.error("Get completed questions error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reset completed questions (for testing)
app.delete("/make-server-48be01a5/quiz/completed/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const completedKey = `user:${userId}:completed`;
    
    await kv.set(completedKey, { questions: [], lastUpdated: new Date().toISOString() });
    
    return c.json({ success: true, message: "Completed questions reset" });
  } catch (error: any) {
    console.error("Reset completed questions error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==================== Quiz Hints (OpenAI GPT-4o-mini) ====================

// Generate AI-powered quiz hint
app.post("/make-server-48be01a5/quiz/hint", async (c) => {
  try {
    const { question, answer, hintLevel, category } = await c.req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      // Return basic hints if API key is not available
      const defaultHints = [
        `이 문제는 ${category}와(과) 관련이 있어요. 천천히 생각해보세요!`,
        `답은 "${answer.length}글자"입니다. 조금만 더 생각해보세요!`,
        `정답은 "${answer[0]}"로 시작하는 ${answer.length}글자 단어예요!`
      ];
      return c.json({ 
        success: true, 
        hint: defaultHints[hintLevel - 1] || defaultHints[0],
        source: 'default'
      });
    }

    // Define hint prompts based on level
    const hintPrompts: Record<number, string> = {
      1: `다음 역사 퀴즈에 대한 **광범위하고 간접적인** 힌트를 초등학생이 이해할 수 있도록 제공해주세요.
      
질문: ${question}
정답: ${answer}
카테고리: ${category}

힌트 요구사항:
- 답을 직접적으로 언급하지 말고, 관련된 시대나 배경을 설명해주세요
- 초등학생이 이해할 수 있는 쉬운 말로 작성해주세요
- 1-2문장으로 간단히 작성해주세요
- 호기심을 자극하는 흥미로운 표현을 사용해주세요
- 반드시 존댓말을 사용하세요`,

      2: `다음 역사 퀴즈에 대한 **중간 수준의 구체적인** 힌트를 초등학생이 이해할 수 있도록 제공해주세요.

질문: ${question}
정답: ${answer}
카테고리: ${category}

힌트 요구사항:
- 답과 더 가까운 구체적인 정보를 제공해주세요
- 답의 특징이나 중요한 키워드를 암시해주세요
- 초등학생이 이해할 수 있는 쉬운 말로 작성해주세요
- 1-2문장으로 간단히 작성해주세요
- 반드시 존댓말을 사용하세요`,

      3: `다음 역사 퀴즈에 대한 **매우 구체적이고 세부적인** 힌트를 초등학생이 이해할 수 있도록 제공해주세요.

질문: ${question}
정답: ${answer}
카테고리: ${category}

힌트 요구사항:
- 답을 거의 알 수 있을 정도로 구체적인 힌트를 제공해주세요
- 답의 글자 수, 첫 글자, 또는 핵심 정보를 포함해주세요
- 초등학생이 이해할 수 있는 쉬운 말로 작성해주세요
- 1-2문장으로 간단히 작성해주세요
- 반드시 존댓말을 사용하세요`
    };

    const prompt = hintPrompts[hintLevel] || hintPrompts[1];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 초등학생을 위한 역사 교육 전문가입니다. 학생들이 역사를 재미있게 배울 수 있도록 친근하고 이해하기 쉬운 힌트를 제공합니다. 반드시 존댓말을 사용하고, 짧고 명확하게 답변하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const hint = data.choices?.[0]?.message?.content?.trim();

    if (!hint) {
      throw new Error('힌트를 받지 못했습니다.');
    }

    return c.json({ 
      success: true, 
      hint,
      source: 'openai'
    });
  } catch (error: any) {
    console.error('Generate hint error:', error);
    
    // Return fallback hint on error
    const { answer, hintLevel, category } = await c.req.json().catch(() => ({}));
    const defaultHints = [
      `이 문제는 ${category || '한국사'}와(과) 관련이 있어요. 천천히 생각해보세요!`,
      `답은 "${answer?.length || '여러'}글자"입니다. 조금만 더 생각해보세요!`,
      `정답의 첫 글자는 "${answer?.[0] || '?'}"입니다!`
    ];
    
    return c.json({ 
      success: true, 
      hint: defaultHints[(hintLevel || 1) - 1] || defaultHints[0],
      source: 'fallback',
      error: error.message 
    });
  }
});

// ==================== OpenAI Image Generation ====================

// Generate character image using OpenAI DALL-E
app.post("/make-server-48be01a5/generate-character-image", async (c) => {
  try {
    const { characterName, characterPeriod, characterRole } = await c.req.json();
    
    if (!characterName || !characterPeriod || !characterRole) {
      return c.json({ 
        error: 'Missing required parameters: characterName, characterPeriod, characterRole' 
      }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('OpenAI API key not configured');
      return c.json({ 
        error: 'OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.' 
      }, 500);
    }

    // 초등학생 친화적인 프롬프트 생성
    const prompt = `A friendly and educational portrait illustration of ${characterName}, a historical Korean figure from ${characterPeriod} period, who was ${characterRole}. The style should be:
- Child-friendly and approachable
- Traditional Korean historical clothing (hanbok)
- Dignified but warm expression
- Clean and simple background
- Educational illustration style suitable for elementary school students
- Professional portrait orientation
- Warm colors and soft lighting
- No text or words in the image`;

    console.log('Generating image for:', characterName);

    // Call OpenAI DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return c.json({ 
        error: `OpenAI API 오류: ${response.status}`,
        details: errorData 
      }, response.status);
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    if (!imageUrl) {
      return c.json({ 
        error: 'No image URL returned from API' 
      }, 500);
    }

    console.log('Successfully generated image for:', characterName);
    
    return c.json({ 
      imageUrl,
      characterName,
      prompt 
    });
    
  } catch (error: any) {
    console.error('Generate image error:', error);
    return c.json({ 
      error: error.message 
    }, 500);
  }
});

// ==================== Image Search (Google Custom Search API) ====================

// Google Custom Search API를 사용하여 퀴즈/인물 이미지를 검색합니다.
// 필요한 환경변수: GOOGLE_API_KEY, GOOGLE_CX
async function searchGoogleImage(query: string): Promise<string | null> {
  const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY') ?? Deno.env.get('GOOGLE_API_KEY');
  const cx = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID') ?? Deno.env.get('GOOGLE_CX');

  if (!apiKey || !cx) {
    console.warn('GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID not configured');
    return null;
  }

  const searchQuery = `${query} 한국 역사`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=3&safe=active&imgSize=large&gl=kr&lr=lang_ko`;

  const response = await fetch(url);
  if (!response.ok) {
    const errText = await response.text();
    console.error('Google Custom Search API error:', response.status, errText);
    return null;
  }

  const data = await response.json();
  const items: Array<{ link: string }> = data.items || [];
  if (items.length === 0) return null;

  // 첫 번째 이미지 URL 반환
  return items[0].link;
}

// 인물 이미지 Google 검색 엔드포인트
app.post("/make-server-48be01a5/search-character-image", async (c) => {
  try {
    const { characterName, period } = await c.req.json();

    if (!characterName) {
      return c.json({ error: 'Missing required parameter: characterName' }, 400);
    }

    // 캐시 확인
    const cacheKey = `image:character:${characterName}`;
    const cached = await kv.get(cacheKey);
    if (cached && cached.url) {
      return c.json({ success: true, imageUrl: cached.url, source: 'cache' });
    }

    const query = period ? `${characterName} ${period} 역사 인물` : `${characterName} 역사 인물 한국`;
    const imageUrl = await searchGoogleImage(query);

    if (imageUrl) {
      await kv.set(cacheKey, { url: imageUrl, query, timestamp: new Date().toISOString() });
      return c.json({ success: true, imageUrl, source: 'google' });
    }

    // 폴백: 기본 이미지
    return c.json({
      success: true,
      imageUrl: 'https://images.unsplash.com/photo-1578648693974-9438ebc063bb?w=800&q=80',
      source: 'fallback'
    });
  } catch (error: any) {
    console.error('Search character image error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get appropriate image for quiz question
app.post("/make-server-48be01a5/search-image", async (c) => {
  try {
    const { query, questionId } = await c.req.json();
    
    if (!query) {
      return c.json({ 
        error: 'Missing required parameter: query' 
      }, 400);
    }

    // Check if image is already cached
    const cacheKey = `image:quiz:${questionId}`;
    const cachedImage = await kv.get(cacheKey);
    
    if (cachedImage && cachedImage.url) {
      console.log('Returning cached image for question:', questionId);
      return c.json({ 
        success: true,
        imageUrl: cachedImage.url,
        source: 'cache'
      });
    }

    // Google Custom Search API로 실제 이미지 검색
    const googleImageUrl = await searchGoogleImage(query);

    if (googleImageUrl) {
      await kv.set(cacheKey, {
        url: googleImageUrl,
        query,
        source: 'google',
        timestamp: new Date().toISOString()
      });
      console.log('Google 이미지 검색 성공:', query);
      return c.json({
        success: true,
        imageUrl: googleImageUrl,
        query,
        source: 'google'
      });
    }

    // Google API 키가 없거나 검색 실패 시 큐레이션 이미지 폴백
    const imageMap: Record<string, string> = {
      '고조선': 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&q=80',
      '단군': 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&q=80',
      '고구려': 'https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1200&q=80',
      '백제': 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1200&q=80',
      '신라': 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1200&q=80',
      '불국사': 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1200&q=80',
      '첨성대': 'https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1200&q=80',
      '석굴암': 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1200&q=80',
      '통일신라': 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=1200&q=80',
      '고려': 'https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1200&q=80',
      '청자': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80',
      '팔만대장경': 'https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=1200&q=80',
      '조선': 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80',
      '경복궁': 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80',
      '창덕궁': 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80',
      '덕수궁': 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80',
      '궁궐': 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80',
      '세종': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '한글': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '훈민정음': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '거북선': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '이순신': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '임진왜란': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '병자호란': 'https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=1200&q=80',
      '독립': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '3.1': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '만세': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '한국전쟁': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '6.25': 'https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=1200&q=80',
      '한옥': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '백자': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80',
      '도자기': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80',
      '직지': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '금속활자': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '측우기': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '앙부일구': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
      '혼천의': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'
    };

    let imageUrl = 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&q=80';
    let matchedKey = 'default';
    
    for (const [keyword, url] of Object.entries(imageMap)) {
      if (query.includes(keyword)) {
        imageUrl = url;
        matchedKey = keyword;
        break;
      }
    }

    await kv.set(cacheKey, {
      url: imageUrl,
      query,
      matchedKey,
      timestamp: new Date().toISOString()
    });
    
    return c.json({ 
      success: true,
      imageUrl,
      query,
      matchedKey,
      source: 'curated'
    });
    
  } catch (error: any) {
    console.error('Search image error:', error);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// Get cached image for a question
app.get("/make-server-48be01a5/quiz-image/:questionId", async (c) => {
  try {
    const questionId = c.req.param("questionId");
    const cacheKey = `image:quiz:${questionId}`;
    const cachedImage = await kv.get(cacheKey);
    
    if (cachedImage && cachedImage.url) {
      return c.json({ 
        success: true,
        imageUrl: cachedImage.url,
        query: cachedImage.query,
        timestamp: cachedImage.timestamp
      });
    }
    
    return c.json({ 
      success: false,
      error: 'No cached image found'
    }, 404);
  } catch (error: any) {
    console.error('Get quiz image error:', error);
    return c.json({ 
      success: false,
      error: error.message 
    }, 500);
  }
});

// ==================== Quiz Image Pipeline (generate-once, reuse-forever) ====================

/**
 * Helper: sleep for `ms` milliseconds (for exponential backoff).
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempt to generate an image via OpenAI gpt-image-1 (low quality).
 * Returns image bytes, or throws on failure.
 * gpt-image-1 returns URL only (no b64_json), so we fetch the URL to get bytes.
 */
async function generateOpenAIImage(prompt: string): Promise<Uint8Array> {
  const apiKey = OPENAI_API_KEY();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();

  // gpt-image-1 returns base64 in data[0].b64_json
  const b64 = data?.data?.[0]?.b64_json;
  if (b64) {
    const binaryStr = atob(b64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  }

  // Fallback: if URL is returned, fetch the bytes
  const imageUrl = data?.data?.[0]?.url;
  if (imageUrl) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Failed to fetch generated image: ${imgRes.status}`);
    const buffer = await imgRes.arrayBuffer();
    return new Uint8Array(buffer);
  }

  throw new Error("OpenAI returned no image data (no b64_json, no url)");
}

/**
 * Core image resolution pipeline for a single cache key.
 * 1. Google Search (if available) with relevance check.
 * 2. OpenAI gpt-image-1-mini (low) as fallback.
 * 3. Upload to Supabase Storage.
 * 4. Upsert DB row to status=ready.
 * Returns the public URL.
 */
async function resolveAndStoreImage(
  cacheKey: string,
  quizItemId: string | undefined,
  era: string,
  topic: string,
  keywords: string[],
  styleHints: string | undefined,
  prompt: string,
): Promise<string> {
  const db = dbClient();
  let imageBytes: Uint8Array | null = null;

  // --- OpenAI gpt-image-1-mini (low, $0.005/image) with retries ---
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(500 * Math.pow(2, attempt - 1)); // 500ms, 1000ms
    }
    try {
      imageBytes = await generateOpenAIImage(prompt);
      break;
    } catch (err) {
      lastErr = err;
      console.error(`OpenAI attempt ${attempt + 1} failed:`, err);
    }
  }

  if (!imageBytes) {
    // All retries exhausted — mark failed and return placeholder
    await db.from("quiz_images").upsert(
      {
        cache_key: cacheKey,
        quiz_item_id: quizItemId ?? null,
        prompt,
        model: "gpt-image-1",
        quality: "low",
        size: "1024x1024",
        storage_bucket: STORAGE_BUCKET,
        storage_path: `${cacheKey}/v1.png`,
        public_url: PLACEHOLDER_IMAGE_URL,
        status: "failed",
        error: String(lastErr),
      },
      { onConflict: "cache_key" },
    );
    return PLACEHOLDER_IMAGE_URL;
  }

  // --- Upload to Supabase Storage ---
  const contentType = detectContentType(imageBytes);
  const ext = extensionForContentType(contentType);
  const storagePath = `${cacheKey}/v1.${ext}`;

  const publicUrl = await uploadImageToStorage(
    imageBytes,
    storagePath,
    STORAGE_BUCKET,
    contentType,
  );

  // --- Persist to DB ---
  await db.from("quiz_images").upsert(
    {
      cache_key: cacheKey,
      quiz_item_id: quizItemId ?? null,
      prompt,
      model: "gpt-image-1",
      quality: "low",
      size: "1024x1024",
      storage_bucket: STORAGE_BUCKET,
      storage_path: storagePath,
      public_url: publicUrl,
      status: "ready",
      error: null,
    },
    { onConflict: "cache_key" },
  );

  console.log(`Image stored [openai] → ${publicUrl}`);
  return publicUrl;
}

// Prune rate limiter entries every ~100 requests to avoid memory leak
let _pruneCounter = 0;

/**
 * POST /make-server-48be01a5/quiz-image/generate
 *
 * Body: { quizItemId?: string, era: string, topic: string, keywords: string[], styleHints?: string }
 * Returns: { publicUrl, cacheKey, status, source }
 *
 * Idempotent: same inputs return cached result without re-generating.
 */
app.post("/make-server-48be01a5/quiz-image/generate", async (c) => {
  // Rate limiting
  const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ?? "unknown";

  if (++_pruneCounter % 100 === 0) pruneExpiredEntries();

  if (!checkRateLimit(ip, RATE_LIMIT_PER_MIN)) {
    return c.json(
      {
        error: "Rate limit exceeded. Please slow down.",
        retryAfter: retryAfterSeconds(ip),
      },
      429,
    );
  }

  try {
    const body = await c.req.json();
    const { quizItemId, era, topic, keywords, styleHints } = body as {
      quizItemId?: string;
      era: string;
      topic: string;
      keywords: string[];
      styleHints?: string;
    };

    if (!era || !topic || !Array.isArray(keywords) || keywords.length === 0) {
      return c.json({ error: "Missing required fields: era, topic, keywords" }, 400);
    }

    // Build deterministic cache key
    const cacheKey = await buildCacheKey(era, topic, keywords);

    // --- Check DB cache first ---
    const db = dbClient();
    const { data: existing } = await db
      .from("quiz_images")
      .select("*")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (existing) {
      if (existing.status === "ready") {
        return c.json({
          publicUrl: existing.public_url,
          cacheKey,
          status: "ready",
          source: "db-cache",
        });
      }
      if (existing.status === "pending") {
        return c.json(
          {
            publicUrl: PLACEHOLDER_IMAGE_URL,
            cacheKey,
            status: "pending",
            message: "Image is being generated, please retry in a few seconds.",
          },
          202,
        );
      }
      // status=failed → retry generation
    }

    // Mark as pending before long async work (prevents duplicate generation on parallel requests)
    const prompt = buildQuizImagePrompt(era, topic, keywords, styleHints);
    await db.from("quiz_images").upsert(
      {
        cache_key: cacheKey,
        quiz_item_id: quizItemId ?? null,
        prompt,
        model: "gpt-image-1",
        quality: "low",
        size: "1024x1024",
        storage_bucket: STORAGE_BUCKET,
        storage_path: `${cacheKey}/v1.png`,
        public_url: PLACEHOLDER_IMAGE_URL,
        status: "pending",
        error: null,
      },
      { onConflict: "cache_key" },
    );

    // Resolve image (Google → AI → Storage → DB)
    const publicUrl = await resolveAndStoreImage(
      cacheKey,
      quizItemId,
      era,
      topic,
      keywords,
      styleHints,
      prompt,
    );

    return c.json({ publicUrl, cacheKey, status: "ready", source: "generated" });
  } catch (error: any) {
    console.error("quiz-image/generate error:", error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /make-server-48be01a5/quiz-image/cache?cacheKey=...
 * Debug endpoint: returns the DB row for a given cache key.
 */
app.get("/make-server-48be01a5/quiz-image/cache", async (c) => {
  try {
    const cacheKey = c.req.query("cacheKey");
    if (!cacheKey) {
      return c.json({ error: "Missing query param: cacheKey" }, 400);
    }

    const db = dbClient();
    const { data, error } = await db
      .from("quiz_images")
      .select("*")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return c.json({ error: "No record found for this cacheKey" }, 404);
    }

    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ==================== End of Quiz Image Pipeline ====================

Deno.serve(app.fetch);

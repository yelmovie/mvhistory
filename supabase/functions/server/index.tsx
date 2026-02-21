import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

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

// ==================== Image Search (Curated Images) ====================

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

    // Map Korean queries to curated Unsplash image URLs
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

    // Find matching image or use default
    let imageUrl = 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=1200&q=80'; // Default Korean traditional
    let matchedKey = 'default';
    
    for (const [keyword, url] of Object.entries(imageMap)) {
      if (query.includes(keyword)) {
        imageUrl = url;
        matchedKey = keyword;
        break;
      }
    }

    console.log(`Found image for keyword "${matchedKey}" from query:`, query);

    // Cache the result
    await kv.set(cacheKey, {
      url: imageUrl,
      query: query,
      matchedKey: matchedKey,
      timestamp: new Date().toISOString()
    });

    console.log('Successfully cached image for question:', questionId);
    
    return c.json({ 
      success: true,
      imageUrl,
      query: query,
      matchedKey: matchedKey,
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

Deno.serve(app.fetch);

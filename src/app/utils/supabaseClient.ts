// Supabase Client for Korean History Learning App
const _supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngvsfcekfzzykvcsjktp.supabase.co';
const _anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndnNmY2VrZnp6eWt2Y3Nqa3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDYyMDksImV4cCI6MjA4NjQ4MjIwOX0.49FGaOySPc63Pxf6G-QS5T3LVoAie3XWGJsBY1djSZY';

const API_BASE_URL = `${_supabaseUrl}/functions/v1/make-server-48be01a5`;

// Helper function for API calls — 서버 미배포(404/405) 시 조용히 실패
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${_anonKey}`,
      ...options?.headers,
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    // 서버 미배포 상황이므로 콘솔 오류 없이 조용히 throw
    throw Object.assign(new Error(`API ${response.status}`), { silent: true, status: response.status });
  }

  return response.json();
}

// ==================== User Profile ====================

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  level: number;
  exp: number;
  maxExp: number;
  points: number;
  streak: number;
  lastLoginDate: string;
  createdAt: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await apiCall<{ success: boolean; data: UserProfile }>(`/user/${userId}`);
  return response.data;
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const response = await apiCall<{ success: boolean; data: UserProfile }>(
    `/user/${userId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    }
  );
  return response.data;
}

// Update streak on login
export async function updateLoginStreak(userId: string): Promise<UserProfile> {
  const profile = await getUserProfile(userId);
  const lastLogin = new Date(profile.lastLoginDate);
  const today = new Date();
  
  // Check if last login was yesterday
  const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
  
  let newStreak = profile.streak;
  if (daysDiff === 1) {
    // Consecutive day
    newStreak = profile.streak + 1;
  } else if (daysDiff > 1) {
    // Streak broken
    newStreak = 1;
  }
  // If daysDiff === 0, same day, no change
  
  return updateUserProfile(userId, {
    streak: newStreak,
    lastLoginDate: today.toISOString(),
  });
}

// ==================== Quiz Progress ====================

export interface QuizResult {
  userId: string;
  period: string;
  questionId: number;
  isCorrect: boolean;
  hintsUsed: number;
  earnedPoints: number;
  timestamp: string;
}

export async function saveQuizResult(result: Omit<QuizResult, 'timestamp'>): Promise<QuizResult> {
  const response = await apiCall<{ success: boolean; data: QuizResult }>(
    '/quiz/result',
    {
      method: 'POST',
      body: JSON.stringify(result),
    }
  );
  return response.data;
}

export async function getQuizHistory(userId: string, period: string): Promise<QuizResult[]> {
  const response = await apiCall<{ success: boolean; data: QuizResult[] }>(
    `/quiz/${userId}/${period}`
  );
  return response.data;
}

// ==================== Character Cards ====================

export interface CharacterCard {
  userId: string;
  characterId: string;
  characterName: string;
  period: string;
  unlockedBy: 'quiz' | 'chat';
  unlockedAt: string;
}

export async function unlockCharacterCard(card: Omit<CharacterCard, 'unlockedAt'>): Promise<CharacterCard> {
  const response = await apiCall<{ success: boolean; data: CharacterCard }>(
    '/card/unlock',
    {
      method: 'POST',
      body: JSON.stringify(card),
    }
  );
  return response.data;
}

export async function getUnlockedCards(userId: string): Promise<CharacterCard[]> {
  const response = await apiCall<{ success: boolean; data: CharacterCard[]; total: number }>(
    `/cards/${userId}`
  );
  return response.data;
}

export async function checkCardUnlocked(userId: string, characterId: string): Promise<boolean> {
  const response = await apiCall<{ success: boolean; unlocked: boolean; data: CharacterCard | null }>(
    `/card/${userId}/${characterId}`
  );
  return response.unlocked;
}

// ==================== Chat History ====================

export interface ChatMessage {
  userId: string;
  characterName: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export async function saveChatMessage(message: Omit<ChatMessage, 'timestamp'>): Promise<ChatMessage> {
  const response = await apiCall<{ success: boolean; data: ChatMessage }>(
    '/chat/message',
    {
      method: 'POST',
      body: JSON.stringify(message),
    }
  );
  return response.data;
}

export async function getChatHistory(userId: string, characterName: string): Promise<ChatMessage[]> {
  const response = await apiCall<{ success: boolean; data: ChatMessage[] }>(
    `/chat/${userId}/${characterName}`
  );
  return response.data;
}

// ==================== Leaderboard ====================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  level: number;
  points: number;
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const response = await apiCall<{ success: boolean; data: LeaderboardEntry[] }>(
    `/leaderboard?limit=${limit}`
  );
  return response.data;
}

// ==================== Statistics ====================

export interface UserStatistics {
  profile: UserProfile;
  totalCards: number;
  totalCardsAvailable: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: string;
  totalConversations: number;
  totalMessages: number;
}

export async function getUserStatistics(userId: string): Promise<UserStatistics> {
  const response = await apiCall<{ success: boolean; data: UserStatistics }>(
    `/stats/${userId}`
  );
  return response.data;
}

// ==================== Local Storage Helpers ====================

const CURRENT_USER_KEY = 'korean_history_current_user';

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(CURRENT_USER_KEY, userId);
}

export function clearCurrentUserId(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Generate a simple user ID (for demo purposes)
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// 로컬 기본 프로필 생성 (서버 연결 실패 시 사용)
function createLocalProfile(userId: string, name?: string, email?: string): UserProfile {
  return {
    userId,
    name: name || '학습자',
    email: email || '',
    level: 1,
    exp: 0,
    maxExp: 100,
    points: 0,
    streak: 1,
    lastLoginDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// Initialize user session
export async function initializeUserSession(name?: string, email?: string): Promise<UserProfile> {
  let userId = getCurrentUserId();
  
  if (!userId) {
    userId = generateUserId();
    setCurrentUserId(userId);
  }
  
  try {
    // Get or create profile
    let profile = await getUserProfile(userId);
    
    // Update name and email if provided
    if (name || email) {
      try {
        profile = await updateUserProfile(userId, {
          name: name || profile.name,
          email: email || profile.email,
        });
      } catch {
        // 업데이트 실패 시 현재 프로필 유지
      }
    }
    
    // Update login streak
    try {
      profile = await updateLoginStreak(userId);
    } catch {
      // 스트릭 업데이트 실패 시 현재 프로필 유지
    }
    
    return profile;
  } catch {
    // 서버 연결 실패 시 로컬 프로필로 조용히 폴백
    return createLocalProfile(userId, name, email);
  }
}

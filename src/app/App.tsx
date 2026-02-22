import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { WelcomeScreen } from "./components/WelcomeScreen";
import type { Lang } from "./utils/i18n";
import { LoginModal } from "./components/LoginModal";
import { CharacterUnlockPopup } from "./components/CharacterUnlockPopup";
import { CharacterCollectionImproved } from "./components/CharacterCollectionImproved";
import { PeriodSelection } from "./components/PeriodSelection";
import { QuizScreen } from "./components/QuizScreenImproved";
import { ResultScreen } from "./components/ResultScreen";
import { WrongAnswerNotebook } from "./components/WrongAnswerNotebook";
import { TimelineCharacterCollection } from "./components/TimelineCharacterCollection";
import { AIChat } from "./components/AIChat";
import { Leaderboard } from "./components/Leaderboard";
import { CharacterChatScreen } from "./components/CharacterChatScreen";
import { AIGoodsCreatorImproved } from "./components/AIGoodsCreatorImproved";
import { MuseumTour } from "./components/MuseumTour";
import { ArtifactExpert } from "./components/ArtifactExpert";
import { AdminDashboard } from "./components/AdminDashboard";
import AdminImageManager from "./components/AdminImageManager";
import { quizData, characters as initialCharacters } from "./data/quizData";
import { allCharacters } from "./data/charactersData";
import type { Character } from "./data/quizData";
import { mapAllQuizzesToCharacters } from "./utils/quizCharacterMapping";
import { prefetchUpcoming } from "./utils/quizImageService";
import {
  loadStudyRecord,
  saveStudyRecord,
  recordCorrectAnswer,
  recordWrongAnswer,
  recalcPeriodStats,
  getCompletedQuestionIds,
  recordChatCompleted,
} from "./utils/studyRecord";
import { 
  initializeUserSession, 
  getCurrentUserId, 
  getUserProfile, 
  saveQuizResult,
  unlockCharacterCard,
  type UserProfile 
} from "./utils/supabaseClient";

type Screen = 
  | 'welcome'
  | 'period-selection'
  | 'character-selection'
  | 'quiz'
  | 'result'
  | 'wrong-answers'
  | 'character-collection'
  | 'ai-chat'
  | 'leaderboard'
  | 'character-chat'
  | 'goods-generator'
  | 'museum-tour'
  | 'artifact-expert'
  | 'admin'
  | 'admin-images';

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  category: string;
}

export default function App() {
  // 퀴즈와 인물 자동 매핑
  const mappedQuizData = mapAllQuizzesToCharacters(quizData, initialCharacters);

  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  // ── correctAnswers를 동기적으로 추적 (stale closure 방지) ──
  const correctAnswersRef = useRef(0);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('lang') as Lang) || 'ko'; } catch { return 'ko'; }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [unlockedCharacter, setUnlockedCharacter] = useState<Character | null>(null);
  const [unlockReason, setUnlockReason] = useState<'quiz' | 'chat'>('quiz');
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  // 로그인 후 학습 시작을 자동 실행하기 위한 플래그
  const [pendingStart, setPendingStart] = useState(false);

  // ── 채팅 완료 점수 게시판 연동 ────────────────────────────────
  const [chatScore, setChatScore] = useState(0);
  const [chatCharacterName, setChatCharacterName] = useState<string | undefined>();
  const [chatPeriod, setChatPeriod] = useState<string | undefined>();

  // ── 현재 학습자 ID (로그인 유저 email, 미로그인 시 'guest') ────
  const currentUserId = currentUser?.email ?? 'guest';

  // ── 해금된 인물 ID Set (allCharacters 210명 전체에 적용) ──────────
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('unlockedCharacterIds');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  // ── unlockedIds를 동기적으로 추적 (stale closure 방지) ──
  const unlockedIdsRef = useRef<Set<string>>(new Set<string>());

  // Initialize user session — 서버 미배포 시에도 로컬 데이터로 완전 작동
  useEffect(() => {
    const initSession = async () => {
      setIsLoadingProfile(true);

      // 1) 유저 프로필 (서버 실패 시 로컬 프로필 사용)
      try {
        const savedUser = localStorage.getItem("currentUser");
        let profile: UserProfile;
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          profile = await initializeUserSession(user.name, user.email);
        } else {
          profile = await initializeUserSession();
        }
        setUserProfile(profile);
      } catch {
        // initializeUserSession 자체가 이미 로컬 폴백을 반환하므로 여기까지 오지 않음
      }

      // 2) 완료 문제 로드: localStorage studyRecord 우선, 서버 보조
      {
        const savedUser = localStorage.getItem("currentUser");
        const userId = savedUser ? JSON.parse(savedUser).email : 'guest';

        // ① localStorage에서 즉시 로드 (항상 실행)
        const localCompleted = getCompletedQuestionIds(userId);
        if (localCompleted.length > 0) {
          setCompletedQuestions(localCompleted);
        }

        // ② 서버에서 추가 동기화 (선택적)
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngvsfcekfzzykvcsjktp.supabase.co';
          const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndnNmY2VrZnp6eWt2Y3Nqa3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDYyMDksImV4cCI6MjA4NjQ4MjIwOX0.49FGaOySPc63Pxf6G-QS5T3LVoAie3XWGJsBY1djSZY';
          const quizRes = await fetch(
            `${supabaseUrl}/functions/v1/make-server-48be01a5/quiz/completed/${userId}`,
            { headers: { 'Authorization': `Bearer ${anonKey}` }, signal: AbortSignal.timeout(5000) }
          );
          if (quizRes.ok) {
            const data = await quizRes.json();
            if (data.success && Array.isArray(data.data?.questions) && data.data.questions.length > 0) {
              // 서버 데이터와 로컬 데이터 합산 (더 많은 쪽 유지)
              const serverIds: number[] = data.data.questions;
              const merged = [...new Set([...localCompleted, ...serverIds])];
              // studyRecord에도 반영
              const record = loadStudyRecord(userId);
              record.completedQuestionIds = merged;
              saveStudyRecord(record);
              setCompletedQuestions(merged);
            }
          }
        } catch {
          // 서버 미배포·네트워크 오류 시 로컬 데이터 유지
        }
      }

      // 3) 해금 카드 목록 로드 (서버 미배포 시 localStorage 유지)
      try {
        const savedUser = localStorage.getItem("currentUser");
        const userId = savedUser ? JSON.parse(savedUser).email : 'guest';
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngvsfcekfzzykvcsjktp.supabase.co';
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndnNmY2VrZnp6eWt2Y3Nqa3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDYyMDksImV4cCI6MjA4NjQ4MjIwOX0.49FGaOySPc63Pxf6G-QS5T3LVoAie3XWGJsBY1djSZY';

        const cardsRes = await fetch(
          `${supabaseUrl}/functions/v1/make-server-48be01a5/cards/${userId}`,
          {
            headers: { 'Authorization': `Bearer ${anonKey}` },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          if (cardsData.success && Array.isArray(cardsData.data) && cardsData.data.length > 0) {
            const apiIds = new Set<string>(
              cardsData.data.map((c: { characterId: string }) => c.characterId)
            );
            setUnlockedIds(prev => {
              const merged = new Set<string>([...prev, ...apiIds]);
              localStorage.setItem('unlockedCharacterIds', JSON.stringify([...merged]));
              return merged;
            });
          }
        }
      } catch {
        // 서버 미배포·네트워크 오류 시 localStorage 데이터 유지
      }

      setIsLoadingProfile(false);
    };

    initSession();
  }, []);

  // ── unlockedIds ref 동기화 ──────────────────────────────────────
  useEffect(() => {
    unlockedIdsRef.current = unlockedIds;
  }, [unlockedIds]);

  // Filter out completed questions
  const allQuestionsForPeriod = selectedPeriod ? mappedQuizData[selectedPeriod] || [] : [];
  const currentQuestions = allQuestionsForPeriod.filter(q => !completedQuestions.includes(q.id));
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleStart = () => {
    setCurrentScreen('period-selection');
  };

  const handleSelectPeriod = (period: string) => {
    // If person period, go to character chat screen
    if (period === 'person') {
      setCurrentScreen('character-chat');
      return;
    }

    // 해당 시대에 남은 문제 계산 (completedQuestions 최신 상태 반영)
    const remaining = (mappedQuizData[period] || []).filter(q => !completedQuestions.includes(q.id));
    if (remaining.length === 0) {
      // 이미 모두 완료 → result 화면 대신 period-selection 유지 (완료 표시는 카드에서)
      // 재도전 여부를 묻지 않고 선택만 유지
      return;
    }
    
    setSelectedPeriod(period);
    setCurrentQuestionIndex(0);
    setScore(0);
    setMaxScore(0);
    setCorrectAnswers(0);
    correctAnswersRef.current = 0;
    setWrongAnswers([]);
    setCurrentScreen('quiz');

    // Prefetch next 8 question images in background (fire-and-forget)
    prefetchUpcoming(remaining, 8);
  };

  const handleSubmitAnswer = async (userAnswer: string, hintsUsed: number) => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    
    // 시대별 전체 문제 수 (중복제거 필터 전)
    const periodTotalCount = (mappedQuizData[selectedPeriod] || []).length;

    // Calculate score based on hints used (elementary school level: 70 base points)
    let points = 0;
    if (isCorrect) {
      const basePoints = 70;
      const hintPenalty = hintsUsed * 10;
      points = Math.max(basePoints - hintPenalty, 10);
      setScore(prev => prev + points);
      setMaxScore(prev => prev + basePoints);

      // ── ref로 동기적 카운트 증가 → stale closure 없이 카드 해금 판단 ──
      const newCount = correctAnswersRef.current + 1;
      correctAnswersRef.current = newCount;
      setCorrectAnswers(newCount);

      // 5개 맞출 때마다 (5, 10, 15...) 카드 해금
      if (newCount % 5 === 0) {
        unlockRandomCharacterFromPeriod(selectedPeriod);
      }

      // ── studyRecord 정답 기록 + completedQuestions 업데이트 ──
      const updatedRecord = recordCorrectAnswer(
        currentUserId,
        currentQuestion.id,
        selectedPeriod,
        periodTotalCount
      );
      // 시대별 completedCount 정확히 재계산
      const periodQuizIds: Record<string, number[]> = {};
      for (const [p, qs] of Object.entries(mappedQuizData)) {
        periodQuizIds[p] = qs.map(q => q.id);
      }
      const recalcedRecord = recalcPeriodStats(updatedRecord, periodQuizIds);
      saveStudyRecord(recalcedRecord);
      setCompletedQuestions(recalcedRecord.completedQuestionIds);
    } else {
      // ── studyRecord 오답 기록 ──
      recordWrongAnswer(
        currentUserId,
        currentQuestion.id,
        currentQuestion.question,
        userAnswer,
        currentQuestion.answer,
        currentQuestion.category ?? '',
        selectedPeriod,
        periodTotalCount
      );
    }
    
    // Save quiz result to Supabase
    const userId = getCurrentUserId();
    if (userId) {
      try {
        await saveQuizResult({
          userId,
          period: selectedPeriod,
          questionId: currentQuestion.id,
          isCorrect,
          hintsUsed,
          earnedPoints: points
        });
        
        // Update local profile
        if (userProfile) {
          const updatedProfile = await getUserProfile(userId);
          setUserProfile(updatedProfile);
        }
      } catch (error) {
        console.error("Failed to save quiz result:", error);
      }
    }
    
    if (!isCorrect) {
      setWrongAnswers(prev => [...prev, {
        question: currentQuestion.question,
        userAnswer,
        correctAnswer: currentQuestion.answer,
        category: currentQuestion.category
      }]);
      setMaxScore(prev => prev + 70);
    }

    // Move to next question or results
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentScreen('result');
    }
  };

  const handleRetry = () => {
    setCurrentScreen('period-selection');
    setSelectedPeriod('');
    setCurrentQuestionIndex(0);
    setScore(0);
    setMaxScore(0);
    setCorrectAnswers(0);
    correctAnswersRef.current = 0;
    setWrongAnswers([]);
  };

  const handleBackToPeriodSelection = () => {
    setCurrentScreen('period-selection');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
    setSelectedPeriod('');
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSkipQuestion = () => {
    // Just move to next question without submitting
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentScreen('result');
    }
  };

  // ── 공통 해금 함수: unlockedIds Set + localStorage + 팝업 처리 ──
  const doUnlockCharacter = useCallback((char: Character, reason: 'quiz' | 'chat') => {
    // ref 기준으로 이미 해금된 경우 스킵 (stale closure 방지)
    if (unlockedIdsRef.current.has(char.id)) return;

    setUnlockedIds(prev => {
      if (prev.has(char.id)) return prev;
      const next = new Set(prev);
      next.add(char.id);
      unlockedIdsRef.current = next; // ref 즉시 동기화
      localStorage.setItem('unlockedCharacterIds', JSON.stringify([...next]));
      return next;
    });
    // 18명 quizData characters 상태도 동기화
    setCharacters(prev =>
      prev.map(c => c.id === char.id ? { ...c, unlocked: true } : c)
    );
    // 팝업
    setUnlockedCharacter(char);
    setUnlockReason(reason);
    setShowUnlockPopup(true);

    // Supabase API 저장 (비동기, 실패해도 무시)
    const userId = getCurrentUserId();
    if (userId) {
      unlockCharacterCard({
        userId,
        characterId: char.id,
        characterName: char.name,
        period: char.period,
        unlockedBy: reason,
      }).catch(() => {});
    }
  }, []);

  const unlockRandomCharacterFromPeriod = useCallback((period: string) => {
    // 퀴즈 period key → allCharacters period 이름 매핑
    const periodMap: Record<string, string[]> = {
      'three-kingdoms': ['고조선', '삼국시대'],
      'three-kingdoms-period': ['삼국시대'],
      'goryeo':         ['고려'],
      'joseon':         ['조선'],
      'modern':         ['근현대'],
    };

    const targetPeriods = periodMap[period] || [];
    // ── ref 사용: 항상 최신 unlockedIds로 검색 ──
    const currentUnlocked = unlockedIdsRef.current;
    const locked = allCharacters.filter(c => {
      const inPeriod = targetPeriods.some(p => c.period.includes(p));
      return inPeriod && !currentUnlocked.has(c.id);
    });

    if (locked.length > 0) {
      const randomChar = locked[Math.floor(Math.random() * locked.length)];
      doUnlockCharacter(randomChar, 'quiz');
    }
  }, [doUnlockCharacter]);

  const unlockCharacterById = useCallback((characterId: string, reason: 'quiz' | 'chat' = 'chat') => {
    if (unlockedIdsRef.current.has(characterId)) return;
    // allCharacters 210명에서 먼저 찾고, 없으면 18명에서 찾기
    const char =
      allCharacters.find(c => c.id === characterId) ||
      characters.find(c => c.id === characterId);
    if (!char) return;
    doUnlockCharacter(char, reason);
  }, [characters, doUnlockCharacter]);

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentScreen('ai-chat');
  };

  // ── 역사 인물 대화 완료 → 300점 + 리더보드 이동 ──────────────
  const handleChatCompleted = useCallback((earnedScore: number, charName: string, period: string, characterId: string) => {
    setChatScore(earnedScore);
    setChatCharacterName(charName.replace(/^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿]\s*/, ''));
    setChatPeriod(period);
    // 대화 완료 인물 기록
    const userId = currentUser?.email || currentUser?.name || 'guest';
    recordChatCompleted(userId, characterId);
    setCurrentScreen('leaderboard');
  }, [currentUser]);

  const handleToggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const handleToggleLang = () => {
    setLang(prev => {
      const next: Lang = prev === 'ko' ? 'en' : 'ko';
      try { localStorage.setItem('lang', next); } catch { /* ignore */ }
      return next;
    });
  };

  const handleLogin = async (userName: string) => {
    // LoginModal stores { name, email } in localStorage before calling onLogin
    const storedUser = (() => {
      try { return JSON.parse(localStorage.getItem("currentUser") || "null"); } catch { return null; }
    })();

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const userEmail =
      storedUser?.email ??
      Object.keys(users).find(email => users[email].name === userName) ??
      Object.keys(users).find(email => email.split("@")[0] === userName) ??
      "";

    const user = { name: userName, email: userEmail };
    setCurrentUser(user);
    setPendingStart(true);

    // ── 로그인 유저의 studyRecord에서 완료 문제 즉시 로드 ──
    const userId = userEmail || userName;
    const localCompleted = getCompletedQuestionIds(userId);
    if (localCompleted.length > 0) {
      setCompletedQuestions(localCompleted);
    }

    // Initialize or update Supabase profile (best-effort, non-blocking)
    initializeUserSession(userName, userEmail || undefined).then(profile => {
      setUserProfile(profile);
    }).catch(error => {
      console.error("Failed to sync user profile:", error);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    // Keep anonymous session in Supabase
  };

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${darkMode ? 'dark' : ''}`}>
      <AnimatedBackground darkMode={darkMode} />
      
      <div className="relative z-10">
        <div className="w-full">
        {currentScreen === 'welcome' && (
          <>
            <WelcomeScreen 
              onStart={handleStart}
              darkMode={darkMode}
              onToggleTheme={handleToggleTheme}
              lang={lang}
              onToggleLang={handleToggleLang}
              onGoToGoodsGenerator={() => setCurrentScreen('goods-generator')}
              onGoToMuseumTour={() => setCurrentScreen('museum-tour')}
              onGoToArtifactExpert={() => setCurrentScreen('artifact-expert')}
              onGoToCharacterCollection={() => setCurrentScreen('character-collection')}
              onGoToCharacterChat={() => setCurrentScreen('character-selection')}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
              userProfile={userProfile}
              isLoadingProfile={isLoadingProfile}
              pendingStart={pendingStart}
              onClearPendingStart={() => setPendingStart(false)}
              onGoToAdmin={() => setCurrentScreen('admin')}
            />
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onLogin={handleLogin}
              darkMode={darkMode}
            />
          </>
        )}

        {currentScreen === 'period-selection' && (
          <PeriodSelection
            onSelectPeriod={handleSelectPeriod}
            onBack={handleBackToWelcome}
            darkMode={darkMode}
            completedQuestions={completedQuestions}
            quizData={mappedQuizData}
            currentUser={currentUser}
          />
        )}

        {currentScreen === 'character-selection' && (
          <CharacterChatScreen
            onBack={() => { setSelectedCharacter(null); setCurrentScreen('welcome'); }}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
            lang={lang}
            onUnlockCharacter={unlockCharacterById}
            onChatCompleted={handleChatCompleted}
            initialCharacter={selectedCharacter ?? undefined}
          />
        )}

        {currentScreen === 'quiz' && currentQuestion && (
          <QuizScreen
            question={currentQuestion}
            nextQuestionId={currentQuestions[currentQuestionIndex + 1]?.id}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={currentQuestions.length}
            onSubmitAnswer={handleSubmitAnswer}
            onBack={handleBackToPeriodSelection}
            onHome={handleBackToWelcome}
            onPrevious={handlePreviousQuestion}
            onNext={handleNextQuestion}
            onSkip={handleSkipQuestion}
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < currentQuestions.length - 1}
            darkMode={darkMode}
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen
            totalScore={score}
            maxScore={maxScore}
            correctAnswers={correctAnswers}
            totalQuestions={currentQuestions.length}
            onRetry={handleRetry}
            onHome={handleBackToWelcome}
            onViewWrongAnswers={() => setCurrentScreen('wrong-answers')}
            onGoToLeaderboard={() => setCurrentScreen('leaderboard')}
            onGoToCollection={() => setCurrentScreen('character-collection')}
            currentUser={currentUser}
            selectedPeriod={selectedPeriod}
          />
        )}

        {currentScreen === 'wrong-answers' && (
          <WrongAnswerNotebook
            wrongAnswers={wrongAnswers}
            onClose={() => setCurrentScreen('result')}
            onHome={handleBackToWelcome}
            onRetry={handleRetry}
          />
        )}

        {currentScreen === 'character-collection' && (
          <CharacterCollectionImproved
            unlockedIds={unlockedIds}
            onBack={() => setCurrentScreen('welcome')}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
            onSelectCharacter={(character) => {
              setSelectedCharacter(character);
              setCurrentScreen('character-selection');
            }}
          />
        )}

        {currentScreen === 'ai-chat' && selectedCharacter && (
          <AIChat
            character={selectedCharacter}
            onClose={() => setCurrentScreen('character-selection')}
            darkMode={darkMode}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <Leaderboard
            onClose={() => {
              if (chatScore > 0 && chatCharacterName) {
                setChatScore(0);
                setChatCharacterName(undefined);
                setChatPeriod(undefined);
                setCurrentScreen('character-chat');
              } else {
                setCurrentScreen('result');
              }
            }}
            onHome={handleBackToWelcome}
            userScore={chatScore > 0 ? chatScore : score}
            scoreSource={chatScore > 0 ? "chat" : "quiz"}
            characterName={chatCharacterName}
            period={chatPeriod}
            lang={lang}
          />
        )}

        {currentScreen === 'character-chat' && (
          <CharacterChatScreen
            onBack={handleBackToPeriodSelection}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
            lang={lang}
            onUnlockCharacter={unlockCharacterById}
            onChatCompleted={handleChatCompleted}
          />
        )}

        {currentScreen === 'goods-generator' && (
          <AIGoodsCreatorImproved
            onBack={() => setCurrentScreen('welcome')}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
            lang={lang}
          />
        )}

        {currentScreen === 'museum-tour' && (
          <MuseumTour
            onBack={() => setCurrentScreen('welcome')}
            darkMode={darkMode}
          />
        )}

        {currentScreen === 'artifact-expert' && (
          <ArtifactExpert
            onBack={() => setCurrentScreen('welcome')}
            darkMode={darkMode}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminDashboard
            onBack={() => setCurrentScreen('welcome')}
            onGoToImages={() => setCurrentScreen('admin-images')}
          />
        )}

        {currentScreen === 'admin-images' && (
          <AdminImageManager
            onBack={() => setCurrentScreen('admin')}
          />
        )}
        </div>
      </div>

      {/* Character Unlock Popup */}
      <CharacterUnlockPopup
        isOpen={showUnlockPopup}
        character={unlockedCharacter}
        onClose={() => setShowUnlockPopup(false)}
        darkMode={darkMode}
        reason={unlockReason}
        correctCount={correctAnswers}
        onGoToCollection={() => {
          setShowUnlockPopup(false);
          setCurrentScreen('character-collection');
        }}
      />
    </div>
  );
}

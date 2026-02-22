import { useState, useEffect, useRef } from "react";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LoginModal } from "./components/LoginModal";
import { CharacterUnlockPopup } from "./components/CharacterUnlockPopup";
import { CharacterCollectionImproved } from "./components/CharacterCollectionImproved";
import { CharacterSelectionImproved } from "./components/CharacterSelectionImproved";
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
import { quizData, characters as initialCharacters } from "./data/quizData";
import type { Character } from "./data/quizData";
import { mapAllQuizzesToCharacters } from "./utils/quizCharacterMapping";
import { prefetchUpcoming } from "./utils/quizImageService";
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
  | 'artifact-expert';

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
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [darkMode, setDarkMode] = useState(false);
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

  // Initialize user session with Supabase
  useEffect(() => {
    const initSession = async () => {
      setIsLoadingProfile(true);
      try {
        // Check if user exists in localStorage
        const savedUser = localStorage.getItem("currentUser");
        let profile: UserProfile;
        
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          profile = await initializeUserSession(user.name, user.email);
        } else {
          // Initialize anonymous session
          profile = await initializeUserSession();
        }
        
        setUserProfile(profile);

        // Load completed questions
        const userId = savedUser ? JSON.parse(savedUser).email : 'guest';
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngvsfcekfzzykvcsjktp.supabase.co';
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndnNmY2VrZnp6eWt2Y3Nqa3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDYyMDksImV4cCI6MjA4NjQ4MjIwOX0.49FGaOySPc63Pxf6G-QS5T3LVoAie3XWGJsBY1djSZY';
        const response = await fetch(
          `${supabaseUrl}/functions/v1/make-server-48be01a5/quiz/completed/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${anonKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.questions) {
            setCompletedQuestions(data.data.questions);
            console.log('Loaded completed questions:', data.data.questions.length);
          }
        }
      } catch (error) {
        console.error("Failed to initialize session:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    initSession();
  }, []);

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
    
    setSelectedPeriod(period);
    setCurrentQuestionIndex(0);
    setScore(0);
    setMaxScore(0);
    setCorrectAnswers(0);
    setWrongAnswers([]);
    setCurrentScreen('quiz');

    // Prefetch next 8 question images in background (fire-and-forget)
    const qs = (mappedQuizData[period] || []).filter(q => !completedQuestions.includes(q.id));
    prefetchUpcoming(qs, 8);
  };

  const handleSubmitAnswer = async (userAnswer: string, hintsUsed: number) => {
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    
    // Calculate score based on hints used (elementary school level: 70 base points)
    let points = 0;
    if (isCorrect) {
      const basePoints = 70;
      const hintPenalty = hintsUsed * 10;
      points = Math.max(basePoints - hintPenalty, 10);
      setScore(prev => prev + points);
      setMaxScore(prev => prev + basePoints);
      setCorrectAnswers(prev => {
        const newCount = prev + 1;
        
        // Check if user reached 5 correct answers to unlock character
        if (newCount === 5) {
          unlockRandomCharacterFromPeriod(selectedPeriod);
        }
        
        return newCount;
      });

      // Add to completed questions list
      setCompletedQuestions(prev => {
        if (!prev.includes(currentQuestion.id)) {
          return [...prev, currentQuestion.id];
        }
        return prev;
      });

      // Unlock character if associated
      if (currentQuestion.characterId) {
        setCharacters(prev => 
          prev.map(char => 
            char.id === currentQuestion.characterId 
              ? { ...char, unlocked: true }
              : char
          )
        );
        
        // Save to Supabase
        const userId = getCurrentUserId();
        if (userId) {
          try {
            const character = initialCharacters.find(c => c.id === currentQuestion.characterId);
            if (character) {
              await unlockCharacterCard({
                userId,
                characterId: character.id,
                characterName: character.name,
                period: selectedPeriod,
                unlockedBy: 'quiz'
              });
            }
          } catch (error) {
            console.error("Failed to save card unlock:", error);
          }
        }
      }
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
    
    // Continue with existing logic
    if (isCorrect) {
      // Unlock character if associated (already handled above)
      if (currentQuestion.characterId) {
        setCharacters(prev => 
          prev.map(char => 
            char.id === currentQuestion.characterId 
              ? { ...char, unlocked: true }
              : char
          )
        );
      }
    } else {
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
      // Check if user got 5 or more correct answers and unlock a character
      const finalCorrectCount = isCorrect ? correctAnswers + 1 : correctAnswers;
      if (finalCorrectCount >= 5) {
        unlockRandomCharacterFromPeriod(selectedPeriod);
      }
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

  const unlockRandomCharacterFromPeriod = (period: string) => {
    // Map period to character period names
    const periodMap: Record<string, string[]> = {
      'three-kingdoms': ['고조선', '삼국시대'],
      'goryeo': ['고려시대'],
      'joseon': ['조선시대'],
      'modern': ['근현대']
    };

    const targetPeriods = periodMap[period] || [];
    const lockedCharacters = characters.filter(
      c => !c.unlocked && targetPeriods.includes(c.period)
    );

    if (lockedCharacters.length > 0) {
      const randomChar = lockedCharacters[Math.floor(Math.random() * lockedCharacters.length)];
      setCharacters(prev => 
        prev.map(char => 
          char.id === randomChar.id
            ? { ...char, unlocked: true }
            : char
        )
      );
      
      // Show unlock popup
      setUnlockedCharacter(randomChar);
      setUnlockReason('quiz');
      setShowUnlockPopup(true);
    }
  };

  const unlockCharacterById = (characterId: string, reason: 'quiz' | 'chat' = 'chat') => {
    const character = characters.find(c => c.id === characterId);
    
    setCharacters(prev => 
      prev.map(char => 
        char.id === characterId
          ? { ...char, unlocked: true }
          : char
      )
    );

    // Show unlock popup if character was locked
    if (character && !character.unlocked) {
      setUnlockedCharacter(character);
      setUnlockReason(reason);
      setShowUnlockPopup(true);
    }
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentScreen('ai-chat');
  };

  const handleToggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const handleLogin = async (userName: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/318aca58-286a-4080-bc4f-6cd5c6cea3e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:handleLogin',message:'login called',data:{userName},timestamp:Date.now(),hypothesisId:'A',runId:'login-1'})}).catch(()=>{});
    // #endregion

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

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/318aca58-286a-4080-bc4f-6cd5c6cea3e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:handleLogin',message:'resolved email',data:{userName,userEmail,storedUser},timestamp:Date.now(),hypothesisId:'B',runId:'login-1'})}).catch(()=>{});
    // #endregion

    const user = { name: userName, email: userEmail };
    setCurrentUser(user);
    setPendingStart(true); // 즉시 설정 — Supabase 동기화 기다리지 않음

    // Initialize or update Supabase profile (best-effort, non-blocking)
    initializeUserSession(userName, userEmail || undefined).then(profile => {
      setUserProfile(profile);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/318aca58-286a-4080-bc4f-6cd5c6cea3e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:handleLogin',message:'supabase profile synced',data:{profile},timestamp:Date.now(),hypothesisId:'C',runId:'login-1'})}).catch(()=>{});
      // #endregion
    }).catch(error => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/318aca58-286a-4080-bc4f-6cd5c6cea3e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:handleLogin',message:'supabase sync failed',data:{error:String(error)},timestamp:Date.now(),hypothesisId:'D',runId:'login-1'})}).catch(()=>{});
      // #endregion
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
          />
        )}

        {currentScreen === 'character-selection' && (
          <CharacterSelectionImproved
            characters={characters}
            onBack={() => setCurrentScreen('welcome')}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
            onSelectCharacter={(character) => {
              setSelectedCharacter(character);
              setCurrentScreen('ai-chat');
            }}
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
            characters={characters}
            onBack={() => setCurrentScreen('welcome')}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
            onSelectCharacter={(character) => {
              setSelectedCharacter(character);
              setCurrentScreen('ai-chat');
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
            onClose={() => setCurrentScreen('result')}
            onHome={handleBackToWelcome}
            userScore={score}
          />
        )}

        {currentScreen === 'character-chat' && (
          <CharacterChatScreen
            onBack={handleBackToPeriodSelection}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
            onUnlockCharacter={unlockCharacterById}
          />
        )}

        {currentScreen === 'goods-generator' && (
          <AIGoodsCreatorImproved
            onBack={() => setCurrentScreen('welcome')}
            onHome={handleBackToWelcome}
            darkMode={darkMode}
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
        </div>
      </div>

      {/* Character Unlock Popup */}
      <CharacterUnlockPopup
        isOpen={showUnlockPopup}
        character={unlockedCharacter}
        onClose={() => setShowUnlockPopup(false)}
        darkMode={darkMode}
        reason={unlockReason}
      />
    </div>
  );
}

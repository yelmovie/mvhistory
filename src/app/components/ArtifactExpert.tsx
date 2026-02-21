import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Award, CheckCircle, XCircle, Sparkles, Trophy } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ArtifactExpertProps {
  onBack: () => void;
  darkMode?: boolean;
}

interface ArtifactQuestion {
  id: number;
  imageUrl: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  funFact: string;
}

export function ArtifactExpert({ onBack, darkMode = false }: ArtifactExpertProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const questions: ArtifactQuestion[] = [
    {
      id: 1,
      imageUrl: 'https://images.unsplash.com/photo-1706794831005-e0cbae755fae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwa29yZWFuJTIwcG90dGVyeSUyMGNlcmFtaWNzfGVufDF8fHx8MTc3MDg0MTI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      question: '이 토기의 이름은 무엇일까요?',
      options: ['빗살무늬토기', '민무늬토기', '덧무늬토기', '붉은간토기'],
      correctAnswer: 0,
      explanation: '빗살무늬토기는 신석기 시대의 대표적인 토기로, 빗으로 그은 듯한 무늬가 특징이에요.',
      funFact: '빗살무늬는 물고기 비늘을 표현했거나 그물을 상징한다는 설이 있어요!'
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1764925772504-169a3f1e18f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBjdWx0dXJhbCUyMGhlcml0YWdlJTIwdHJlYXN1cmV8ZW58MXx8fHwxNzcwODQxMjgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      question: '고려시대를 대표하는 이 도자기는?',
      options: ['백자', '분청사기', '청자', '옹기'],
      correctAnswer: 2,
      explanation: '고려청자는 비취색의 아름다운 색깔과 우아한 형태로 세계적으로 유명해요.',
      funFact: '청자상감운학문매병은 국보 제68호로 지정되어 있어요!'
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1712412960347-cc340ad9bc81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXRpb25hbCUyMG11c2V1bSUyMGtvcmVhJTIwYXJ0aWZhY3RzfGVufDF8fHx8MTc3MDg0MTI4MXww&ixlib=rb-4.1.0&q=80&w=1080',
      question: '조선시대 궁궐 뒤에 놓였던 이 병풍은?',
      options: ['산수도', '일월오봉도', '문자도', '민화'],
      correctAnswer: 1,
      explanation: '일월오봉도는 해, 달, 다섯 봉우리, 소나무, 폭포 등이 그려진 왕의 권위를 상징하는 병풍이에요.',
      funFact: '현재 5만원권 지폐 뒷면에도 일월오봉도가 그려져 있어요!'
    },
    {
      id: 4,
      imageUrl: 'https://images.unsplash.com/photo-1609224551451-488966de2e67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGNyYWZ0cyUyMGFydHxlbnwxfHx8fDE3NzA4NDEyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      question: '한글을 창제한 책의 이름은?',
      options: ['용비어천가', '삼국사기', '훈민정음', '동의보감'],
      correctAnswer: 2,
      explanation: '훈민정음은 세종대왕이 1443년에 창제하고 1446년에 반포한 우리 문자의 이름이에요.',
      funFact: '훈민정음 해례본은 유네스코 세계기록유산으로 등재되어 있어요!'
    },
    {
      id: 5,
      imageUrl: 'https://images.unsplash.com/photo-1706794831005-e0cbae755fae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwa29yZWFuJTIwcG90dGVyeSUyMGNlcmFtaWNzfGVufDF8fHx8MTc3MDg0MTI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      question: '신라의 황금 유물로 유명한 것은?',
      options: ['금관', '금동대향로', '금제관식', '금동신발'],
      correctAnswer: 0,
      explanation: '신라 금관은 화려하고 정교한 세공 기술로 만들어진 신라 왕족의 상징이에요.',
      funFact: '경주 천마총에서 발견된 금관은 국보 제188호예요!'
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
  const percentage = Math.round((score / questions.length) * 100);

  const getExpertLevel = () => {
    if (percentage >= 80) return { level: '유물 박사', emoji: '🏆', color: 'from-yellow-400 to-orange-500' };
    if (percentage >= 60) return { level: '유물 전문가', emoji: '⭐', color: 'from-blue-400 to-cyan-500' };
    if (percentage >= 40) return { level: '유물 학습자', emoji: '📚', color: 'from-green-400 to-emerald-500' };
    return { level: '유물 입문자', emoji: '🌱', color: 'from-purple-400 to-pink-500' };
  };

  if (isQuizComplete) {
    const expertLevel = getExpertLevel();
    
    return (
      <div className={`min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${
            darkMode 
              ? 'bg-gray-900/80 border-gray-700/50' 
              : 'bg-white/80 border-white/50'
          } backdrop-blur-xl border-b shadow-sm sticky top-0 z-50`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
                  darkMode 
                    ? 'bg-gray-800/60 border-gray-700/50' 
                    : 'bg-white/60 border-white/80'
                } backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">뒤로가기</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="text-8xl mb-6"
          >
            {expertLevel.emoji}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl font-bold mb-4 bg-gradient-to-r ${expertLevel.color} bg-clip-text text-transparent`}
          >
            {expertLevel.level}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {score}개 중 {questions.length}개 정답!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${
              darkMode 
                ? 'bg-gray-800/70 border-gray-700/50' 
                : 'bg-white/80 border-white/90'
            } backdrop-blur-xl border-2 rounded-3xl p-8 shadow-2xl mb-8`}
          >
            <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {percentage}점
            </div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {percentage >= 80 ? '완벽해요! 유물 박사님!' :
               percentage >= 60 ? '훌륭해요! 유물에 대해 잘 알고 있어요!' :
               percentage >= 40 ? '잘했어요! 조금만 더 공부하면 전문가가 될 수 있어요!' :
               '괜찮아요! 다시 도전해서 실력을 키워보아요!'}
            </p>
          </motion.div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg"
            >
              다시 도전하기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`flex-1 px-6 py-4 rounded-2xl ${
                darkMode
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-200 text-gray-800'
              } font-bold shadow-lg`}
            >
              메인으로
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className={`min-h-screen ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${
          darkMode 
            ? 'bg-gray-900/80 border-gray-700/50' 
            : 'bg-white/80 border-white/50'
        } backdrop-blur-xl border-b shadow-sm sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
                darkMode 
                  ? 'bg-gray-800/60 border-gray-700/50' 
                  : 'bg-white/60 border-white/80'
              } backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">뒤로가기</span>
            </motion.button>

            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${
                darkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                우리나라 유물 박사되기
              </h1>
            </div>

            <div className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl ${
              darkMode 
                ? 'bg-gray-800/60 border-gray-700/50' 
                : 'bg-white/60 border-white/80'
            } backdrop-blur-xl border shadow-lg flex items-center gap-2`}>
              <Trophy className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className="text-sm sm:text-base font-bold">
                {score}/{questions.length}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className={`${darkMode ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              문제 {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`${
              darkMode 
                ? 'bg-gray-800/70 border-gray-700/50' 
                : 'bg-white/80 border-white/90'
            } backdrop-blur-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl`}
          >
            {/* Artifact Image */}
            <div className="aspect-video overflow-hidden rounded-2xl mb-6 shadow-xl">
              <ImageWithFallback
                src={question.imageUrl}
                alt={`문제 ${question.id}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold mb-6">{question.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full px-6 py-4 rounded-2xl border-2 font-bold text-left transition-all ${
                    showResult
                      ? index === question.correctAnswer
                        ? darkMode
                          ? 'bg-green-500/20 border-green-400 text-green-300'
                          : 'bg-green-100 border-green-500 text-green-700'
                        : index === selectedAnswer
                          ? darkMode
                            ? 'bg-red-500/20 border-red-400 text-red-300'
                            : 'bg-red-100 border-red-500 text-red-700'
                          : darkMode
                            ? 'bg-gray-700/30 border-gray-600/30 text-gray-500'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                      : selectedAnswer === index
                        ? darkMode
                          ? 'bg-purple-500/30 border-purple-400 text-white'
                          : 'bg-purple-100 border-purple-500 text-purple-700'
                        : darkMode
                          ? 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50'
                          : 'bg-white/50 border-gray-200 hover:bg-white'
                  } flex items-center justify-between`}
                >
                  <span>{option}</span>
                  {showResult && (
                    index === question.correctAnswer ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : index === selectedAnswer ? (
                      <XCircle className="w-6 h-6" />
                    ) : null
                  )}
                </motion.button>
              ))}
            </div>

            {/* Result Explanation */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`${
                    isCorrect
                      ? darkMode
                        ? 'bg-green-500/10 border-green-400/30'
                        : 'bg-green-50 border-green-200'
                      : darkMode
                        ? 'bg-red-500/10 border-red-400/30'
                        : 'bg-red-50 border-red-200'
                  } border-2 rounded-2xl p-6 mb-6`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isCorrect ? (
                      <>
                        <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                          정답입니다!
                        </h3>
                      </>
                    ) : (
                      <>
                        <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                          아쉬워요!
                        </h3>
                      </>
                    )}
                  </div>
                  <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {question.explanation}
                  </p>
                  <div className={`flex items-start gap-2 p-3 rounded-xl ${
                    darkMode ? 'bg-gray-700/30' : 'bg-white/50'
                  }`}>
                    <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {question.funFact}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            {!showResult ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                정답 확인하기
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-lg"
              >
                {currentQuestion < questions.length - 1 ? '다음 문제' : '결과 보기'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import { Trophy, Medal, Award, ArrowLeft, Star, Home } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  difficulty: string;
}

interface LeaderboardProps {
  onClose: () => void;
  onHome?: () => void;
  userScore: number;
}

export function Leaderboard({ onClose, onHome, userScore }: LeaderboardProps) {
  const [playerName, setPlayerName] = useState("");
  const [registered, setRegistered] = useState(false);

  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "김철수", score: 500, difficulty: "HARD" },
    { rank: 2, name: "이영희", score: 480, difficulty: "NORMAL" },
    { rank: 3, name: "박민수", score: 460, difficulty: "HARD" },
    { rank: 4, name: "최지원", score: 450, difficulty: "NORMAL" },
    { rank: 5, name: "정수민", score: 430, difficulty: "EASY" },
  ];

  const handleRegister = () => {
    if (playerName.trim()) {
      setRegistered(true);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-amber-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <Star className="w-5 h-5 text-purple-400" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-amber-100/60 to-yellow-100/60 border-amber-200/60";
      case 2:
        return "from-gray-100/60 to-slate-100/60 border-gray-200/60";
      case 3:
        return "from-orange-100/60 to-amber-100/60 border-orange-200/60";
      default:
        return "from-white/60 to-gray-50/60 border-white/80";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-emerald-100/80 text-emerald-700 border-emerald-200/50";
      case "NORMAL":
        return "bg-blue-100/80 text-blue-700 border-blue-200/50";
      case "HARD":
        return "bg-purple-100/80 text-purple-700 border-purple-200/50";
      default:
        return "bg-gray-100/80 text-gray-700 border-gray-200/50";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>뒤로</span>
            </motion.button>

            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-xl bg-purple-500/60 border border-purple-400/50 shadow-lg hover:bg-purple-500/80 transition-all"
                title="홈으로"
              >
                <Home className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            <h2 className="text-3xl font-bold text-gray-800">순위 등록</h2>
          </div>

          <div className="w-24" />
        </div>

        {/* Registration Form */}
        {!registered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-gradient-to-br from-purple-100/60 to-pink-100/60 border border-purple-200/60 rounded-3xl p-8 shadow-xl mb-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">축하합니다! 🎉</h3>
              <p className="text-gray-600">당신의 점수: <span className="text-purple-600 font-bold text-xl">{userScore}</span></p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                placeholder="이름을 입력하세요 ✏️"
                maxLength={10}
                className="w-full px-6 py-4 rounded-2xl border-2 border-purple-200/50 bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-gray-400"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={!playerName.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                등록하기
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: registered ? 0 : 0.2 }}
          className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-3xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">명예의 전당</h3>

          <div className="space-y-3">
            {mockLeaderboard.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`backdrop-blur-xl bg-gradient-to-r ${getRankBg(entry.rank)} border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/60 shadow-md">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{entry.name}</div>
                      <div className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(entry.difficulty)} mt-1`}>
                        {entry.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{entry.score}</div>
                    <div className="text-xs text-gray-500">점</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Success Message */}
        {registered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 backdrop-blur-xl bg-gradient-to-r from-emerald-100/60 to-teal-100/60 border border-emerald-200/60 rounded-3xl p-6 text-center shadow-lg"
          >
            <div className="text-4xl mb-2">🎊</div>
            <p className="text-emerald-700 font-bold">등록이 완료되었습니다!</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

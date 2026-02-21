import { motion } from "motion/react";
import { Crown, User, Scroll, Sparkles, MessageCircle, ArrowLeft, Lock } from "lucide-react";

interface Character {
  id: string;
  name: string;
  period: string;
  unlocked: boolean;
  icon: string;
}

interface CharacterCollectionProps {
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
  onClose: () => void;
}

export function CharacterCollection({ characters, onSelectCharacter, onClose }: CharacterCollectionProps) {
  const getGradient = (index: number) => {
    const gradients = [
      'from-purple-200/40 to-pink-200/40',
      'from-blue-200/40 to-cyan-200/40',
      'from-emerald-200/40 to-teal-200/40',
      'from-amber-200/40 to-yellow-200/40',
      'from-rose-200/40 to-pink-200/40',
      'from-indigo-200/40 to-purple-200/40'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-5xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-800">순위 등록하기</h2>
          </div>

          <div className="w-24" />
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {characters.map((character, index) => (
            <motion.button
              key={character.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={character.unlocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={character.unlocked ? { scale: 0.95 } : {}}
              onClick={() => character.unlocked && onSelectCharacter(character)}
              disabled={!character.unlocked}
              className={`relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl border shadow-lg transition-all ${
                character.unlocked
                  ? 'bg-white/60 border-white/80 hover:shadow-xl cursor-pointer'
                  : 'bg-gray-100/40 border-gray-200/40 cursor-not-allowed'
              }`}
            >
              {/* Gradient Background */}
              {character.unlocked && (
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-0 group-hover:opacity-100 transition-opacity`} />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                {character.unlocked ? (
                  <>
                    <div className="text-4xl">{character.icon}</div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800 mb-1">{character.name}</div>
                      <div className="text-xs text-gray-600">{character.period}</div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="mt-2 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200/50"
                    >
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                    </motion.div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-gray-200/60 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500 font-bold">???</div>
                  </>
                )}
              </div>

              {/* Unlock Badge */}
              {character.unlocked && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-gradient-to-r from-purple-100/60 to-pink-100/60 border border-purple-200/60 rounded-3xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">인물 카드를 모으세요!</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                고 전해지는데, 이 이야기는 좋아요지 않소?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          인물과 관련된 문제를 맞추면 인물 역사카드를 획득하여 해당 역사 인물과 대화 할 수 있다.
        </motion.p>
      </motion.div>
    </div>
  );
}

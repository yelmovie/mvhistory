import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, LogIn, UserPlus } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userName: string) => void;
  darkMode: boolean;
}

export function LoginModal({ isOpen, onClose, onLogin, darkMode }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Initialize sample account on mount
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!users["student@history.com"]) {
      users["student@history.com"] = { name: "역사탐험가", password: "1234" };
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 간단한 유효성 검사
    if (isSignUp && !name.trim()) {
      setError("이름을 입력해주세요");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("올바른 이메일을 입력해주세요");
      return;
    }
    if (!password || password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다");
      return;
    }

    // 로그인/회원가입 처리 (현재는 localStorage 사용)
    const displayName = name.trim() || email.split("@")[0];
    
    if (isSignUp) {
      // 회원가입
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      if (users[email]) {
        setError("이미 가입된 이메일입니다");
        return;
      }
      users[email] = { name: displayName, password };
      localStorage.setItem("users", JSON.stringify(users));
    } else {
      // 로그인
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      const user = users[email];
      if (!user || user.password !== password) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
        return;
      }
    }

    // 세션 저장
    localStorage.setItem("currentUser", JSON.stringify({ name: displayName, email }));
    // 모달을 먼저 닫은 후 로그인 콜백 호출 (상태 전환 순서 보장)
    handleClose();
    onLogin(displayName);
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setIsSignUp(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className={`${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-2xl shadow-2xl border overflow-hidden`}>
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {isSignUp ? "회원가입" : "로그인"}
                </h2>
                <button
                  onClick={handleClose}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {isSignUp && (
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      이름
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력하세요"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                        } outline-none transition-colors`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    이메일
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } outline-none transition-colors`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    비밀번호
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } outline-none transition-colors`}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Sample Account Info - Only show on login */}
                {!isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      darkMode 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    } border px-4 py-3 rounded-xl`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="text-lg mt-0.5">💡</div>
                      <div className="flex-1 text-sm">
                        <p className="font-semibold mb-1">샘플 계정으로 테스트하기</p>
                        <div className={`space-y-1 ${
                          darkMode ? 'text-blue-200' : 'text-blue-600'
                        }`}>
                          <p className="font-mono text-xs">
                            <span className="font-medium">이메일:</span> student@history.com
                          </p>
                          <p className="font-mono text-xs">
                            <span className="font-medium">비밀번호:</span> 1234
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail("student@history.com");
                            setPassword("1234");
                          }}
                          className={`mt-2 text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                            darkMode
                              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }`}
                        >
                          샘플 계정으로 자동 입력
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  {isSignUp ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      회원가입
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      로그인
                    </>
                  )}
                </button>

                {/* Toggle */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                    }}
                    className={`text-sm font-medium ${
                      darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    } transition-colors`}
                  >
                    {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
                  </button>
                </div>
              </form>

              {/* Footer Info */}
              <div className={`px-6 py-4 border-t text-center ${
                darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  💡 테스트용으로 브라우저 로컬 스토리지를 사용합니다
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

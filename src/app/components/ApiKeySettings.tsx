import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Key, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Sparkles } from "lucide-react";
import { validateOpenAIApiKey } from "../utils/openaiApi";

interface ApiKeySettingsProps {
  darkMode?: boolean;
  onClose: () => void;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function ApiKeySettings({ darkMode = false, onClose, viewMode = 'desktop' }: ApiKeySettingsProps) {
  const [openaiApiKey, setOpenaiApiKey] = useState(
    localStorage.getItem('openai_api_key') || ''
  );
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (!openaiApiKey.trim()) {
      setValidationResult('error');
      setErrorMessage('API 키를 입력해주세요.');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setErrorMessage('');

    try {
      const isValid = await validateOpenAIApiKey(openaiApiKey);
      
      if (isValid) {
        localStorage.setItem('openai_api_key', openaiApiKey);
        setValidationResult('success');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setValidationResult('error');
        setErrorMessage('API 키가 유효하지 않습니다. 다시 확인해주세요.');
      }
    } catch (error) {
      setValidationResult('error');
      setErrorMessage('API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full ${
          viewMode === 'mobile' ? 'max-w-md' : 'max-w-2xl'
        } ${
          darkMode ? 'bg-[#1E293B]' : 'bg-white'
        } rounded-[24px] overflow-hidden`}
        style={{ boxShadow: 'var(--shadow-2xl)' }}
      >
        {/* Header */}
        <div 
          className="p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
            >
              <Key className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">API 키 설정</h2>
              <p className="text-sm text-white/80">
                OpenAI GPT-4o-mini로 역사 인물과 대화하세요
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 ${viewMode === 'mobile' ? 'space-y-4' : 'space-y-6'}`}>
          {/* Info Card */}
          <div 
            className={`p-4 rounded-[16px] border ${
              darkMode 
                ? 'bg-[#6366F1]/10 border-[#6366F1]/30' 
                : 'bg-[#EEF2FF] border-[#C7D2FE]'
            }`}
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#6366F1] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h3 className={`font-bold mb-1 text-sm ${
                  darkMode ? 'text-white' : 'text-[#1F2937]'
                }`}>
                  OpenAI GPT-4o-mini란?
                </h3>
                <p className={`text-xs ${
                  darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
                }`}>
                  고성능 AI 언어 모델로, 역사 인물과 자연스럽고 교육적인 대화를 나눌 수 있어요.
                </p>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className={`block text-sm font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-[#1F2937]'
            }`}>
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={openaiApiKey}
                onChange={(e) => {
                  setOpenaiApiKey(e.target.value);
                  setValidationResult(null);
                  setErrorMessage('');
                }}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className={`w-full px-4 py-3 pr-12 rounded-[12px] border-2 transition-all ${
                  darkMode
                    ? 'bg-[#334155] border-[#475569] text-white placeholder-[#94A3B8]'
                    : 'bg-white border-[#E5E7EB] text-[#1F2937] placeholder-[#9CA3AF]'
                } focus:outline-none focus:border-[#6366F1]`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-[#475569]' : 'hover:bg-[#F3F4F6]'
                }`}
              >
                {showKey ? (
                  <EyeOff className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Eye className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Validation Result */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-[16px] border-2 ${
                  validationResult === 'success'
                    ? darkMode
                      ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#6EE7B7]'
                      : 'bg-[#D1FAE5] border-[#10B981] text-[#10B981]'
                    : darkMode
                      ? 'bg-[#EF4444]/20 border-[#EF4444]/50 text-[#FCA5A5]'
                      : 'bg-[#FEE2E2] border-[#EF4444] text-[#EF4444]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validationResult === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  )}
                  <div>
                    <p className="font-bold text-sm mb-1">
                      {validationResult === 'success' 
                        ? '✅ API 키가 성공적으로 저장되었습니다!' 
                        : '❌ API 키 저장 실패'
                      }
                    </p>
                    {errorMessage && (
                      <p className="text-xs">{errorMessage}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How to get API Key */}
          <div 
            className={`p-4 rounded-[16px] border ${
              darkMode 
                ? 'bg-[#334155]/50 border-[#475569]' 
                : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}
          >
            <h4 className={`font-bold text-sm mb-2 ${
              darkMode ? 'text-white' : 'text-[#1F2937]'
            }`}>
              💡 API 키 발급 방법
            </h4>
            <ol className={`text-xs space-y-1 list-decimal list-inside ${
              darkMode ? 'text-[#CBD5E1]' : 'text-[#6B7280]'
            }`}>
              <li>OpenAI Platform에 접속하여 회원가입</li>
              <li>API Keys 메뉴에서 새 API 키 생성</li>
              <li>생성된 키를 복사하여 여기에 입력</li>
            </ol>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                darkMode
                  ? 'bg-[#6366F1]/20 text-[#A5B4FC] hover:bg-[#6366F1]/30'
                  : 'bg-[#EEF2FF] text-[#6366F1] hover:bg-[#E0E7FF]'
              }`}
            >
              <ExternalLink className="w-4 h-4" strokeWidth={2} />
              OpenAI Platform 열기
            </a>
          </div>

          {/* Buttons */}
          <div className={`flex gap-3 ${viewMode === 'mobile' ? 'flex-col' : ''}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`flex-1 py-3 rounded-[16px] font-bold transition-all ${
                darkMode
                  ? 'bg-[#334155] hover:bg-[#475569] text-white'
                  : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937]'
              }`}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              취소
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isValidating}
              className={`flex-1 py-3 rounded-[16px] font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isValidating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: 'var(--shadow-primary)'
              }}
            >
              {isValidating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  검증 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" strokeWidth={2} />
                  저장하기
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

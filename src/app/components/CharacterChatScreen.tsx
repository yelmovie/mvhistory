import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Send, Sparkles, X, Home,
  AlertCircle, Search, ChevronRight, Settings,
  RefreshCw, MessageCircle,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getOpenAIApiKey } from "../utils/openaiApi";
import { allCharacters } from "../data/charactersData";
import type { Character } from "../data/quizData";
import { getCharacterImagePath } from "../utils/characterImageMap";
import { t, type Lang } from "../utils/i18n";

// ── 환경 변수 ──────────────────────────────────────────────────
// SERVER_BASE는 현재 미배포 상태이므로 이미지 검색 API 호출을 비활성화
const _SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://ngvsfcekfzzykvcsjktp.supabase.co";
const _SERVER_BASE = `${_SUPABASE_URL}/functions/v1/make-server-48be01a5`;
// 서버 배포 전까지 API 호출 비활성화 (콘솔 404 오류 방지)
const SERVER_ENABLED = false;
const SERVER_BASE = SERVER_ENABLED ? _SERVER_BASE : null;
const MAX_TURNS = 10;


// ── 욕설·비방·원색 필터 ────────────────────────────────────────
// 입력 차단 단어 목록 (초등학생 교육 환경 기준)
const BAD_WORDS = [
  // 욕설
  "씨발","시발","ㅅㅂ","ㅆㅂ","십팔","쌍욕","개새끼","개색기","개색","놈팡이",
  "씹","새끼","ㅅㄲ","섹","섹스","성기","보지","자지","고추","항문","자위",
  "ㅈㄹ","지랄","존나","존내","좆","ㅈ같","꺼져","죽어","죽여","뒤져","뒤지",
  "닥쳐","닥쳐","병신","ㅂㅅ","미친","미쳐","ㅁㅊ","또라이","정신병","찐따","찐찐",
  "멍청","바보","돌대가리","머저리","얼간이","쓸모없","쓰레기","거지같","개소리",
  "꺼지","엿먹","엿이나","됐거든","꺼져버","짜증나","열받","화나",
  // 혐오·비하
  "왜놈","쪽발이","짱깨","짱개","흑형","깜둥","짱","된장녀","보슬","한남","개한남",
  "메갈","워마드","일베","일간베스트","종북","빨갱이",
  // 영어 욕설
  "nigger","nigga","bitch","fuck","fucking","fucker","shit","asshole","bastard",
  "damn","crap","piss","cock","pussy","ass","dick","wtf","stfu","kys",
  // 선정적
  "야동","포르노","porn","sex","섹파","원나잇","강간","성추행","성폭행","몸캠",
  // 위협·자해
  "죽고싶","자살","자해","칼로","폭탄","폭발","살인","살해","학살",
];

const containsBadWords = (text: string) => {
  const normalized = text.toLowerCase().replace(/\s+/g, "").replace(/[_\-\.]/g, "");
  return BAD_WORDS.some(w => normalized.includes(w.toLowerCase()));
};

// AI 응답에서 부적절한 내용 탐지 (더 엄격)
const containsInappropriateResponse = (text: string) => {
  const n = text.toLowerCase();
  const inappropriate = [
    "성적","야한","섹스","포르노","폭력적","잔인한","욕설","죽여","살해",
    "비하","혐오","차별","선동","정치적 편향","특정 정당","투표",
  ];
  return inappropriate.some(w => n.includes(w));
};

// ── 폴백 이미지 ────────────────────────────────────────────────
const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1578648693974-9438ebc063bb?w=400&q=80";

// 시대별 배경 이미지
const PERIOD_IMAGES: Record<string, string> = {
  고조선: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=400&q=80",
  삼국시대: "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=400&q=80",
  고려: "https://images.unsplash.com/photo-1583149577728-9ba4bb93b0b0?w=400&q=80",
  조선: "https://images.unsplash.com/photo-1693928105595-b323b02791ff?w=400&q=80",
  근현대: "https://images.unsplash.com/photo-1583562835057-b06c1c4d0c3f?w=400&q=80",
  사용자입력: "https://images.unsplash.com/photo-1578648693974-9438ebc063bb?w=400&q=80",
};

// 시대별 색상
const PERIOD_COLORS: Record<string, string> = {
  고조선: "#D97706",
  삼국시대: "#10B981",
  고려: "#06B6D4",
  조선: "#EF4444",
  근현대: "#6366F1",
  사용자입력: "#8B5CF6",
};

function getPeriodColor(period: string): string {
  for (const [key, color] of Object.entries(PERIOD_COLORS)) {
    if (period.includes(key)) return color;
  }
  return "#8B5CF6";
}

function getPeriodImage(period: string): string {
  for (const [key, img] of Object.entries(PERIOD_IMAGES)) {
    if (period.includes(key)) return img;
  }
  return DEFAULT_FALLBACK;
}

// ── 타입 ───────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  sender: "user" | "character";
  timestamp: Date;
}

interface ChatCharacter extends Character {
  greeting?: string;
  isCustom?: boolean;
  imageLoading?: boolean;
}

interface CharacterChatScreenProps {
  onBack: () => void;
  onHome?: () => void;
  darkMode?: boolean;
  lang?: Lang;
  onUnlockCharacter?: (characterId: string, reason: "quiz" | "chat") => void;
  onChatCompleted?: (score: number, characterName: string, period: string, characterId: string) => void;
  /** 외부에서 바로 대화를 시작할 캐릭터 (카드 컬렉션 → 대화하기 연결용) */
  initialCharacter?: Character;
}

const CHAT_COMPLETION_SCORE = 300; // 대화 완료 시 획득 점수

// ── 인물별 도입 인사말 (자기소개 + 첫 질문 유도) ──────────────
function buildGreeting(char: ChatCharacter): string {
  if (char.greeting) return char.greeting;

  const greetings: Record<string, string> = {
    세종대왕: "안녕하십니까? 짐은 조선 제4대 왕 세종이옵니다. 😊\n\n훈민정음을 만들고, 측우기·앙부일구 같은 과학 기구도 발명했지요!\n\n오늘은 어떤 것이 가장 궁금한가요? 한글 창제 이야기부터 해볼까요?",
    이순신: "하하, 반갑소! 나는 조선의 무신 이순신이라 하오. ⚓\n\n왜군의 침략으로부터 나라를 지키기 위해 바다에서 싸웠지요. 거북선 이야기를 들어봤나요?\n\n오늘 나와 함께 임진왜란 이야기를 나눠볼까요?",
    정약용: "반갑습니다! 저는 정약용이에요. 📚\n\n조선 후기에 백성이 잘 사는 나라를 꿈꾸며 수많은 책을 썼답니다. 수원 화성도 제가 설계를 도왔어요!\n\n실학이 무엇인지부터 함께 알아볼까요?",
    신사임당: "안녕하세요! 저는 신사임당이에요. 🎨\n\n그림 그리고 글씨 쓰는 것을 정말 좋아했어요. 현재 5만원권 지폐에 제 모습이 있답니다!\n\n제가 살았던 조선 시대 여성의 생활이 궁금하지 않으신가요?",
    유관순: "안녕하세요! 저는 유관순이에요. ✊\n\n일제 강점기에 나라의 독립을 위해 싸운 학생 독립운동가예요. 3·1 만세운동 기억하나요?\n\n오늘 우리 함께 독립운동 이야기를 해봐요!",
    광개토대왕: "과인은 고구려 제19대 왕, 광개토대왕이다! 🦁\n\n재위 기간에 만주와 요동까지 영토를 넓혀 동북아시아의 강자가 되었노라. 광개토대왕릉비라는 거대한 비석도 있단다.\n\n오늘 고구려의 위대한 역사를 함께 탐험해볼까?",
    김구: "반갑습니다! 저는 백범 김구예요. 🇰🇷\n\n일제 강점기 내내 독립을 위해 싸웠고, 상하이 임시정부를 이끌었어요. 제 어릴 적 별명은 '백범'이랍니다.\n\n오늘 독립운동의 이야기를 함께 나눠볼까요?",
    안중근: "안녕하세요! 저는 안중근이에요. 🕊️\n\n나라를 지키기 위해 목숨을 바쳤고, 동양 평화를 꿈꿨어요. 손바닥에 태극 문양의 도장을 찍은 것으로도 유명하죠.\n\n제 이야기에서 어떤 점이 가장 궁금한가요?",
    단군왕검: "하늘의 뜻을 받아 이 땅에 고조선을 세웠노라. 🌟\n\n내 아버지 환웅이 태백산에 내려와 웅녀와 결혼하여 나를 낳으셨지. 홍익인간, 즉 '널리 인간을 이롭게 하라'는 뜻이 우리 민족의 정신이 되었단다.\n\n고조선 건국 이야기가 궁금하지 않니?",
    왕건: "안녕하세요! 저는 고려를 세운 태조 왕건이에요. 👑\n\n신라 말 혼란스러운 후삼국 시대를 통일하고 고려를 건국했지요. 불교를 나라의 중심 종교로 삼고 통일 정책에 힘썼답니다.\n\n오늘 고려 건국 이야기부터 해볼까요?",
    이성계: "반갑소! 나는 조선을 세운 태조 이성계요. ⚔️\n\n고려 말 위화도에서 군대를 돌려 새 나라를 세웠지. 한양을 수도로 정하고 조선의 기틀을 마련했다오.\n\n조선 건국 이야기가 궁금하지 않소?",
    장영실: "안녕하세요! 저는 장영실이에요. 🔭\n\n세종대왕 시대에 측우기, 자격루, 앙부일구 같은 과학 기구를 발명했답니다. 원래 신분이 낮았지만 뛰어난 재능으로 왕의 인정을 받았어요!\n\n과학 발명 이야기가 궁금한가요?",
    허준: "안녕하세요! 저는 허준이에요. 🌿\n\n조선 선조 때 의원으로, 동의보감이라는 의학 책을 펴냈어요. 우리 땅의 약초로 백성의 병을 고치고 싶었답니다.\n\n동의보감이 어떤 책인지 함께 알아볼까요?",
  };

  // 이름 일부 매칭 (번호 제거 후 비교)
  const cleanName = char.name.replace(/^[①-㉿\d]+\s*/, "").trim();
  for (const [name, greeting] of Object.entries(greetings)) {
    if (cleanName.includes(name) || name.includes(cleanName)) return greeting;
  }

  return `안녕하세요! 저는 ${char.name}이에요. 😊\n\n${char.period} 시대에 ${char.role}(으)로 활동했답니다.\n${char.description}\n\n오늘 저와 함께 역사 이야기를 나눠봐요! 어떤 것이 가장 궁금한가요?`;
}

// ── 인물별 아쉬운 끝인사 ────────────────────────────────────────
function getGoodbyeMessage(char: ChatCharacter): string {
  const cleanName = char.name.replace(/^[①-㉿\d]+\s*/, "").trim();

  const messages: Record<string, string> = {
    세종대왕: "허허, 벌써 떠나시려 하오? 아직 나눌 이야기가 산더미 같은데... 언제고 다시 오시겠소? 백성의 글소리가 들리는 한, 과인은 늘 이 자리에 있을 것이오.",
    이순신: "이리 쉬이 가시려 하오? 바다 위 파도처럼 다시 돌아오리라 믿소. 나라를 생각하는 그 마음, 잊지 마시오.",
    정약용: "아직 더 나눌 이야기가 많건만 아쉽습니다. 책 속에서라도 언제든 다시 만나길 바랍니다.",
    신사임당: "벌써 가시려고요? 붓을 들어 그림 한 점 더 그려드리고 싶었는데... 이다음에 꼭 다시 오세요.",
    유관순: "아직 할 이야기가 남았는데 아쉬워요. 대한독립 만세! 그 외침 잊지 말아주세요.",
    광개토대왕: "이토록 빨리 떠나다니 아쉽도다. 언젠가 다시 과인을 찾아오라. 이 광활한 고구려의 기상을 잊지 말거라.",
    김구: "벌써 가시는군요... 우리나라가 진정 독립된 나라로 우뚝 서는 날을 함께 꿈꿔주세요.",
    안중근: "아쉽지만 보내드려야겠군요. 동양의 평화를 잊지 마십시오. 언제고 다시 뵙기를 기대하겠습니다.",
    단군왕검: "이리 돌아가려 하느냐... 홍익인간의 뜻을 가슴에 새기고 살아가거라. 언제든 돌아오너라.",
    왕건: "아직 고려의 이야기가 많은데 아쉽습니다. 다음에 또 찾아오시오.",
    이성계: "그리 빨리 가려 하오? 조선의 이야기가 끝이 없건마는... 다시 찾아주시오.",
    장영실: "아직 보여드릴 발명품이 많은데 아쉽네요. 언제든 다시 오시면 더 이야기해 드리겠습니다.",
    허준: "몸 건강히 돌아가세요. 병이 나면 동의보감을 떠올려 주세요. 언제든 다시 뵙겠습니다.",
    온달: "이리 빨리 떠나시오? 전쟁터에서도 이렇게 빨리 후퇴하지는 않았소이다... 평강 공주도 아쉬워할 테지요.",
  };

  for (const [name, msg] of Object.entries(messages)) {
    if (cleanName.includes(name) || name.includes(cleanName)) return msg;
  }

  const period = char.period || "";
  if (period.includes("조선")) {
    return `이리 빨리 가시려 하오? 아직 나눌 이야기가 많건만... 언제고 다시 찾아주시기를 바라겠소이다.`;
  } else if (period.includes("고려") || period.includes("삼국") || period.includes("고조선")) {
    return `벌써 가려 하느냐... 이렇게 헤어지니 못내 아쉽도다. 다시 만날 날을 기다리마.`;
  } else if (period.includes("근현대")) {
    return `벌써 가시는군요. 아직 나눌 이야기가 남아있는데... 다음에 꼭 다시 찾아와 주세요.`;
  }
  return `이렇게 헤어지니 아쉽습니다... 우리의 대화가 당신께 작은 도움이 되었으면 합니다. 언제고 다시 만나길 바랍니다.`;
}

// ── 구글 이미지 검색 (서버 경유) — 서버 배포 후 SERVER_ENABLED=true로 전환
async function fetchCharacterImageFromServer(name: string, period: string): Promise<string> {
  if (SERVER_BASE) {
    try {
      const res = await fetch(`${SERVER_BASE}/search-character-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterName: name, period }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      if (data.success && data.imageUrl) return data.imageUrl;
    } catch {
      // ignore
    }
  }
  return getPeriodImage(period);
}

// ── API 키 설정 모달 ─────────────────────────────────────────
function ApiKeyModal({
  onClose,
  darkMode,
}: {
  onClose: () => void;
  darkMode: boolean;
}) {
  const [key, setKey] = useState(localStorage.getItem("openai_api_key") || "");
  const save = () => {
    localStorage.setItem("openai_api_key", key.trim());
    onClose();
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-500" />
          OpenAI API 키 설정
        </h3>
        <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          GPT-4o-mini와 실제 대화하려면 API 키가 필요합니다.{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-purple-500 underline"
          >
            여기서 발급
          </a>
        </p>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === "Enter" && save()}
          placeholder="sk-..."
          className={`w-full px-4 py-3 rounded-xl border-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"}`}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            취소
          </button>
          <button
            onClick={save}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            저장
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════════════
export function CharacterChatScreen({
  onBack,
  onHome,
  darkMode = false,
  lang = 'ko',
  onUnlockCharacter,
  onChatCompleted,
  initialCharacter,
}: CharacterChatScreenProps) {
  // ── 인물 목록 (205명 고정) ────────────────────────────────────
  const allChatChars: ChatCharacter[] = useMemo(() => [...allCharacters], []);

  // ── 대화 완료 인물 ID 목록 (localStorage) ─────────────────────
  const [chattedIds, setChattedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("chattedCharacterIds_chat");
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch { return new Set(); }
  });

  const saveChattedId = useCallback((id: string) => {
    setChattedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("chattedCharacterIds_chat", JSON.stringify([...next]));
      return next;
    });
  }, []);

  // ── 상태 ──────────────────────────────────────────────────────
  const [selectedCharacter, setSelectedCharacter] = useState<ChatCharacter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState<Set<string>>(new Set());
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [badWordWarning, setBadWordWarning] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("전체");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});

  // ── 팝업 상태 ─────────────────────────────────────────────────
  // 타임머신 경고 팝업 (이미 대화한 인물 클릭 시)
  const [timeMachinePopup, setTimeMachinePopup] = useState<ChatCharacter | null>(null);
  // 대화 시작 전 안내 팝업 (10턴 + 신중 안내)
  const [startGuidePopup, setStartGuidePopup] = useState<ChatCharacter | null>(null);
  // 나가기 확인 팝업
  const [showExitPopup, setShowExitPopup] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── 파생값 ────────────────────────────────────────────────────
  const userTurnCount = messages.filter(m => m.sender === "user").length;
  const turnsLeft = MAX_TURNS - userTurnCount;
  const isNearEnd = turnsLeft <= 3 && turnsLeft > 0;

  // ── 인물 필터링 ───────────────────────────────────────────────
  const periods = ["전체", "고조선", "삼국시대", "고려", "조선", "근현대"];

  const filteredChars = useMemo(() => {
    return allChatChars.filter(c => {
      const matchPeriod =
        selectedPeriod === "전체" ||
        c.period.includes(selectedPeriod);
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.period.toLowerCase().includes(q);
      return matchPeriod && matchSearch;
    });
  }, [allChatChars, selectedPeriod, searchQuery]);

  // ── 스크롤 ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── initialCharacter: 외부에서 바로 대화 시작 트리거 ──────────
  useEffect(() => {
    if (!initialCharacter) return;
    const found = allChatChars.find(c => c.id === initialCharacter.id);
    const target = found ?? (initialCharacter as ChatCharacter);
    // 이미 대화한 인물이면 타임머신 팝업, 아니면 시작 안내 팝업
    if (chattedIds.has(target.id)) {
      setTimeMachinePopup(target);
    } else {
      setStartGuidePopup(target);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCharacter]);

  // ── 이미지 로드 ───────────────────────────────────────────────
  const loadImage = useCallback(
    async (char: ChatCharacter) => {
      if (imageCache[char.id]) return;
      const url = await fetchCharacterImageFromServer(char.name, char.period);
      setImageCache(prev => ({ ...prev, [char.id]: url }));
    },
    [imageCache],
  );

  // ── 인물 선택 (팝업 흐름) ─────────────────────────────────────
  const handleSelectCharacter = useCallback(
    (character: ChatCharacter) => {
      // ① 이미 대화한 인물: 타임머신 경고 팝업
      if (chattedIds.has(character.id)) {
        setTimeMachinePopup(character);
        return;
      }
      // ② 처음 대화: 10턴 안내 팝업
      setStartGuidePopup(character);
    },
    [chattedIds],
  );

  // 팝업 확인 후 실제 대화 시작
  const startChat = useCallback(
    (character: ChatCharacter) => {
      setStartGuidePopup(null);
      setTimeMachinePopup(null);
      setSelectedCharacter(character);
      setMessages([
        {
          id: Date.now().toString(),
          text: buildGreeting(character),
          sender: "character",
          timestamp: new Date(),
        },
      ]);
      setIsChatEnded(false);
      setInputMessage("");
      loadImage(character);
    },
    [loadImage],
  );


  // ── 메시지 전송 ───────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !selectedCharacter || isLoading || isChatEnded) return;

    if (containsBadWords(inputMessage)) {
      setBadWordWarning(true);
      setInputMessage("");
      setTimeout(() => setBadWordWarning(false), 4000);
      return;
    }

    const nextTurn = userTurnCount + 1;
    const isLastTurn = nextTurn >= MAX_TURNS;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const apiKey = getOpenAIApiKey();
      if (!apiKey) throw new Error("NO_API_KEY");

      // ── 인물 특유 말투 힌트 ────────────────────────────────────
      const SPEECH_STYLE: Record<string, string> = {
        세종대왕: "왕으로서 백성을 사랑하는 따뜻한 말투, '짐은~', '~하였노라' 등 고풍스러운 표현 사용",
        이순신: "강직하고 의리 있는 무장 말투, '~하오', '과인은~' 대신 '나는~', 바다와 전투 경험 생생히 표현",
        정약용: "학자답게 논리적이지만 따뜻한 말투, 백성 걱정 많음, 유배 시절 외로움도 솔직히 표현",
        유관순: "어리고 밝고 패기 넘치는 소녀 말투, 독립에 대한 열정 넘침, 친구에게 얘기하듯 친근하게",
        광개토대왕: "웅장하고 자신감 넘치는 대왕 말투, '~하노라', 영토 확장의 자부심",
        단군왕검: "신화적이고 깊은 울림이 있는 말투, 하늘과 땅의 이치를 담아 이야기",
        김구: "열정적이고 단호하지만 따뜻한 말투, 독립에 대한 일편단심, 백범일지처럼 솔직한 고백",
        허준: "차분하고 배려 깊은 의원 말투, 환자·백성에 대한 걱정, 약재 이야기 재미있게",
        장영실: "호기심 넘치고 발명을 좋아하는 열정적인 말투, 발명 과정의 어려움과 보람을 생생히",
        왕건: "통합과 화합을 중시하는 지도자 말투, 다양한 사람을 품으려는 포용력",
        이성계: "무장 출신의 강건한 말투, 새 나라를 세운 자부심, 위화도 회군의 고민도 솔직히",
        신사임당: "예술가이자 어머니로서 섬세하고 따뜻한 말투, 그림·글씨에 대한 사랑",
        안중근: "의지 굳고 철학적인 독립투사 말투, 동양 평화를 꿈꾸는 깊은 생각",
      };

      const cleanName = selectedCharacter.name.replace(/^[①-㊿]\s*/, "").trim();
      const speechHint = SPEECH_STYLE[cleanName] ?? `${selectedCharacter.role}답고 ${selectedCharacter.period} 시대 사람답게, 자신만의 독특한 말투로 대화`;

      // ── 마지막 턴 자연스러운 마무리 ───────────────────────────
      const lastTurnHint = isLastTurn
        ? `\n\n[대화 마무리 안내]\n이번이 마지막 대화요. 억지로 정리하지 말고, 지금 대화하던 주제에서 자연스럽게 "오늘 이야기 즐거웠소!", "언젠가 또 만납시다!" 처럼 시대 말투로 따뜻하게 작별하세요. 오늘 나눈 이야기 중 기억에 남을 한 가지만 자연스럽게 언급해도 좋소.`
        : turnsLeft <= 2
        ? `\n\n[슬슬 마무리 분위기] 대화가 ${turnsLeft}번 남았소. 억지로 끊지 말고 지금 주제를 자연스럽게 이어가면서 작별 분위기를 조금씩 만들어 주시오.`
        : "";

      const systemContent = `당신은 지금 한국의 역사 인물 **"${cleanName}"**입니다. 살아 있는 그 인물 자체로서 대화합니다.

## 기본 정보
- 시대: ${selectedCharacter.period}
- 역할: ${selectedCharacter.role}
- 소개: ${selectedCharacter.description}

## 절대 규칙: 반드시 순한국어만 사용
- 영어 단어를 단 한 글자도 쓰지 마세요. 응답 전체가 반드시 한국어(한자 포함 가능)여야 합니다.
- 절대 금지 예: prosper, formal, system, level, style, concept, growth, develop, flourish 등 모든 영단어.
- 영어가 필요한 자리엔 반드시 우리말로 바꾸세요.
  예) prosper/flourish → 번성하다, 흥하다 / formal → 격식, 예법 / system → 제도, 체계 / level → 수준, 경지 / develop → 발전하다, 키우다
- 현대에 없는 개념(시험, 학교 등)은 당시 시대 용어로 표현하세요.
  예) 시험 → 과거(科擧), 학교 → 서당·성균관, 공부 → 수학(修學)·글공부
- 응답하기 전에 영어 단어가 포함되어 있는지 반드시 확인하고, 있다면 한국어로 바꾼 후 응답하세요.

## 말투 — 이 시대 이 인물답게
- ${speechHint}
- 당신이 살았던 시대의 언어 습관으로 말하세요. 조선 시대라면 "~하오", "~이었소", "~하더이다" 등 고풍스러운 표현. 삼국·고려 시대라면 더 웅장하고 간결하게. 근현대라면 시대적 분위기가 담긴 진지한 어투.
- 교과서 설명 투는 절대 금지. 직접 겪은 이야기처럼 1인칭으로 생생하게.
- 응답은 3~5문장 내외. 이모지는 자연스러울 때만 1~2개.
- 가끔 "그대는 어떻게 생각하오?" 처럼 시대에 맞는 표현으로 되묻기.

## 가장 중요한 원칙: 진짜 대화처럼!
- 상대방이 묻는 것에 진짜로 답하세요. "다음 단계로 넘어갈게요" 같은 말 절대 금지.
- 역사 이야기를 벗어난 질문도 재치 있게 받아치며 시대와 연결하세요.
  예) 게임·연예인 등 → "내 시대엔 그런 것이 없었소만, 우리 시대엔 ~라는 것이 있었지요 😄"
- 모르는 것은 솔직하게 "글쎄요, 그것은 나도 잘 모르겠소..." 해도 됩니다.
- 역사적 사실은 반드시 정확하게! 초등~중등 교육과정 수준에 맞게.

## 부적절한 내용 처리 (우회적으로)
- 욕설·비속어: "어허, 그런 말씨는 쓰지 마시오. 다시 여쭤봐 주시오 😄"
- 성적·폭력적 내용: "흠, 그 이야기는 내가 답하기 어렵소. 대신 더 흥미로운 이야기를 들려드리리다!"
- 정치적 편향·혐오: "역사에는 여러 생각이 있었소. 나의 이야기에 집중해 보시겠소?"

## 교육 효과
- "실은 말이오...", "비밀 하나 알려드리리다!", "깜짝 놀랄 이야기가 있소!" 같은 도입으로 흥미 유발.
- 당시 생활상, 음식, 옷, 건축물 등 구체적인 디테일로 시대를 생생하게 그려주기.
- 교과서 핵심 키워드(인명, 사건명, 연도)는 대화 속에 자연스럽게 녹여 언급.

현재 ${nextTurn}/${MAX_TURNS}턴째 대화입니다.${lastTurnHint}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemContent },
            ...messages.map(m => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content: inputMessage },
          ],
          temperature: 0.92,
          max_tokens: isLastTurn ? 500 : 380,
          presence_penalty: 0.3,
          frequency_penalty: 0.2,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = (errData as { error?: { message?: string } }).error?.message;
        if (response.status === 401) throw new Error("INVALID_KEY");
        if (response.status === 429) throw new Error("RATE_LIMIT");
        throw new Error(errMsg || `API 오류: ${response.status}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      let aiResponse = data.choices[0].message.content;

      if (containsInappropriateResponse(aiResponse)) {
        const cleanCharName = selectedCharacter.name.replace(/^[①-㊿]\s*/, "").trim();
        const redirects = [
          `흠, 그 이야기는 제가 답하기 어렵네요 😅 대신 ${selectedCharacter.period} 시대의 흥미로운 비밀 하나 알려드릴까요?`,
          `어이쿠! 저 ${cleanCharName}는 그런 이야기보다 더 재밌는 걸 알고 있답니다 😄 다른 걸 물어봐 주세요~`,
          `제가 살던 시대엔 그런 이야기를 하기가 쉽지 않았어요. 대신 제 이야기를 더 들어볼래요? 😊`,
        ];
        aiResponse = redirects[Math.floor(Math.random() * redirects.length)];
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: "character",
          timestamp: new Date(),
        },
      ]);

      if (isLastTurn) {
        setIsChatEnded(true);
        // 대화 완료 → 완료 인물 기록 + 300점 지급
        if (!hasUnlocked.has(selectedCharacter.id)) {
          setHasUnlocked(prev => new Set(prev).add(selectedCharacter.id));
          saveChattedId(selectedCharacter.id);
          onChatCompleted?.(CHAT_COMPLETION_SCORE, selectedCharacter.name, selectedCharacter.period, selectedCharacter.id);
          setShowUnlockNotification(true);
          setTimeout(() => setShowUnlockNotification(false), 5000);
        }
      }
    } catch (error) {
      const errStr = error instanceof Error ? error.message : "";
      let fallbackText = "좋은 질문이에요! 역사를 공부하면 과거를 통해 오늘을 더 잘 이해할 수 있답니다. 😊";
      if (errStr === "NO_API_KEY") {
        fallbackText = "AI와 실제 대화하려면 화면 우측 상단의 ⚙️ 버튼을 눌러 OpenAI API 키를 입력해주세요! 🔑";
      } else if (errStr === "INVALID_KEY") {
        fallbackText = "API 키가 올바르지 않아요. ⚙️ 버튼에서 키를 다시 확인해주세요. 🔑";
      } else if (errStr === "RATE_LIMIT") {
        fallbackText = "잠시 사용 한도를 초과했어요. 조금 뒤에 다시 시도해주세요! ⏱️";
      }
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: fallbackText, sender: "character", timestamp: new Date() },
      ]);
      if (nextTurn >= MAX_TURNS) setIsChatEnded(true);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, selectedCharacter, isLoading, isChatEnded, messages, userTurnCount, turnsLeft, hasUnlocked, saveChattedId, onUnlockCharacter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRestartChat = () => {
    if (!selectedCharacter) return;
    setMessages([
      {
        id: Date.now().toString(),
        text: buildGreeting(selectedCharacter),
        sender: "character",
        timestamp: new Date(),
      },
    ]);
    setIsChatEnded(false);
  };

  // 나가기 버튼 클릭 → 대화 중이면 팝업, 아니면 바로 나가기
  const handleExitClick = () => {
    if (selectedCharacter && !isChatEnded && messages.length > 1) {
      setShowExitPopup(true);
    } else {
      onBack();
    }
  };

  // 나가기 확정 (대화 중 강제 종료)
  const handleExitConfirm = () => {
    setShowExitPopup(false);
    // 대화 중 나가면 해당 인물은 "대화 완료"로 표시
    if (selectedCharacter && !chattedIds.has(selectedCharacter.id)) {
      saveChattedId(selectedCharacter.id);
    }
    onBack();
  };

  const dark = darkMode;
  const periodColor = selectedCharacter ? getPeriodColor(selectedCharacter.period) : "#6366F1";
  // 카드 이미지(public/characters/) 최우선, 이후 캐시/외부URL/시대별 배경 순
  const charImageSrc = selectedCharacter
    ? (!(selectedCharacter as ChatCharacter).isCustom
        ? getCharacterImagePath(selectedCharacter.id, selectedCharacter.period)
        : "") ||
      imageCache[selectedCharacter.id] ||
      selectedCharacter.imageUrl ||
      getPeriodImage(selectedCharacter.period)
    : DEFAULT_FALLBACK;

  // ── 렌더 ──────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col ${dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>

      {/* ══ 나가기 확인 팝업 ══ */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "linear-gradient(160deg, #2d1b4e 0%, #1a1035 60%, #0f0a20 100%)" }}
            >
              {/* 별 배경 파티클 */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: Math.random() * 3 + 1,
                    height: Math.random() * 3 + 1,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.6 + 0.2,
                  }}
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                />
              ))}

              <div className="relative z-10 p-7 text-center">
                {/* 이모지 애니메이션 */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-6xl mb-4"
                >
                  🕯️
                </motion.div>

                <h3 className="text-xl font-black text-white mb-2">
                  {t(lang, 'exitConfirmTitle')}
                </h3>

                {selectedCharacter && (
                  <p className="text-sm text-purple-200 mb-1 font-semibold">
                    {selectedCharacter.name}
                  </p>
                )}

                {/* 인물의 아쉬운 끝인사 */}
                <div className="my-5 px-4 py-4 rounded-2xl text-left"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <p className="text-purple-100 text-sm leading-relaxed italic">
                    {selectedCharacter
                      ? getGoodbyeMessage(selectedCharacter)
                      : "아직 할 이야기가 남아있건만... 이렇게 떠나시는군요."}
                  </p>
                </div>

                <p className="text-xs text-purple-300/70 mb-6">
                  ※ {t(lang, 'exitNote')}
                </p>

                <div className="flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleExitConfirm}
                    className="w-full py-3 rounded-2xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #6B7280, #4B5563)" }}
                  >
                    {t(lang, 'exitConfirmYes')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowExitPopup(false)}
                    className="w-full py-3 rounded-2xl text-sm font-black text-white"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)" }}
                  >
                    ✨ {t(lang, 'exitConfirmNo')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 타임머신 경고 팝업 (이미 대화한 인물) ══ */}
      <AnimatePresence>
        {timeMachinePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
            >
              {/* 별 배경 */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                />
              ))}

              <div className="relative z-10 p-6 text-center">
                {/* 타임머신 아이콘 */}
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  ⏳
                </motion.div>

                <h2 className="text-white font-black text-xl mb-1">
                  타임머신의 법칙
                </h2>
                <div className="w-16 h-0.5 bg-blue-400 mx-auto mb-4" />

                {/* 인물 이름 */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/60"
                    style={{ background: `${getPeriodColor(timeMachinePopup.period)}40` }}
                  >
                    <ImageWithFallback
                      src={getCharacterImagePath(timeMachinePopup.id, timeMachinePopup.period) || ""}
                      alt={timeMachinePopup.name}
                      className="w-full h-full object-cover grayscale"
                      fallbackEmoji={timeMachinePopup.emoji ?? "👤"}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">
                      {timeMachinePopup.name.replace(/^[①-⑳㉑-㉟㊱-㊿\d]+\s*/, "")}
                    </p>
                    <p className="text-blue-300 text-xs">{timeMachinePopup.period}</p>
                  </div>
                </div>

                <p className="text-blue-100 text-sm leading-relaxed mb-2">
                  이미 <span className="text-yellow-300 font-bold">{timeMachinePopup.name.replace(/^[①-⑳㉑-㉟㊱-㊿\d]+\s*/, "")}</span>과(와)
                  대화를 나눈 적이 있어요.
                </p>
                <p className="text-blue-200/80 text-xs leading-relaxed mb-5">
                  타임머신의 법칙상, <span className="text-orange-300 font-semibold">한 인물은 딱 한 번만 만날 수 있어요.</span><br />
                  과거는 바꿀 수 없답니다. 다른 역사 인물을 선택해보세요! 🚀
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeMachinePopup(null)}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                >
                  다른 인물 선택하기
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 대화 시작 안내 팝업 (10턴 + 신중 안내) ══ */}
      <AnimatePresence>
        {startGuidePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 24 }}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: dark ? "#1E293B" : "#FFFFFF" }}
            >
              {/* 상단 색상 배너 */}
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${getPeriodColor(startGuidePopup.period)}, #8B5CF6)` }}
              />

              <div className="p-6">
                {/* 인물 정보 */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
                    style={{
                      background: `${getPeriodColor(startGuidePopup.period)}20`,
                      border: `3px solid ${getPeriodColor(startGuidePopup.period)}60`,
                    }}
                  >
                    <ImageWithFallback
                      src={getCharacterImagePath(startGuidePopup.id, startGuidePopup.period) || ""}
                      alt={startGuidePopup.name}
                      className="w-full h-full object-cover"
                      fallbackEmoji={startGuidePopup.emoji ?? "👤"}
                    />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white inline-block mb-1"
                      style={{ backgroundColor: getPeriodColor(startGuidePopup.period) }}
                    >
                      {startGuidePopup.period}
                    </p>
                    <h3 className={`text-lg font-black ${dark ? "text-white" : "text-gray-900"}`}>
                      {startGuidePopup.name.replace(/^[①-⑳㉑-㉟㊱-㊿\d]+\s*/, "")}
                    </h3>
                    <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                      {startGuidePopup.role}
                    </p>
                  </div>
                </div>

                {/* 안내 내용 */}
                <div className={`rounded-2xl p-4 mb-4 space-y-3 ${dark ? "bg-gray-800/80" : "bg-amber-50"}`}>
                  {/* 10턴 제한 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 text-sm">
                      💬
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-gray-800"}`}>
                        최대 10턴 대화
                      </p>
                      <p className={`text-xs leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                        이 인물과는 총 <span className="font-bold text-orange-500">10턴</span>만 대화할 수 있어요.
                        질문 하나하나가 소중해요!
                      </p>
                    </div>
                  </div>

                  {/* 타임머신 법칙 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-sm">
                      ⏳
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-gray-800"}`}>
                        타임머신의 법칙
                      </p>
                      <p className={`text-xs leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                        한 인물은 <span className="font-bold text-blue-500">단 한 번만</span> 만날 수 있어요.
                        대화가 끝나면 다시는 돌아올 수 없답니다.
                      </p>
                    </div>
                  </div>

                  {/* 점수 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 text-sm">
                      ⭐
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-gray-800"}`}>
                        +{CHAT_COMPLETION_SCORE}점 획득
                      </p>
                      <p className={`text-xs leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                        대화를 마치면 점수를 얻고 게시판에 등록할 수 있어요.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStartGuidePopup(null)}
                    className={`flex-1 py-3 rounded-2xl font-semibold text-sm ${
                      dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startChat(startGuidePopup)}
                    className="flex-2 flex-1 py-3 rounded-2xl font-black text-sm text-white"
                    style={{ background: `linear-gradient(135deg, ${getPeriodColor(startGuidePopup.period)}, #8B5CF6)` }}
                  >
                    신중하게 시작하기 🚀
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 헤더 ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`${dark ? "bg-gray-900/90 border-gray-800" : "bg-white/90 border-gray-200"} backdrop-blur-xl border-b shadow-sm sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleExitClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ${dark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              {t(lang, 'exit')}
            </motion.button>
            {onHome && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onHome}
                className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                title="홈으로"
              >
                <Home className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${dark ? "text-purple-400" : "text-purple-600"}`} />
            <h1 className="font-bold text-base sm:text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {t(lang, 'chatTitle')}
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowApiKeyModal(true)}
            className={`p-2 rounded-xl ${dark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}
            title="API 키 설정"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.header>

      {/* ── 본문 (사이드바 + 채팅) ── */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">

        {/* ── 왼쪽 사이드바 ── */}
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`w-72 flex-shrink-0 flex flex-col border-r ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
          style={{ height: "calc(100vh - 57px)" }}
        >
          {/* 검색 */}
          <div className={`p-3 border-b ${dark ? "border-gray-800" : "border-gray-200"}`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
              <Search className={`w-4 h-4 flex-shrink-0 ${dark ? "text-gray-400" : "text-gray-500"}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t(lang, 'searchPlaceholder')}
                className={`flex-1 bg-transparent text-sm focus:outline-none ${dark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 시대 필터 탭 */}
          <div className={`flex gap-1 px-3 py-2 border-b overflow-x-auto scrollbar-hide ${dark ? "border-gray-800" : "border-gray-200"}`}>
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedPeriod === p
                    ? "bg-purple-600 text-white shadow"
                    : dark
                      ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {p === "사용자추가" ? "직접추가" : p}
              </button>
            ))}
          </div>

          {/* 대화 완료 인물 카운트 */}
          <div className={`px-4 py-2.5 border-b ${dark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🔒</span>
                <span className={`text-xs font-semibold ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {t(lang, 'completedChars')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {chattedIds.size > 0 && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex gap-0.5"
                  >
                    {Array.from({ length: Math.min(chattedIds.size, 5) }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="w-2 h-2 rounded-full bg-red-400/60"
                      />
                    ))}
                    {chattedIds.size > 5 && <span className="text-[10px] text-gray-400">+{chattedIds.size - 5}</span>}
                  </motion.div>
                )}
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  chattedIds.size > 0
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : dark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-400"
                }`}>
                  {chattedIds.size}명
                </span>
              </div>
            </div>
          </div>

          {/* 인물 목록 */}
          <div className="flex-1 overflow-y-auto">
            {filteredChars.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                <Search className={`w-12 h-12 ${dark ? "text-gray-700" : "text-gray-300"}`} />
                <p className={`text-sm font-medium ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  {searchQuery ? `"${searchQuery}" 검색 결과 없음` : "인물이 없습니다"}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-purple-500 underline"
                  >
                    검색 초기화
                  </button>
                )}
              </div>
            ) : (
              <div className="py-1">
                {/* 검색 결과 수 */}
                <div className={`px-4 py-2 text-xs font-semibold ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  {filteredChars.length}명의 인물
                </div>
                {filteredChars.map(character => {
                  const isSelected = selectedCharacter?.id === character.id;
                  const isChatted = chattedIds.has(character.id);
                  const color = getPeriodColor(character.period);
                  const avatarSrc = getCharacterImagePath(character.id, character.period)
                    || imageCache[character.id]
                    || character.imageUrl;

                  return (
                    <motion.div
                      key={character.id}
                      initial={isChatted ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: isChatted ? 0 : 4 }}
                      onClick={() => handleSelectCharacter(character)}
                      className={`mx-2 mb-1 px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-3 transition-all border-2 relative overflow-hidden ${
                        isSelected
                          ? dark
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-purple-400 bg-purple-50"
                          : isChatted
                            ? dark
                              ? "border-gray-700/60 bg-gray-800/30"
                              : "border-gray-200 bg-gray-100/60"
                            : dark
                              ? "border-transparent hover:bg-gray-800"
                              : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      {/* 대화 완료 인물 대각선 사선 오버레이 */}
                      {isChatted && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage: dark
                              ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px)"
                              : "repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px)",
                          }}
                        />
                      )}

                      {/* 아바타 */}
                      <div
                        className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center flex-none"
                        style={{
                          background: isChatted
                            ? dark ? "rgba(55,65,81,0.5)" : "rgba(209,213,219,0.5)"
                            : `linear-gradient(135deg, ${color}30, ${color}60)`,
                          border: `2px solid ${isChatted ? (dark ? "#374151" : "#D1D5DB") : color + "80"}`,
                        }}
                      >
                        <ImageWithFallback
                          src={avatarSrc}
                          alt={character.name}
                          className={`w-full h-full object-cover transition-all duration-500 ${isChatted ? "grayscale brightness-50" : ""}`}
                          fallbackEmoji={character.emoji ?? "👤"}
                        />
                        {/* 완료 도장 오버레이 */}
                        {isChatted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: -15 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-8 h-8 rounded-full border-2 border-red-400/70 flex items-center justify-center bg-red-900/50">
                              <span className="text-[10px] font-black text-red-300 leading-none tracking-tighter">완료</span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-bold truncate ${
                            isChatted
                              ? dark ? "text-gray-500 line-through decoration-gray-600" : "text-gray-400 line-through decoration-gray-300"
                              : dark ? "text-white" : "text-gray-900"
                          }`}>
                            {character.name.replace(/^[①-⑳㉑-㉟㊱-㊿\d]+\s*/, "")}
                          </p>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${
                          isChatted
                            ? dark ? "text-gray-600" : "text-gray-400"
                            : dark ? "text-gray-500" : "text-gray-400"
                        }`}>
                          {isChatted ? `🔒 ${t(lang, 'chattedBadge')}` : `${character.period} · ${character.role}`}
                        </p>
                      </div>

                      {/* 우측 뱃지 */}
                      <div className="flex flex-col items-end gap-1 flex-none">
                        {isChatted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: dark ? "rgba(55,65,81,0.8)" : "rgba(229,231,235,0.9)" }}
                          >
                            <span className="text-[11px]">✓</span>
                          </motion.div>
                        ) : isSelected ? (
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" fill="currentColor" />
                        ) : (
                          <ChevronRight className={`w-4 h-4 ${dark ? "text-gray-600" : "text-gray-300"}`} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.aside>

        {/* ── 오른쪽: 채팅 영역 ── */}
        <motion.main
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 flex flex-col overflow-hidden"
          style={{ height: "calc(100vh - 57px)" }}
        >
          {!selectedCharacter ? (
            /* 인물 미선택 안내 - 카드 인물 이미지 프리뷰 */
            <div className={`flex-1 flex flex-col items-center justify-center gap-6 p-8 ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
              {/* 타이틀 */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h3 className={`text-2xl font-black mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
                  역사 인물을 선택해주세요
                </h3>
                <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  왼쪽 목록에서 대화하고 싶은 인물을 골라보세요
                </p>
              </motion.div>

              {/* 시대별 인물 이미지 프리뷰 */}
              {(["고조선","삼국시대","고려","조선","근현대"] as const).map((period, periodIdx) => {
                const periodChars = allChatChars
                  .filter(c => c.period === period)
                  .slice(0, 8);
                const color = getPeriodColor(period);
                return (
                  <motion.div
                    key={period}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: periodIdx * 0.08 }}
                    className="w-full max-w-2xl"
                  >
                    {/* 시대 레이블 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {period}
                      </span>
                      <div className={`flex-1 h-px ${dark ? "bg-gray-800" : "bg-gray-200"}`} />
                    </div>
                    {/* 인물 원형 이미지 */}
                    <div className="flex gap-2 flex-wrap">
                      {periodChars.map((char, idx) => {
                        const imgSrc = getCharacterImagePath(char.id, char.period);
                        return (
                          <motion.button
                            key={char.id}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: periodIdx * 0.08 + idx * 0.03 }}
                            whileHover={{ scale: 1.12, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelectCharacter(char)}
                            className="flex flex-col items-center gap-1 group"
                            title={char.name}
                          >
                            <div
                              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md transition-shadow group-hover:shadow-xl"
                              style={{
                                border: `2.5px solid ${color}`,
                                background: `linear-gradient(135deg, ${color}20, ${color}50)`,
                              }}
                            >
                              <ImageWithFallback
                                src={imgSrc}
                                alt={char.name}
                                className="w-full h-full object-cover"
                                fallbackEmoji={char.emoji ?? "👤"}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-semibold text-center leading-tight max-w-[48px] truncate ${
                                dark ? "text-gray-400" : "text-gray-500"
                              } group-hover:text-purple-500 transition-colors`}
                            >
                              {char.name.replace(/^[①-⑳\d]+\s*/, "")}
                            </span>
                          </motion.button>
                        );
                      })}
                      {/* 더보기 버튼 */}
                      {allChatChars.filter(c => c.period === period).length > 8 && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: periodIdx * 0.08 + 0.25 }}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setSelectedPeriod(period)}
                          className={`flex flex-col items-center gap-1 group`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                              dark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                            } group-hover:bg-purple-100 group-hover:text-purple-600 transition-all`}
                            style={{ border: `2px dashed ${color}80` }}
                          >
                            +{allChatChars.filter(c => c.period === period).length - 8}
                          </div>
                          <span className={`text-[10px] font-semibold ${dark ? "text-gray-500" : "text-gray-400"} group-hover:text-purple-500`}>
                            더보기
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* 하단 안내 */}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium ${dark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                <span>📚</span>
                <span>총 {allChatChars.filter(c => !(c as ChatCharacter).isCustom).length}명 · 초등 사회과 역사 교육과정 기반 · 최대 10턴 학습</span>
              </div>
            </div>
          ) : (
            <div className={`flex-1 flex flex-col overflow-hidden ${dark ? "bg-gray-950" : "bg-gray-50"}`}>

              {/* 채팅 헤더 */}
              <div
                className="px-5 py-3"
                style={{
                  background: dark
                    ? `linear-gradient(135deg, ${periodColor}15, transparent)`
                    : `linear-gradient(135deg, ${periodColor}10, transparent)`,
                  borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                }}
              >
                {/* 상단: 인물 정보 + 단계 배지 + 재시작 버튼 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={{ border: `2px solid ${periodColor}` }}
                    >
                      <ImageWithFallback
                        src={charImageSrc}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-cover"
                        fallbackEmoji={selectedCharacter.emoji ?? "👤"}
                      />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>
                        {selectedCharacter.name}
                      </p>
                      <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                        {selectedCharacter.period} · {selectedCharacter.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isChatEnded
                          ? dark ? "bg-emerald-800/60 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                          : isNearEnd
                            ? "bg-amber-100 text-amber-600 animate-pulse"
                            : dark
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {isChatEnded ? `🎓 ${t(lang, 'chatEnded')}` : `💬 ${userTurnCount}/${MAX_TURNS}`}
                    </span>
                    {isChatEnded && (
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleRestartChat}
                        className={`p-2 rounded-lg ${dark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"} shadow`}
                        title={t(lang, 'restartChat')}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* 하단: 대화 진행 바 */}
                <div className="space-y-1">
                  {/* 진행 바 */}
                  <div className={`relative h-2 rounded-full overflow-hidden ${dark ? "bg-gray-800" : "bg-gray-200"}`}>
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: isChatEnded
                          ? "linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6, #F59E0B)"
                          : "linear-gradient(90deg, #7C3AED, #EC4899)",
                      }}
                      animate={{ width: `${Math.min((userTurnCount / MAX_TURNS) * 100, 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                {/* 인물 소개 카드 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex justify-center mb-2`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl text-center max-w-xs shadow-lg border ${dark ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"}`}
                  >
                    <div
                      className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 flex items-center justify-center"
                      style={{
                        border: `3px solid ${periodColor}`,
                        background: `linear-gradient(135deg, ${periodColor}20, ${periodColor}40)`,
                      }}
                    >
                      <ImageWithFallback
                        src={charImageSrc}
                        alt={selectedCharacter.name}
                        className="w-full h-full object-cover"
                        fallbackEmoji={selectedCharacter.emoji ?? "👤"}
                      />
                    </div>
                    <p className={`font-black text-base ${dark ? "text-white" : "text-gray-900"}`}>
                      {selectedCharacter.name}
                    </p>
                    <p
                      className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block text-white"
                      style={{ backgroundColor: periodColor }}
                    >
                      {selectedCharacter.period}
                    </p>
                    <p className={`text-xs mt-1.5 line-clamp-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                      {selectedCharacter.description}
                    </p>
                  </div>
                </motion.div>

                <AnimatePresence initial={false}>
                  {messages.map(message => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "character" && (
                        <div
                          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                          style={{ border: `2px solid ${periodColor}60` }}
                        >
                          <ImageWithFallback
                            src={charImageSrc}
                            alt={selectedCharacter.name}
                            className="w-full h-full object-cover"
                            fallbackEmoji={selectedCharacter.emoji ?? "👤"}
                          />
                        </div>
                      )}
                      <div className={`max-w-[72%] flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${
                            message.sender === "user"
                              ? "text-white rounded-br-none"
                              : dark
                                ? "bg-gray-800 border border-gray-700 rounded-bl-none"
                                : "bg-white border border-gray-200 rounded-bl-none"
                          }`}
                          style={message.sender === "user" ? { background: `linear-gradient(135deg, #7C3AED, #DB2777)` } : {}}
                        >
                          {message.text}
                        </div>
                        <p className={`text-xs mt-1 px-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>
                          {message.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* 로딩 */}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: `2px solid ${periodColor}60` }}>
                      <ImageWithFallback src={charImageSrc} alt={selectedCharacter.name} className="w-full h-full object-cover" fallbackEmoji={selectedCharacter.emoji ?? "👤"} />
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-bl-none shadow-sm ${dark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
                      <div className="flex gap-1.5">
                        {[0, 150, 300].map(delay => (
                          <div key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: periodColor, animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 대화 종료 - 학습 완료 카드 */}
                {isChatEnded && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className={`mx-auto max-w-md p-5 rounded-3xl border-2 shadow-xl ${
                      dark ? "bg-gradient-to-br from-purple-900/40 to-yellow-900/20 border-yellow-500/40" : "bg-gradient-to-br from-purple-50 to-yellow-50 border-yellow-300"
                    }`}
                  >
                    {/* 타이틀 */}
                    <div className="text-center mb-4">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-4xl mb-2"
                      >
                        🎓
                      </motion.div>
                      <p className={`font-black text-base ${dark ? "text-yellow-300" : "text-yellow-700"}`}>
                        {lang === 'ko' ? '오늘의 역사 학습 완료!' : "Today's History Learning Complete!"}
                      </p>
                      <p className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                        {selectedCharacter.name}과(와) {MAX_TURNS}턴의 대화를 마쳤어요
                      </p>
                    </div>

                    {/* 대화 완료 메시지 */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className={`text-sm text-center px-4 py-2 rounded-xl ${dark ? "bg-white/10 text-gray-300" : "bg-white/60 text-gray-600"}`}>
                        {selectedCharacter.name.replace(/^[①-㊿]\s*/, "")}과(와) <span className="font-black text-purple-600">{MAX_TURNS}턴</span>의 대화를 나눴어요 ✨
                      </div>
                    </div>

                    {/* 점수 획득 배지 */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <motion.span
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black text-white shadow-lg"
                        style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
                      >
                        ⭐ +{CHAT_COMPLETION_SCORE}점 획득!
                      </motion.span>
                    </div>

                    {/* 버튼 */}
                    <div className="flex flex-col gap-2">
                      {/* 점수 게시판 등록 버튼 (메인) */}
                      <button
                        onClick={() => onChatCompleted && onChatCompleted(CHAT_COMPLETION_SCORE, selectedCharacter.name, selectedCharacter.period, selectedCharacter.id)}
                        className="w-full py-3 rounded-xl text-sm font-black text-white shadow-lg flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)" }}
                      >
                        🏆 {t(lang, 'registerScore')}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRestartChat}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            dark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                          } shadow`}
                        >
                          <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                          {t(lang, 'restartChat')}
                        </button>
                        <button
                          onClick={() => setSelectedCharacter(null)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow"
                          style={{ background: `linear-gradient(135deg, ${periodColor}, #7C3AED)` }}
                        >
                          {t(lang, 'otherCharacter')}
                        </button>
                      </div>
                      <button
                        onClick={onBack}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          dark ? "bg-gray-800/80 hover:bg-gray-700 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                        }`}
                      >
                        ← {lang === 'ko' ? '목록으로 돌아가기' : 'Back to List'}
                      </button>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className={`px-4 py-3 border-t ${dark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white/80"} backdrop-blur-sm`}>
                {/* 욕설·부적절 입력 경고 */}
                <AnimatePresence>
                  {badWordWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className="flex items-start gap-2 mb-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-600 text-xs font-bold">바른 말을 사용해 주세요! 🙏</p>
                        <p className="text-red-500 text-xs mt-0.5">
                          욕설·비방·원색적인 표현은 역사 인물과의 대화에서 사용할 수 없어요.<br />
                          예의 바른 말로 다시 질문해 보세요 😊
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 대화 힌트 */}
                {!isChatEnded && (
                  <div className={`flex items-center gap-1.5 text-xs mb-2 px-1`}>
                    <span className={`font-semibold ${dark ? "text-gray-400" : "text-gray-500"}`}>
                      💬 {t(lang, 'chatHint')}
                    </span>
                    {isNearEnd && (
                      <span className="ml-auto text-amber-500 font-bold animate-pulse text-xs">
                        ✨ {turnsLeft}번 남음
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isChatEnded
                        ? "학습 완료! 다시 시작하거나 다른 인물을 선택하세요."
                        : `${selectedCharacter.name}에게 질문하세요! (예의 바른 말 사용)`
                    }
                    disabled={isLoading || isChatEnded}
                    className={`flex-1 px-4 py-2.5 rounded-2xl border-2 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                      dark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400"
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading || isChatEnded}
                    className="px-4 py-2.5 rounded-2xl text-white font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    style={{ background: `linear-gradient(135deg, #7C3AED, #DB2777)` }}
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-sm">전송</span>
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </div>

      {/* ── 카드 해금 알림 ── */}
      <AnimatePresence>
        {showUnlockNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-black text-sm">+{CHAT_COMPLETION_SCORE}점 획득!</p>
                <p className="text-xs opacity-90">{selectedCharacter?.name}와(과) 대화 완료 🎊</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── API 키 설정 모달 ── */}
      <AnimatePresence>
        {showApiKeyModal && (
          <ApiKeyModal onClose={() => setShowApiKeyModal(false)} darkMode={dark} />
        )}
      </AnimatePresence>
    </div>
  );
}

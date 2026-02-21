import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Info, ExternalLink, Camera } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MuseumTourProps {
  onBack: () => void;
  darkMode?: boolean;
}

interface MuseumSection {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artifacts: string[];
  floor: string;
}

export function MuseumTour({ onBack, darkMode = false }: MuseumTourProps) {
  const [selectedSection, setSelectedSection] = useState<MuseumSection | null>(null);

  const museumSections: MuseumSection[] = [
    {
      id: 'prehistory',
      title: '선사·고대관',
      description: '구석기시대부터 통일신라시대까지의 유물',
      imageUrl: 'https://images.unsplash.com/photo-1706794831005-e0cbae755fae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwa29yZWFuJTIwcG90dGVyeSUyMGNlcmFtaWNzfGVufDF8fHx8MTc3MDg0MTI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      artifacts: ['빗살무늬토기', '반구대 암각화', '금관', '천마도'],
      floor: '1층'
    },
    {
      id: 'goryeo',
      title: '고려실',
      description: '고려시대의 찬란한 문화유산',
      imageUrl: 'https://images.unsplash.com/photo-1764925772504-169a3f1e18f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBjdWx0dXJhbCUyMGhlcml0YWdlJTIwdHJlYXN1cmV8ZW58MXx8fHwxNzcwODQxMjgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      artifacts: ['청자상감운학문매병', '팔만대장경', '직지심체요절', '상감청자'],
      floor: '2층'
    },
    {
      id: 'joseon',
      title: '조선실',
      description: '조선왕조 500년의 역사와 문화',
      imageUrl: 'https://images.unsplash.com/photo-1712412960347-cc340ad9bc81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXRpb25hbCUyMG11c2V1bSUyMGtvcmVhJTIwYXJ0aWZhY3RzfGVufDF8fHx8MTc3MDg0MTI4MXww&ixlib=rb-4.1.0&q=80&w=1080',
      artifacts: ['훈민정음 해례본', '일월오봉도', '백자달항아리', '어보'],
      floor: '2층'
    },
    {
      id: 'calligraphy',
      title: '서화실',
      description: '한국의 전통 서예와 회화',
      imageUrl: 'https://images.unsplash.com/photo-1609224551451-488966de2e67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGNyYWZ0cyUyMGFydHxlbnwxfHx8fDE3NzA4NDEyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      artifacts: ['겸재 정선의 인왕제색도', '김홍도의 풍속화첩', '신윤복의 미인도'],
      floor: '2층'
    },
    {
      id: 'special',
      title: '기획전시실',
      description: '특별 기획 전시',
      imageUrl: 'https://images.unsplash.com/photo-1569342380852-035f42d9ca41?crop=entropy&cs=tinysrbg&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBleGhpYml0aW9uJTIwZ2FsbGVyeXxlbnwxfHx8fDE3NzA4NDEyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      artifacts: ['계절별 특별 전시', '테마 전시', '국제 교류 전시'],
      floor: '1층'
    },
    {
      id: 'asia',
      title: '아시아관',
      description: '아시아 각국의 문화유산',
      imageUrl: 'https://images.unsplash.com/photo-1712412960347-cc340ad9bc81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXRpb25hbCUyMG11c2V1bSUyMGtvcmVhJTIwYXJ0aWZhY3RzfGVufDF8fHx8MTc3MDg0MTI4MXww&ixlib=rb-4.1.0&q=80&w=1080',
      artifacts: ['중국 도자기', '일본 병풍', '동남아시아 불상', '중앙아시아 직물'],
      floor: '3층'
    }
  ];

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
              <MapPin className={`w-5 h-5 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                국립중앙박물관 둘러보기
              </h1>
            </div>

            <div className="w-20 sm:w-32" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Museum Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            darkMode 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/70 border-white/90'
          } backdrop-blur-2xl border-2 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8`}
        >
          <div className="flex items-start gap-4 mb-6">
            <Info className={`w-8 h-8 flex-shrink-0 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">국립중앙박물관</h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                우리나라를 대표하는 박물관으로, 선사시대부터 근현대까지 한국의 역사와 문화를 한눈에 볼 수 있는 곳이에요.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MapPin className="w-4 h-4" />
                  <span>서울특별시 용산구 서빙고로 137</span>
                </div>
                <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Camera className="w-4 h-4" />
                  <span>소장품: 약 42만 점</span>
                </div>
              </div>
            </div>
          </div>

          <motion.a
            href="https://www.museum.go.kr/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            공식 홈페이지 방문하기
          </motion.a>
        </motion.div>

        {/* Exhibition Sections Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {museumSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              onClick={() => setSelectedSection(section)}
              className={`${
                darkMode 
                  ? 'bg-gray-800/70 border-gray-700/50' 
                  : 'bg-white/80 border-white/90'
              } backdrop-blur-xl border-2 rounded-3xl overflow-hidden shadow-xl cursor-pointer transition-all`}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <ImageWithFallback
                  src={section.imageUrl}
                  alt={section.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{section.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    darkMode
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {section.floor}
                  </span>
                </div>
                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {section.description}
                </p>

                {/* Artifacts Preview */}
                <div className="space-y-2">
                  <p className={`text-xs font-bold ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    주요 전시품:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {section.artifacts.slice(0, 2).map((artifact, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-lg text-xs ${
                          darkMode
                            ? 'bg-gray-700/50 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {artifact}
                      </span>
                    ))}
                    {section.artifacts.length > 2 && (
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        darkMode
                          ? 'bg-gray-700/50 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        +{section.artifacts.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Virtual Tour Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`mt-8 ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50'
          } border-2 rounded-3xl p-6 text-center`}
        >
          <h3 className="text-xl font-bold mb-2">💡 알고 계셨나요?</h3>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            국립중앙박물관은 온라인 가상 투어도 제공하고 있어요!<br />
            집에서도 박물관을 둘러볼 수 있답니다.
          </p>
        </motion.div>
      </div>

      {/* Section Detail Modal */}
      {selectedSection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSection(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } border-2 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto`}
          >
            <div className="aspect-video overflow-hidden rounded-2xl mb-4">
              <ImageWithFallback
                src={selectedSection.imageUrl}
                alt={selectedSection.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold">{selectedSection.title}</h3>
              <span className={`px-4 py-2 rounded-full font-bold ${
                darkMode
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {selectedSection.floor}
              </span>
            </div>

            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {selectedSection.description}
            </p>

            <div className="mb-6">
              <h4 className="font-bold mb-3">주요 전시품:</h4>
              <div className="space-y-2">
                {selectedSection.artifacts.map((artifact, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-xl ${
                      darkMode
                        ? 'bg-gray-700/50 border-gray-600/50'
                        : 'bg-gray-50 border-gray-200/50'
                    } border flex items-center gap-3`}
                  >
                    <span className="text-2xl">🏺</span>
                    <span>{artifact}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSection(null)}
              className={`w-full px-6 py-3 rounded-2xl ${
                darkMode
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-200 text-gray-800'
              } font-bold shadow-lg`}
            >
              닫기
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

import type { Character } from './quizData';

// 총 205명의 역사 인물 데이터
// 고조선 5명, 삼국시대 30명, 고려 30명, 조선 100명, 근현대 40명

export const allCharacters: Character[] = [

  // ========================================
  // 고조선 (5명)
  // ========================================
  {
    id: 'gojoseon-001',
    name: '① 단군왕검',
    period: '고조선',
    role: '고조선 건국 시조',
    description: '우리나라 최초의 국가 고조선을 세운 시조. 하늘의 손자이자 웅녀의 아들로 홍익인간의 이념을 펼쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'gojoseon-002',
    name: '② 환웅',
    period: '고조선',
    role: '천신의 아들',
    description: '하늘의 환인 아들. 3천 무리를 이끌고 태백산에 내려와 신시를 열었어요. 풍백·우사·운사를 거느렸어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '☁️'
  },
  {
    id: 'gojoseon-003',
    name: '③ 웅녀',
    period: '고조선',
    role: '단군왕검의 어머니',
    description: '곰에서 사람이 된 여인. 쑥과 마늘을 먹으며 100일 동안 동굴에서 견뎌 사람이 되었고, 환웅과 결혼해 단군왕검을 낳았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🐻'
  },
  {
    id: 'gojoseon-004',
    name: '④ 위만',
    period: '고조선',
    role: '위만조선 건립자',
    description: '중국에서 망명해 고조선 준왕을 몰아내고 왕이 되었어요. 철기 문화를 발전시키고 중계 무역으로 부를 쌓았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'gojoseon-005',
    name: '⑤ 우거왕',
    period: '고조선',
    role: '위만조선의 왕',
    description: '위만의 손자. 한나라의 침입에 맞서 끝까지 저항한 고조선의 마지막 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },

  // ========================================
  // 삼국시대 (30명)
  // ========================================
  {
    id: 'three-kingdoms-001',
    name: '① 광개토대왕',
    period: '삼국시대',
    role: '고구려 19대 왕',
    description: '고구려를 동아시아 최강국으로 만든 정복 군주. 만주와 한반도 대부분을 차지하며 영토를 크게 넓혔어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-002',
    name: '② 을지문덕',
    period: '삼국시대',
    role: '고구려 장군',
    description: '살수대첩에서 수나라 30만 대군을 물리친 지략의 귀재예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-003',
    name: '③ 연개소문',
    period: '삼국시대',
    role: '고구려 대막리지',
    description: '강력한 군사력으로 당나라를 여러 번 물리친 고구려의 실권자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🗡️'
  },
  {
    id: 'three-kingdoms-004',
    name: '④ 주몽',
    period: '삼국시대',
    role: '고구려 건국 시조',
    description: '고구려를 건국한 영웅. 알에서 태어나 활을 잘 쏘았다는 전설이 있어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏹'
  },
  {
    id: 'three-kingdoms-005',
    name: '⑤ 양만춘',
    period: '삼국시대',
    role: '고구려 장군',
    description: '안시성 전투에서 당 태종의 대군을 물리친 전설의 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏹'
  },
  {
    id: 'three-kingdoms-006',
    name: '⑥ 대조영',
    period: '삼국시대',
    role: '발해 건국 시조',
    description: '고구려 유민을 이끌고 발해를 건국한 영웅. 동모산 아래에서 나라를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏔️'
  },
  {
    id: 'three-kingdoms-007',
    name: '⑦ 온달',
    period: '삼국시대',
    role: '고구려 장군',
    description: '바보 온달로 불렸지만 평강공주의 도움으로 뛰어난 장군이 된 입지전적 인물이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-008',
    name: '⑧ 평강공주',
    period: '삼국시대',
    role: '고구려 공주',
    description: '온달을 훌륭한 장군으로 키워낸 고구려의 현명한 공주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'three-kingdoms-009',
    name: '⑨ 온조왕',
    period: '삼국시대',
    role: '백제 건국 시조',
    description: '백제를 건국한 왕. 한강 유역을 중심으로 나라를 세우고 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏛️'
  },
  {
    id: 'three-kingdoms-010',
    name: '⑩ 근초고왕',
    period: '삼국시대',
    role: '백제 13대 왕',
    description: '백제의 전성기를 이끈 왕. 영토를 크게 넓히고 일본에까지 문화를 전파했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-011',
    name: '⑪ 계백',
    period: '삼국시대',
    role: '백제 장군',
    description: '황산벌 전투에서 5천 군사로 5만 신라군과 싸운 충신 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-012',
    name: '⑫ 왕인',
    period: '삼국시대',
    role: '백제 학자',
    description: '일본에 논어와 천자문을 전한 학자. 일본 문화의 스승으로 존경받아요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'three-kingdoms-013',
    name: '⑬ 혁거세',
    period: '삼국시대',
    role: '신라 건국 시조',
    description: '신라를 건국한 왕. 알에서 태어났다는 전설을 가진 신라의 첫 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🥚'
  },
  {
    id: 'three-kingdoms-014',
    name: '⑭ 선덕여왕',
    period: '삼국시대',
    role: '신라 27대 왕',
    description: '신라 최초의 여왕. 첨성대를 건설하고 학문과 예술을 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'three-kingdoms-015',
    name: '⑮ 진흥왕',
    period: '삼국시대',
    role: '신라 24대 왕',
    description: '신라 영토를 크게 넓힌 정복 군주. 화랑도를 개편하고 순수비를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-016',
    name: '⑯ 이차돈',
    period: '삼국시대',
    role: '신라 귀족',
    description: '불교 공인을 위해 목숨을 바친 순교자. 죽을 때 흰 피가 흘렀다는 전설이 있어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'three-kingdoms-017',
    name: '⑰ 김유신',
    period: '삼국시대',
    role: '신라 장군',
    description: '삼국통일의 주역. 화랑 출신으로 수많은 전투에서 승리를 거두었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-018',
    name: '⑱ 김춘추',
    period: '삼국시대',
    role: '신라 29대 왕 (태종무열왕)',
    description: '신라의 삼국통일을 이끈 왕. 외교와 전략으로 당나라와 동맹을 맺었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-019',
    name: '⑲ 문무왕',
    period: '삼국시대',
    role: '신라 30대 왕',
    description: '삼국통일을 완성한 왕. 죽어서도 나라를 지키겠다며 동해의 용이 되었다는 전설이 있어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🐉'
  },
  {
    id: 'three-kingdoms-020',
    name: '⑳ 원효대사',
    period: '삼국시대',
    role: '신라 승려',
    description: '불교를 대중화한 고승. 나무아미타불을 퍼뜨려 모든 사람이 부처가 될 수 있다고 가르쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'three-kingdoms-021',
    name: '㉑ 의상대사',
    period: '삼국시대',
    role: '신라 승려',
    description: '화엄종을 창시한 고승. 부석사를 세우고 불교 철학을 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📿'
  },
  {
    id: 'three-kingdoms-022',
    name: '㉒ 혜초',
    period: '삼국시대',
    role: '신라 승려·여행가',
    description: '인도와 중앙아시아를 여행하고 왕오천축국전을 쓴 신라의 위대한 여행가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✈️'
  },
  {
    id: 'three-kingdoms-023',
    name: '㉓ 최치원',
    period: '삼국시대',
    role: '신라 문장가',
    description: '12세에 당나라에 유학가 과거에 급제한 천재. 아름다운 문장으로 유명했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✒️'
  },
  {
    id: 'three-kingdoms-024',
    name: '㉔ 설총',
    period: '삼국시대',
    role: '신라 학자',
    description: '원효의 아들로, 이두를 정리해 한문 학습을 쉽게 만든 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📝'
  },
  {
    id: 'three-kingdoms-025',
    name: '㉕ 장보고',
    period: '삼국시대',
    role: '신라 무역왕',
    description: '청해진을 설치하고 해상무역을 장악한 해상왕. 동아시아 무역의 중심이었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚓'
  },
  {
    id: 'three-kingdoms-026',
    name: '㉖ 김대성',
    period: '삼국시대',
    role: '신라 인물',
    description: '석굴암과 불국사를 세운 인물. 부모의 은혜에 보답하기 위해 절을 지었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏯'
  },
  {
    id: 'three-kingdoms-027',
    name: '㉗ 소서노',
    period: '삼국시대',
    role: '고구려·백제 건국 공헌',
    description: '고구려 건국을 도운 뒤, 아들 온조와 함께 남쪽으로 내려가 백제 건국의 기반을 닦은 위대한 여성이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-028',
    name: '㉘ 관창',
    period: '삼국시대',
    role: '신라 화랑',
    description: '16세의 나이로 황산벌 전투에서 세 번이나 적진에 뛰어든 용감한 화랑이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🦁'
  },
  {
    id: 'three-kingdoms-029',
    name: '㉙ 도미부인',
    period: '삼국시대',
    role: '백제 열녀',
    description: '개로왕의 협박을 받았지만 정절을 지킨 백제의 열녀예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌺'
  },
  {
    id: 'three-kingdoms-030',
    name: '㉚ 강수',
    period: '삼국시대',
    role: '신라 학자',
    description: '당나라와의 외교 문서를 도맡아 쓴 신라 최고의 문장가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },

  // ========================================
  // 고려시대 (30명)
  // ========================================
  {
    id: 'goryeo-001',
    name: '① 왕건',
    period: '고려',
    role: '고려 태조',
    description: '고려를 건국하고 후삼국을 통일한 왕. 호족들을 포용하는 정책으로 나라를 안정시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-002',
    name: '② 광종',
    period: '고려',
    role: '고려 4대 왕',
    description: '노비안검법과 과거제를 실시해 왕권을 강화한 개혁 군주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-003',
    name: '③ 성종',
    period: '고려',
    role: '고려 6대 왕',
    description: '최승로의 시무 28조를 받아들여 유교 정치를 확립한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-004',
    name: '④ 서희',
    period: '고려',
    role: '고려 문신',
    description: '거란의 소손녕과 담판을 벌여 강동 6주를 확보한 외교의 달인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🗣️'
  },
  {
    id: 'goryeo-005',
    name: '⑤ 강감찬',
    period: '고려',
    role: '고려 장군',
    description: '귀주대첩에서 거란군을 대승으로 물리친 지혜로운 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-006',
    name: '⑥ 윤관',
    period: '고려',
    role: '고려 장군',
    description: '별무반을 조직해 여진을 물리치고 동북 9성을 쌓은 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏰'
  },
  {
    id: 'goryeo-007',
    name: '⑦ 최승로',
    period: '고려',
    role: '고려 문신',
    description: '성종에게 시무 28조를 올려 유교 정치의 기틀을 마련한 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'goryeo-008',
    name: '⑧ 김부식',
    period: '고려',
    role: '고려 역사가',
    description: '삼국사기를 편찬한 역사가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-009',
    name: '⑨ 정중부',
    period: '고려',
    role: '고려 무신',
    description: '무신정변을 일으켜 문신 귀족 정치를 무너뜨린 무신의 대표예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-010',
    name: '⑩ 최충헌',
    period: '고려',
    role: '고려 무신 집권자',
    description: '최씨 무신 정권을 시작한 인물. 교정도감을 설치해 권력을 장악했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },
  {
    id: 'goryeo-011',
    name: '⑪ 김윤후',
    period: '고려',
    role: '고려 승려·장군',
    description: '처인성 전투에서 몽골 장군 살리타이를 죽인 승려 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏹'
  },
  {
    id: 'goryeo-012',
    name: '⑫ 배중손',
    period: '고려',
    role: '삼별초 장군',
    description: '삼별초를 이끌고 진도에서 몽골에 저항한 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'goryeo-013',
    name: '⑬ 공민왕',
    period: '고려',
    role: '고려 31대 왕',
    description: '원나라의 간섭을 벗어나고자 개혁을 추진한 왕. 노국대장공주와의 사랑으로도 유명해요.',
    unlocked: false,
    imageUrl: '',
    emoji: '❤️'
  },
  {
    id: 'goryeo-014',
    name: '⑭ 최영',
    period: '고려',
    role: '고려 장군',
    description: '왜구를 물리친 명장. "황금 보기를 돌같이 하라"는 청렴한 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-015',
    name: '⑮ 이성계',
    period: '고려',
    role: '고려 장군',
    description: '왜구를 물리치고 위화도에서 회군해 조선을 건국한 인물이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-016',
    name: '⑯ 정몽주',
    period: '고려',
    role: '고려 충신',
    description: '고려에 끝까지 충성한 충신. 단심가를 남기고 선죽교에서 죽음을 맞았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'goryeo-017',
    name: '⑰ 정도전',
    period: '고려',
    role: '고려 말·조선 초 학자',
    description: '조선 건국의 설계자. 성리학을 바탕으로 새 나라의 기틀을 만들었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'goryeo-018',
    name: '⑱ 일연',
    period: '고려',
    role: '고려 승려·역사가',
    description: '삼국유사를 쓴 승려 역사가. 단군신화 등 우리 민족의 이야기를 기록했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'goryeo-019',
    name: '⑲ 이규보',
    period: '고려',
    role: '고려 문장가',
    description: '동명왕편을 쓴 문장가. 고구려의 역사를 자랑스럽게 노래했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✒️'
  },
  {
    id: 'goryeo-020',
    name: '⑳ 안향',
    period: '고려',
    role: '고려 학자',
    description: '주자학(성리학)을 고려에 처음 들여온 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'goryeo-021',
    name: '㉑ 최충',
    period: '고려',
    role: '고려 교육자',
    description: '문헌공도라는 사학을 세워 많은 인재를 길러낸 교육자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-022',
    name: '㉒ 대각국사 의천',
    period: '고려',
    role: '고려 승려',
    description: '천태종을 창시하고 교관겸수를 주장한 고승. 문종의 아들이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'goryeo-023',
    name: '㉓ 보조국사 지눌',
    period: '고려',
    role: '고려 승려',
    description: '조계종을 창시하고 선교일치를 주장한 고승. 수선사를 중심으로 활동했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📿'
  },
  {
    id: 'goryeo-024',
    name: '㉔ 문익점',
    period: '고려',
    role: '고려 문신',
    description: '중국에서 목화씨를 붓대에 숨겨 들여온 인물. 목화 재배로 백성들이 따뜻한 솜옷을 입게 되었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌱'
  },
  {
    id: 'goryeo-025',
    name: '㉕ 최무선',
    period: '고려',
    role: '고려 발명가',
    description: '화약 제조법을 개발해 진포해전에서 왜구를 격퇴한 발명가. 우리나라 최초로 화포를 만들었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💥'
  },
  {
    id: 'goryeo-026',
    name: '㉖ 이색',
    period: '고려',
    role: '고려 학자',
    description: '고려 말 성리학을 발전시킨 학자. 정몽주·정도전 등을 가르쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-027',
    name: '㉗ 이승휴',
    period: '고려',
    role: '고려 문신',
    description: '제왕운기를 쓴 역사가. 우리 역사를 중국과 대등하게 서술했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✍️'
  },
  {
    id: 'goryeo-028',
    name: '㉘ 망이·망소이',
    period: '고려',
    role: '고려 농민 지도자',
    description: '무신 정권 시기 가혹한 세금에 맞서 공주 명학소에서 봉기를 일으킨 농민 지도자들이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'goryeo-029',
    name: '㉙ 만적',
    period: '고려',
    role: '고려 노비 해방 운동가',
    description: '"왕후장상의 씨가 따로 있느냐"고 외치며 노비 신분 해방을 꿈꾼 고려의 노비예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'goryeo-030',
    name: '㉚ 신숭겸',
    period: '고려',
    role: '고려 장군',
    description: '왕건을 지키기 위해 왕의 갑옷을 입고 대신 죽은 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },

  // ========================================
  // 조선시대 (100명)
  // ========================================
  {
    id: 'joseon-001',
    name: '① 이성계',
    period: '조선',
    role: '조선 태조',
    description: '조선을 건국한 왕. 위화도 회군으로 고려를 무너뜨리고 새 나라를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-002',
    name: '② 정도전',
    period: '조선',
    role: '조선 개국공신',
    description: '조선 건국의 설계자. 한양 천도를 계획하고 경복궁을 지었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📐'
  },
  {
    id: 'joseon-003',
    name: '③ 이방원',
    period: '조선',
    role: '조선 3대 왕 (태종)',
    description: '강력한 왕권을 확립한 군주. 6조 직계제를 실시해 왕권을 강화했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-004',
    name: '④ 세종대왕',
    period: '조선',
    role: '조선 4대 왕',
    description: '한글을 창제하고 과학기술을 발전시킨 성군. 백성을 사랑한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-005',
    name: '⑤ 장영실',
    period: '조선',
    role: '조선 과학자',
    description: '노비 출신으로 자격루·측우기 등을 발명한 천재 과학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚙️'
  },
  {
    id: 'joseon-006',
    name: '⑥ 정인지',
    period: '조선',
    role: '조선 학자',
    description: '집현전 학사로 한글 창제에 참여하고 훈민정음 해례본을 쓴 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-007',
    name: '⑦ 신숙주',
    period: '조선',
    role: '조선 문신',
    description: '집현전 학사 출신으로 훈민정음 창제에 참여한 학자. 해동제국기를 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-008',
    name: '⑧ 단종',
    period: '조선',
    role: '조선 6대 왕',
    description: '어린 나이에 왕위에 올랐다가 숙부 수양대군에게 왕위를 빼앗긴 비운의 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'joseon-009',
    name: '⑨ 세조',
    period: '조선',
    role: '조선 7대 왕',
    description: '강력한 왕권을 확립하고 경국대전 편찬을 시작한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-010',
    name: '⑩ 성삼문',
    period: '조선',
    role: '사육신',
    description: '사육신의 대표로 단종 복위를 위해 목숨을 바친 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'joseon-011',
    name: '⑪ 박팽년',
    period: '조선',
    role: '사육신',
    description: '사육신 중 한 명으로 집현전 학사 출신의 뛰어난 학자였어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-012',
    name: '⑫ 이개',
    period: '조선',
    role: '사육신',
    description: '집현전 학사 출신으로 사육신 중 한 명. 단종 복위를 위해 목숨을 바쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'joseon-013',
    name: '⑬ 김종서',
    period: '조선',
    role: '조선 문신',
    description: '6진을 개척하고 단종을 보필했지만 계유정난 때 죽임을 당한 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-014',
    name: '⑭ 성종',
    period: '조선',
    role: '조선 9대 왕',
    description: '경국대전을 완성해 조선의 법 체계를 확립한 문화 군주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-015',
    name: '⑮ 김시습',
    period: '조선',
    role: '조선 문인',
    description: '생육신 중 한 명. 금오신화를 쓴 한국 최초의 한문 소설가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-016',
    name: '⑯ 연산군',
    period: '조선',
    role: '조선 10대 왕',
    description: '무오사화와 갑자사화가 일어난 시기를 다스렸으며 결국 신하들에 의해 물러난 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚠️'
  },
  {
    id: 'joseon-017',
    name: '⑰ 중종',
    period: '조선',
    role: '조선 11대 왕',
    description: '조광조 등 신진 사림의 개혁을 지원하며 조선 중기를 이끈 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-018',
    name: '⑱ 조광조',
    period: '조선',
    role: '조선 문신',
    description: '현량과를 실시하고 개혁 정치를 펼쳤지만 기묘사화로 죽임을 당한 개혁가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-019',
    name: '⑲ 이황',
    period: '조선',
    role: '조선 성리학자',
    description: '퇴계 선생으로 불리는 성리학의 대가. 도산서원을 세우고 경북 안동에서 학문을 닦았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-020',
    name: '⑳ 이이',
    period: '조선',
    role: '조선 성리학자',
    description: '율곡 선생으로 불리는 성리학자. 10만 양병설을 주장하고 격몽요결을 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-021',
    name: '㉑ 신사임당',
    period: '조선',
    role: '조선 예술가·교육자',
    description: '이이의 어머니. 뛰어난 그림 실력과 학식을 갖춘 조선의 대표 여성이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎨'
  },
  {
    id: 'joseon-022',
    name: '㉒ 유성룡',
    period: '조선',
    role: '조선 문신',
    description: '임진왜란 때 이순신을 천거하고 징비록을 쓴 명재상이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-023',
    name: '㉓ 이순신',
    period: '조선',
    role: '조선 장군',
    description: '임진왜란 때 23전 23승의 신화를 쓴 불패의 장군. 거북선을 만들어 왜적을 물리쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚓'
  },
  {
    id: 'joseon-024',
    name: '㉔ 권율',
    period: '조선',
    role: '조선 장군',
    description: '행주대첩에서 왜군을 물리친 장군. 행주치마 이야기로도 유명해요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-025',
    name: '㉕ 곽재우',
    period: '조선',
    role: '의병장',
    description: '임진왜란 때 의병을 일으킨 홍의장군. 빨간 옷을 입고 싸웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔴'
  },
  {
    id: 'joseon-026',
    name: '㉖ 조헌',
    period: '조선',
    role: '의병장',
    description: '금산 전투에서 700 의병과 함께 끝까지 싸운 충신 의병장이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'joseon-027',
    name: '㉗ 사명대사',
    period: '조선',
    role: '조선 승려·의병장',
    description: '임진왜란 때 승병을 이끌고 싸운 승려. 일본과의 강화 협상에도 활약했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📿'
  },
  {
    id: 'joseon-028',
    name: '㉘ 논개',
    period: '조선',
    role: '조선 의기',
    description: '진주성이 함락되었을 때 왜장을 껴안고 남강에 뛰어든 의기예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💧'
  },
  {
    id: 'joseon-029',
    name: '㉙ 선조',
    period: '조선',
    role: '조선 14대 왕',
    description: '임진왜란이 일어난 시기의 왕. 임란 극복에 많은 신하와 의병이 활약했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-030',
    name: '㉚ 광해군',
    period: '조선',
    role: '조선 15대 왕',
    description: '명나라와 후금(청) 사이에서 중립 외교로 나라를 지키려 한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌏'
  },
  {
    id: 'joseon-031',
    name: '㉛ 인조',
    period: '조선',
    role: '조선 16대 왕',
    description: '병자호란을 겪은 왕. 삼전도의 굴욕 속에서도 나라를 지켜내려 애쓴 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-032',
    name: '㉜ 김상헌',
    period: '조선',
    role: '조선 문신',
    description: '병자호란 때 끝까지 싸우자고 주장한 척화파의 대표 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'joseon-033',
    name: '㉝ 최명길',
    period: '조선',
    role: '조선 문신',
    description: '병자호란 때 현실적인 강화를 주장해 백성의 생명을 구한 주화파의 대표예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-034',
    name: '㉞ 임경업',
    period: '조선',
    role: '조선 장군',
    description: '병자호란 이후 청나라에 맞서 끝까지 저항한 충신 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-035',
    name: '㉟ 효종',
    period: '조선',
    role: '조선 17대 왕',
    description: '북벌을 추진하며 청나라에 당한 치욕을 갚으려 한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-036',
    name: '㊱ 송시열',
    period: '조선',
    role: '조선 학자',
    description: '효종의 북벌을 지지하고 서인 노론의 지도자로 조선 후기 학계를 이끈 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-037',
    name: '㊲ 허준',
    period: '조선',
    role: '조선 의학자',
    description: '동의보감을 저술한 의학자. 백성들이 쉽게 약을 구할 수 있도록 했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌿'
  },
  {
    id: 'joseon-038',
    name: '㊳ 장희빈',
    period: '조선',
    role: '조선 왕비',
    description: '숙종의 총애를 받아 왕비에 올랐다가 내려온 파란만장한 삶의 인물이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'joseon-039',
    name: '㊴ 숙종',
    period: '조선',
    role: '조선 19대 왕',
    description: '환국 정치로 왕권을 강화하고 백두산정계비를 세운 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-040',
    name: '㊵ 영조',
    period: '조선',
    role: '조선 21대 왕',
    description: '탕평책으로 붕당 정치를 완화하고 균역법을 시행한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-041',
    name: '㊶ 사도세자',
    period: '조선',
    role: '조선 왕세자',
    description: '영조의 아들로 뒤주에 갇혀 죽은 비운의 왕세자예요. 정조의 아버지예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'joseon-042',
    name: '㊷ 정조',
    period: '조선',
    role: '조선 22대 왕',
    description: '수원 화성을 건설하고 규장각을 세워 조선 후기 문화를 꽃피운 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏯'
  },
  {
    id: 'joseon-043',
    name: '㊸ 정약용',
    period: '조선',
    role: '조선 실학자',
    description: '다산 선생으로 불리는 실학자. 목민심서·경세유표를 쓰고 거중기를 설계했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-044',
    name: '㊹ 박지원',
    period: '조선',
    role: '조선 실학자·문학가',
    description: '연암 선생으로 불리는 실학자. 열하일기를 쓰고 허생전·양반전 등을 남겼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✒️'
  },
  {
    id: 'joseon-045',
    name: '㊺ 박제가',
    period: '조선',
    role: '조선 실학자',
    description: '북학의를 써서 청나라의 앞선 문물을 받아들이자고 주장한 실학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-046',
    name: '㊻ 홍대용',
    period: '조선',
    role: '조선 실학자',
    description: '지구가 둥글고 자전한다는 것을 주장한 선구적 실학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌍'
  },
  {
    id: 'joseon-047',
    name: '㊼ 김정희',
    period: '조선',
    role: '조선 서예가·학자',
    description: '추사체를 창안한 서예 대가. 세한도를 그린 예술가이기도 해요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🖌️'
  },
  {
    id: 'joseon-048',
    name: '㊽ 채제공',
    period: '조선',
    role: '조선 문신',
    description: '정조를 도와 개혁 정치를 펼친 명재상이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-049',
    name: '㊾ 흥선대원군',
    period: '조선',
    role: '조선 왕의 아버지',
    description: '경복궁을 중건하고 쇄국 정책을 펼쳐 외세를 막으려 한 인물이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏯'
  },
  {
    id: 'joseon-050',
    name: '㊿ 명성황후',
    period: '조선',
    role: '조선 왕비',
    description: '고종의 비로 개화 정책을 추진했지만 일본 낭인들에게 시해당한 비운의 황후예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'joseon-051',
    name: '51 김만덕',
    period: '조선',
    role: '제주 의인',
    description: '제주 여성 상인으로 큰 흉년에 재산을 털어 백성들을 구한 의인이에요. 정조에게 상을 받았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌺'
  },
  {
    id: 'joseon-052',
    name: '52 고종',
    period: '조선',
    role: '대한제국 황제',
    description: '대한제국을 선포하고 근대화를 추진한 황제예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-053',
    name: '53 이지함',
    period: '조선',
    role: '조선 학자',
    description: '토정비결로 유명한 학자. 백성들의 아픔을 살피며 민생을 걱정한 인물이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔮'
  },
  {
    id: 'joseon-054',
    name: '54 허균',
    period: '조선',
    role: '조선 문인',
    description: '홍길동전을 쓴 소설가. 서자 차별과 신분 제도에 반기를 든 혁신적 문인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-055',
    name: '55 허난설헌',
    period: '조선',
    role: '조선 시인',
    description: '허균의 누나. 천재적인 시 실력으로 중국과 일본에까지 이름을 날린 여성 시인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'joseon-056',
    name: '56 황진이',
    period: '조선',
    role: '조선 기생·시인',
    description: '조선 최고의 기생. 뛰어난 시와 음악 실력으로 후대에까지 이름을 남겼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌙'
  },
  {
    id: 'joseon-057',
    name: '57 이항복',
    period: '조선',
    role: '조선 문신',
    description: '오성과 한음으로 유명한 이항복. 임진왜란 때 나라를 위해 활약한 재상이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎭'
  },
  {
    id: 'joseon-058',
    name: '58 이덕형',
    period: '조선',
    role: '조선 문신',
    description: '오성과 한음의 한음. 이항복의 절친으로 임진왜란 때 명나라 원군 요청에 활약했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎭'
  },
  {
    id: 'joseon-059',
    name: '59 정철',
    period: '조선',
    role: '조선 문인',
    description: '관동별곡·사미인곡 등을 쓴 시조 문학의 대가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎵'
  },
  {
    id: 'joseon-060',
    name: '60 윤선도',
    period: '조선',
    role: '조선 시인',
    description: '어부사시사·오우가 등을 쓴 조선 시조의 대가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎵'
  },
  {
    id: 'joseon-061',
    name: '61 김덕령',
    period: '조선',
    role: '조선 의병장',
    description: '임진왜란 때 의병을 이끈 장군이지만 억울하게 역모죄로 죽임을 당한 비운의 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-062',
    name: '62 정기룡',
    period: '조선',
    role: '조선 장군',
    description: '임진왜란 때 경상도 지역에서 왜군을 물리친 명장이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-063',
    name: '63 고경명',
    period: '조선',
    role: '조선 의병장',
    description: '임진왜란 때 호남 의병을 이끌고 금산에서 싸우다 순절한 의병장이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'joseon-064',
    name: '64 이덕무',
    period: '조선',
    role: '조선 실학자',
    description: '서자 출신이지만 방대한 독서로 박학다식한 실학자가 되어 규장각에서 활약했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-065',
    name: '65 유득공',
    period: '조선',
    role: '조선 실학자',
    description: '발해고를 써서 발해를 우리 역사로 편입시킨 실학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-066',
    name: '66 이익',
    period: '조선',
    role: '조선 실학자',
    description: '성호사설을 쓴 실학의 선구자. 정약용 등 많은 실학자를 길러냈어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-067',
    name: '67 유형원',
    period: '조선',
    role: '조선 실학자',
    description: '반계수록을 쓴 조선 초기 실학의 시조. 토지 제도 개혁을 주장했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-068',
    name: '68 이수광',
    period: '조선',
    role: '조선 학자',
    description: '지봉유설을 쓴 학자. 서양 문물을 소개하며 조선에 새로운 학문의 길을 열었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌍'
  },
  {
    id: 'joseon-069',
    name: '69 최한기',
    period: '조선',
    role: '조선 실학자',
    description: '기학을 연구하고 서양 과학을 체계적으로 정리한 조선 말기의 대학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔭'
  },
  {
    id: 'joseon-070',
    name: '70 안정복',
    period: '조선',
    role: '조선 역사가',
    description: '동사강목을 써서 우리 역사를 체계적으로 정리한 역사가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-071',
    name: '71 이중환',
    period: '조선',
    role: '조선 지리학자',
    description: '택리지를 써서 우리나라 각 지역의 지리와 풍속을 소개한 지리학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🗺️'
  },
  {
    id: 'joseon-072',
    name: '72 김정호',
    period: '조선',
    role: '조선 지리학자',
    description: '대동여지도를 만든 지리학자. 우리나라 최고의 지도를 제작했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🗺️'
  },
  {
    id: 'joseon-073',
    name: '73 최제우',
    period: '조선',
    role: '동학 창시자',
    description: '동학을 창시한 인물. 사람이 곧 하늘이라는 인내천 사상을 가르쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌟'
  },
  {
    id: 'joseon-074',
    name: '74 최시형',
    period: '조선',
    role: '동학 2대 교주',
    description: '동학의 2대 교주. 동학 농민 운동의 정신적 지주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'joseon-075',
    name: '75 박규수',
    period: '조선',
    role: '조선 개화 선구자',
    description: '박지원의 손자로 개화사상의 선구자. 김옥균·박영효 등 개화파 인재를 길러냈어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌐'
  },
  {
    id: 'joseon-076',
    name: '76 오경석',
    period: '조선',
    role: '조선 역관·개화사상가',
    description: '청나라를 드나들며 새로운 문물을 들여온 역관. 개화사상의 씨앗을 뿌렸어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌐'
  },
  {
    id: 'joseon-077',
    name: '77 강화도 봉기 농민',
    period: '조선',
    role: '민중',
    description: '19세기 삼정의 문란으로 고통받은 백성들이 전국 각지에서 봉기를 일으켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'joseon-078',
    name: '78 유인석',
    period: '조선',
    role: '의병장',
    description: '을미사변과 단발령에 반발해 의병을 일으킨 의병장이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-079',
    name: '79 최익현',
    period: '조선',
    role: '조선 선비·의병장',
    description: '일제에 맞서 끝까지 저항한 의병장. 단식 끝에 순절했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'joseon-080',
    name: '80 민영환',
    period: '조선',
    role: '조선 문신',
    description: '을사늑약에 분개해 자결로 항거한 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🕊️'
  },
  {
    id: 'joseon-081',
    name: '81 이준',
    period: '조선',
    role: '독립운동가',
    description: '헤이그 특사로 활동하다 순국한 애국지사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🕊️'
  },
  {
    id: 'joseon-082',
    name: '82 이상설',
    period: '조선',
    role: '독립운동가',
    description: '헤이그 특사로 활동하며 일제의 부당함을 세계에 알린 외교관이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌍'
  },
  {
    id: 'joseon-083',
    name: '83 심훈',
    period: '조선',
    role: '소설가·영화감독',
    description: '상록수를 쓴 소설가이자 영화감독. 농촌 계몽운동과 독립운동에도 앞장섰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌲'
  },
  {
    id: 'joseon-084',
    name: '84 정약전',
    period: '조선',
    role: '조선 학자',
    description: '정약용의 형. 흑산도 유배 중 자산어보를 써서 우리나라 어류를 체계적으로 기록했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🐟'
  },
  {
    id: 'joseon-085',
    name: '85 이가환',
    period: '조선',
    role: '조선 학자',
    description: '조선 후기 천주교 박해 때 순교한 학자. 정약용의 스승이기도 해요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✝️'
  },
  {
    id: 'joseon-086',
    name: '86 김대건',
    period: '조선',
    role: '조선 천주교 성직자',
    description: '우리나라 최초의 천주교 신부. 순교한 한국 천주교의 상징이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✝️'
  },
  {
    id: 'joseon-087',
    name: '87 어우동',
    period: '조선',
    role: '조선 여인',
    description: '신분 제도에 맞서 자유롭게 살다가 처형된 조선의 비운의 여인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'joseon-088',
    name: '88 임윤지당',
    period: '조선',
    role: '조선 여성 학자',
    description: '조선 최고의 여성 철학자. 성리학을 깊이 연구하고 윤지당유고를 남겼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-089',
    name: '89 강정일당',
    period: '조선',
    role: '조선 여성 학자',
    description: '가난 속에서도 학문에 정진해 훌륭한 저술을 남긴 여성 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-090',
    name: '90 이언적',
    period: '조선',
    role: '조선 성리학자',
    description: '성리학의 이론을 발전시킨 학자. 이황에게 큰 영향을 주었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-091',
    name: '91 조식',
    period: '조선',
    role: '조선 성리학자',
    description: '남명 선생으로 불리는 실천적 성리학자. 경남 지역에서 많은 제자를 길러냈어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-092',
    name: '92 서경덕',
    period: '조선',
    role: '조선 성리학자',
    description: '화담 선생으로 불리는 독창적 철학자. 황진이와의 일화로도 유명해요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌿'
  },
  {
    id: 'joseon-093',
    name: '93 이황의 제자들',
    period: '조선',
    role: '조선 학자 그룹',
    description: '유성룡·김성일·정구 등 이황의 제자들이 영남 학파를 이루어 학문을 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-094',
    name: '94 박세당',
    period: '조선',
    role: '조선 학자',
    description: '사변록을 써서 주자학에 의문을 제기한 독립적 사상가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-095',
    name: '95 이수일',
    period: '조선',
    role: '조선 장군',
    description: '임진왜란 때 선산·개령 전투에서 활약한 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-096',
    name: '96 홍경래',
    period: '조선',
    role: '조선 민중 봉기 지도자',
    description: '평안도 차별에 항거해 홍경래의 난을 일으킨 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'joseon-097',
    name: '97 전봉준',
    period: '조선',
    role: '동학농민운동 지도자',
    description: '녹두장군으로 불리며 동학농민운동을 이끈 민중 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'joseon-098',
    name: '98 신재효',
    period: '조선',
    role: '조선 판소리 이론가',
    description: '판소리 여섯 마당을 정리하고 진채선 등 명창을 길러낸 판소리 이론가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎶'
  },
  {
    id: 'joseon-099',
    name: '99 김홍도',
    period: '조선',
    role: '조선 화가',
    description: '단원 선생으로 불리는 풍속화의 대가. 씨름·서당 등 백성의 일상을 생생히 그렸어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎨'
  },
  {
    id: 'joseon-100',
    name: '100 신윤복',
    period: '조선',
    role: '조선 화가',
    description: '혜원 선생으로 불리는 풍속화가. 미인도 등 섬세한 필치로 조선의 풍속을 담았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎨'
  },

  // ========================================
  // 근현대 (40명)
  // ========================================
  {
    id: 'modern-001',
    name: '① 김옥균',
    period: '근현대',
    role: '개화 운동가',
    description: '서양의 근대 문물을 받아들여 조선을 개혁하려 한 개화파 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌐'
  },
  {
    id: 'modern-002',
    name: '② 박영효',
    period: '근현대',
    role: '개화 운동가',
    description: '태극기를 처음 만든 인물. 조선의 근대화를 위해 노력한 개화파예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🇰🇷'
  },
  {
    id: 'modern-003',
    name: '③ 서재필',
    period: '근현대',
    role: '개화 운동가',
    description: '독립신문을 창간하고 독립협회를 만든 개화파 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📰'
  },
  {
    id: 'modern-004',
    name: '④ 안창호',
    period: '근현대',
    role: '독립운동가',
    description: '도산 선생으로 불리는 교육자이자 독립운동가. 흥사단을 창립했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'modern-005',
    name: '⑤ 김구',
    period: '근현대',
    role: '독립운동가',
    description: '대한민국 임시정부 주석. 평생을 독립운동에 바친 백범 선생이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🇰🇷'
  },
  {
    id: 'modern-006',
    name: '⑥ 안중근',
    period: '근현대',
    role: '독립운동가',
    description: '하얼빈에서 이토 히로부미를 저격한 의거의 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-007',
    name: '⑦ 윤봉길',
    period: '근현대',
    role: '독립운동가',
    description: '상하이 훙커우 공원에서 일본 요인을 폭탄으로 공격한 의사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💣'
  },
  {
    id: 'modern-008',
    name: '⑧ 이봉창',
    period: '근현대',
    role: '독립운동가',
    description: '일왕 히로히토를 저격하려다 실패했지만 민족의 기개를 보여준 의사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎯'
  },
  {
    id: 'modern-009',
    name: '⑨ 유관순',
    period: '근현대',
    role: '독립운동가',
    description: '3·1운동을 주도한 열여섯 살 소녀. 고문으로 순국한 민족의 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'modern-010',
    name: '⑩ 김좌진',
    period: '근현대',
    role: '독립군 장군',
    description: '청산리 대첩에서 일본군을 크게 물리친 독립군 사령관이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-011',
    name: '⑪ 홍범도',
    period: '근현대',
    role: '독립군 장군',
    description: '봉오동 전투와 청산리 대첩을 이끈 독립군 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-012',
    name: '⑫ 신채호',
    period: '근현대',
    role: '역사가·독립운동가',
    description: '단재 선생으로 불리는 민족주의 역사가. 조선상고사를 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'modern-013',
    name: '⑬ 박은식',
    period: '근현대',
    role: '역사가·독립운동가',
    description: '민족 역사서 한국통사를 쓴 역사가. 나라의 정신은 빼앗길 수 없다고 외쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'modern-014',
    name: '⑭ 한용운',
    period: '근현대',
    role: '승려·시인',
    description: '만해 선생으로 불리는 독립운동가이자 시인. 님의 침묵을 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📝'
  },
  {
    id: 'modern-015',
    name: '⑮ 손병희',
    period: '근현대',
    role: '동학 지도자',
    description: '동학의 3대 교주. 3·1운동을 주도한 민족대표 33인 중 한 명이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-016',
    name: '⑯ 이회영',
    period: '근현대',
    role: '독립운동가',
    description: '전 재산을 독립운동에 바친 독립운동가. 신흥무관학교를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏫'
  },
  {
    id: 'modern-017',
    name: '⑰ 김마리아',
    period: '근현대',
    role: '독립운동가',
    description: '3·1운동을 주도하고 대한민국 애국부인회를 만든 여성 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'modern-018',
    name: '⑱ 권기옥',
    period: '근현대',
    role: '독립운동가·최초 여성 비행사',
    description: '우리나라 최초의 여성 비행사. 하늘을 날며 독립운동에 헌신한 용감한 여성이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✈️'
  },
  {
    id: 'modern-019',
    name: '⑲ 나혜석',
    period: '근현대',
    role: '예술가·독립운동가',
    description: '최초의 여성 서양화가이자 여성 해방을 주장한 선구자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎨'
  },
  {
    id: 'modern-020',
    name: '⑳ 윤동주',
    period: '근현대',
    role: '시인',
    description: '서시·별 헤는 밤을 쓴 시인. 일제 감옥에서 순국한 민족 시인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⭐'
  },
  {
    id: 'modern-021',
    name: '㉑ 이육사',
    period: '근현대',
    role: '시인·독립운동가',
    description: '청포도를 쓴 저항 시인. 독립운동을 하다 옥중에서 순국했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🍇'
  },
  {
    id: 'modern-022',
    name: '㉒ 주시경',
    period: '근현대',
    role: '한글학자',
    description: '한글 연구와 보급에 평생을 바친 국어학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✍️'
  },
  {
    id: 'modern-023',
    name: '㉓ 최현배',
    period: '근현대',
    role: '한글학자',
    description: '우리말을 연구하고 보급한 한글학자. 우리말본을 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'modern-024',
    name: '㉔ 방정환',
    period: '근현대',
    role: '아동문학가',
    description: '소파 선생으로 불리며 어린이날을 만든 아동 운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👶'
  },
  {
    id: 'modern-025',
    name: '㉕ 지청천',
    period: '근현대',
    role: '독립군 장군',
    description: '한국광복군 총사령관. 일본 육사 출신으로 독립군에 투신했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-026',
    name: '㉖ 김원봉',
    period: '근현대',
    role: '독립운동가',
    description: '의열단을 조직하고 무장 투쟁을 이끈 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💣'
  },
  {
    id: 'modern-027',
    name: '㉗ 박재혁',
    period: '근현대',
    role: '독립운동가',
    description: '의열단원으로 부산경찰서에 폭탄을 던진 의사. 스물셋의 나이에 순국했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💥'
  },
  {
    id: 'modern-028',
    name: '㉘ 박열',
    period: '근현대',
    role: '독립운동가',
    description: '일제에 맞서 의열 투쟁을 펼친 독립운동가. 22년간 옥살이를 하면서도 굴하지 않았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-029',
    name: '㉙ 오세창',
    period: '근현대',
    role: '서예가·독립운동가',
    description: '3·1운동 민족대표 33인 중 한 명. 뛰어난 서예가이자 언론인으로 독립운동을 이끌었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🖌️'
  },
  {
    id: 'modern-030',
    name: '㉚ 조만식',
    period: '근현대',
    role: '독립운동가',
    description: '고당 선생으로 불리는 평안도의 민족 지도자. 물산장려운동을 이끌었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏭'
  },
  {
    id: 'modern-031',
    name: '㉛ 이상재',
    period: '근현대',
    role: '독립운동가',
    description: 'YMCA를 통해 민족운동을 전개한 기독교 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✝️'
  },
  {
    id: 'modern-032',
    name: '㉜ 이중섭',
    period: '근현대',
    role: '화가',
    description: '황소와 아이들을 즐겨 그린 화가. 가난 속에서도 순수한 열정으로 그림을 그렸어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🐂'
  },
  {
    id: 'modern-033',
    name: '㉝ 윤희순',
    period: '근현대',
    role: '여성 의병장',
    description: '여성 의병장으로 의병 활동을 펼친 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-034',
    name: '㉞ 남자현',
    period: '근현대',
    role: '독립운동가',
    description: '만주에서 무장 독립운동을 펼친 여성 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-035',
    name: '㉟ 김란사',
    period: '근현대',
    role: '독립운동가·최초 여성 학사',
    description: '우리나라 최초의 여성 문학사. 이화학당에서 가르치며 여성 교육과 독립운동에 앞장섰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎓'
  },
  {
    id: 'modern-036',
    name: '㊱ 장기려',
    period: '근현대',
    role: '의사·사회사업가',
    description: '가난한 환자를 무료로 치료한 바보 의사. 청십자 의료보험조합을 만들어 의료복지의 씨앗을 뿌렸어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏥'
  },
  {
    id: 'modern-037',
    name: '㊲ 백남준',
    period: '근현대',
    role: '예술가',
    description: '비디오 아트를 세계 최초로 개척한 예술가. 전자 기술을 예술로 바꾼 천재예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📺'
  },
  {
    id: 'modern-038',
    name: '㊳ 김규식',
    period: '근현대',
    role: '독립운동가·외교관',
    description: '파리강화회의에 참석해 한국의 독립을 세계에 호소한 임시정부의 외교 대표예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌍'
  },
  {
    id: 'modern-039',
    name: '㊴ 이시영',
    period: '근현대',
    role: '독립운동가',
    description: '이회영의 동생. 전 재산을 버리고 만주로 건너가 신흥무관학교 설립을 도운 애국지사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🇰🇷'
  },
  {
    id: 'modern-040',
    name: '㊵ 전명운',
    period: '근현대',
    role: '독립운동가',
    description: '장인환과 함께 일제의 조선 침략을 홍보하던 외교관 스티븐스를 저격해 독립 의지를 알린 의사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
];

// 시대별 인물 필터링 함수
export function getCharactersByPeriod(period: string): Character[] {
  const periodMap: Record<string, string> = {
    'three-kingdoms': '삼국시대',
    'goryeo': '고려',
    'joseon': '조선',
    'modern': '근현대'
  };

  const periodName = periodMap[period];
  return allCharacters.filter(char => char.period === periodName);
}

// 특정 ID로 인물 찾기
export function getCharacterById(id: string): Character | undefined {
  return allCharacters.find(char => char.id === id);
}

// 해금된 인물만 가져오기
export function getUnlockedCharacters(): Character[] {
  return allCharacters.filter(char => char.unlocked);
}

// 해금되지 않은 인물만 가져오기
export function getLockedCharacters(): Character[] {
  return allCharacters.filter(char => !char.unlocked);
}

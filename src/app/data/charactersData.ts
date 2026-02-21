import type { Character } from './quizData';

// 총 210명의 역사 인물 데이터
// 고조선 10명, 삼국시대 50명, 고려 50명, 조선 50명, 근현대 50명

export const allCharacters: Character[] = [
  // ========================================
  // 고조선 (10명)
  // ========================================
  {
    id: 'gojoseon-001',
    name: '단군왕검',
    period: '고조선',
    role: '고조선 건국 시조',
    description: '우리나라 최초의 국가 고조선을 세운 시조. 하늘의 손자이자 곰에서 사람이 된 웅녀의 아들로, 홍익인간의 이념을 펼쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'gojoseon-002',
    name: '환웅',
    period: '고조선',
    role: '천신의 아들',
    description: '하늘의 환인의 아들로, 3천 명의 무리를 이끌고 태백산에 내려와 신시를 열었어요. 풍백, 우사, 운사를 거느렸어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '☁️'
  },
  {
    id: 'gojoseon-003',
    name: '웅녀',
    period: '고조선',
    role: '단군왕검의 어머니',
    description: '곰에서 사람이 된 여인. 쑥과 마늘을 먹으며 100일 동안 동굴에서 지내 사람이 되었고, 환웅과 결혼하여 단군왕검을 낳았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🐻'
  },
  {
    id: 'gojoseon-004',
    name: '위만',
    period: '고조선',
    role: '위만조선 건립자',
    description: '중국에서 망명해 온 사람으로, 고조선의 준왕을 몰아내고 왕이 되었어요. 철기 문화를 발전시키고 중계 무역으로 부를 쌓았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'gojoseon-005',
    name: '준왕',
    period: '고조선',
    role: '고조선 마지막 왕',
    description: '위만에게 왕위를 빼앗긴 고조선의 마지막 왕. 남쪽으로 내려가 한왕이 되었다고 전해져요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'gojoseon-006',
    name: '우거왕',
    period: '고조선',
    role: '위만조선의 왕',
    description: '위만의 손자로, 한나라의 침입에 맞서 싸웠어요. 고조선의 마지막 왕으로, 나라가 멸망할 때까지 저항했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },
  {
    id: 'gojoseon-007',
    name: '비파형동검 장인',
    period: '고조선',
    role: '청동기 제작자',
    description: '고조선의 독특한 비파형동검을 만든 뛰어난 장인들. 이 검은 고조선 문화의 상징이 되었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🗡️'
  },
  {
    id: 'gojoseon-008',
    name: '8조법 제정자',
    period: '고조선',
    role: '법률가',
    description: '고조선의 8조법을 만든 사람들. 사람을 죽이면 사형, 다치게 하면 곡식으로 배상, 도둑질하면 노비가 되는 등의 법을 정했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚖️'
  },
  {
    id: 'gojoseon-009',
    name: '제천의식 제사장',
    period: '고조선',
    role: '종교 지도자',
    description: '10월에 하늘에 제사를 지내는 제천행사를 주관한 제사장들. 백성들과 함께 풍년을 기원하고 감사했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'gojoseon-010',
    name: '고조선 무역상',
    period: '고조선',
    role: '상인',
    description: '중국과 활발히 무역을 한 고조선의 상인들. 철, 소금, 물고기 등을 팔고 중국의 문물을 들여왔어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💰'
  },

  // ========================================
  // 삼국시대 (50명)
  // ========================================
  {
    id: 'three-kingdoms-001',
    name: '광개토대왕',
    period: '삼국시대',
    role: '고구려 19대 왕',
    description: '고구려를 동아시아 최강국으로 만든 정복 군주. 영토를 크게 넓혀 만주와 한반도 대부분을 차지했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-002',
    name: '을지문덕',
    period: '삼국시대',
    role: '고구려 장군',
    description: '살수대첩에서 수나라 군대를 물리친 지략가. 30만 대군을 물리친 전술의 귀재예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-003',
    name: '연개소문',
    period: '삼국시대',
    role: '고구려 대막리지',
    description: '강력한 군사력으로 당나라를 여러 번 물리친 고구려의 실권자. 고구려를 지킨 강력한 무장이었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🗡️'
  },
  {
    id: 'three-kingdoms-004',
    name: '온조왕',
    period: '삼국시대',
    role: '백제 건국 시조',
    description: '백제를 건국한 왕. 한강 유역을 중심으로 나라를 세우고 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏛️'
  },
  {
    id: 'three-kingdoms-005',
    name: '근초고왕',
    period: '삼국시대',
    role: '백제 13대 왕',
    description: '백제의 전성기를 이끈 왕. 영토를 크게 넓히고 일본에까지 문화를 전파했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-006',
    name: '성왕',
    period: '삼국시대',
    role: '백제 26대 왕',
    description: '백제 중흥의 군주. 사비로 천도하고 국호를 남부여로 바꾸며 백제 부흥을 꿈꿨어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌟'
  },
  {
    id: 'three-kingdoms-007',
    name: '혁거세',
    period: '삼국시대',
    role: '신라 건국 시조',
    description: '신라를 건국한 왕. 알에서 태어났다는 전설을 가진 신라의 첫 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🥚'
  },
  {
    id: 'three-kingdoms-008',
    name: '선덕여왕',
    period: '삼국시대',
    role: '신라 27대 왕',
    description: '신라 최초의 여왕. 첨성대를 건설하고 학문과 예술을 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'three-kingdoms-009',
    name: '진덕여왕',
    period: '삼국시대',
    role: '신라 28대 왕',
    description: '신라의 두 번째 여왕. 당나라와 동맹을 맺어 삼국통일의 기반을 마련했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'three-kingdoms-010',
    name: '김유신',
    period: '삼국시대',
    role: '신라 장군',
    description: '삼국통일의 주역. 화랑 출신으로 수많은 전투에서 승리를 거두었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-011',
    name: '김춘추',
    period: '삼국시대',
    role: '신라 29대 왕 (태종무열왕)',
    description: '신라의 삼국통일을 이끈 왕. 외교와 전략으로 당나라와 동맹을 맺었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-012',
    name: '문무왕',
    period: '삼국시대',
    role: '신라 30대 왕',
    description: '삼국통일을 완성한 왕. 죽어서도 나라를 지키겠다며 동해의 용이 되었다는 전설이 있어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🐉'
  },
  {
    id: 'three-kingdoms-013',
    name: '원효대사',
    period: '삼국시대',
    role: '신라 승려',
    description: '불교를 대중화한 고승. "나무아미타불"을 퍼뜨려 모든 사람이 부처가 될 수 있다고 가르쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'three-kingdoms-014',
    name: '의상대사',
    period: '삼국시대',
    role: '신라 승려',
    description: '화엄종을 창시한 고승. 부석사를 세우고 불교 철학을 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📿'
  },
  {
    id: 'three-kingdoms-015',
    name: '주몽',
    period: '삼국시대',
    role: '고구려 건국 시조',
    description: '고구려를 건국한 영웅. 알에서 태어나 활을 잘 쏘았다는 전설이 있어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏹'
  },
  {
    id: 'three-kingdoms-016',
    name: '대조영',
    period: '삼국시대',
    role: '발해 건국 시조',
    description: '고구려 유민을 이끌고 발해를 건국한 영웅. 동모산 아래에서 나라를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏔️'
  },
  {
    id: 'three-kingdoms-017',
    name: '무왕',
    period: '삼국시대',
    role: '백제 30대 왕',
    description: '미륵사를 세운 왕. 서동요의 주인공으로, 선화공주와의 사랑 이야기가 유명해요.',
    unlocked: false,
    imageUrl: '',
    emoji: '❤️'
  },
  {
    id: 'three-kingdoms-018',
    name: '의자왕',
    period: '삼국시대',
    role: '백제 31대 왕',
    description: '백제의 마지막 왕. 초기에는 효자로 알려졌지만, 나라가 멸망하며 비극적인 최후를 맞았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'three-kingdoms-019',
    name: '계백',
    period: '삼국시대',
    role: '백제 장군',
    description: '황산벌 전투에서 5천 군사로 5만 신라군과 싸운 충신. 가족을 죽이고 전장에 나간 비장한 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-020',
    name: '관창',
    period: '삼국시대',
    role: '신라 화랑',
    description: '16세의 나이로 황산벌 전투에서 세 번이나 적진에 뛰어든 용감한 화랑이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🦁'
  },
  {
    id: 'three-kingdoms-021',
    name: '강수',
    period: '삼국시대',
    role: '백제 학자',
    description: '백제에서 일본으로 건너가 학문을 가르친 학자. 일본 문화 발전에 큰 영향을 주었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'three-kingdoms-022',
    name: '아지기',
    period: '삼국시대',
    role: '백제 박사',
    description: '일본에 한자를 전파한 백제 학자. "천자문"을 가르쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✍️'
  },
  {
    id: 'three-kingdoms-023',
    name: '왕인',
    period: '삼국시대',
    role: '백제 학자',
    description: '일본에 "논어"와 "천자문"을 전한 학자. 일본 문화의 스승으로 존경받았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'three-kingdoms-024',
    name: '자장율사',
    period: '삼국시대',
    role: '신라 승려',
    description: '당나라에서 유학하고 돌아와 황룡사 9층탑 건립을 제안한 고승이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏯'
  },
  {
    id: 'three-kingdoms-025',
    name: '귀산',
    period: '삼국시대',
    role: '신라 화랑',
    description: '추항과 함께 목숨을 바쳐 나라를 지킨 충의의 화랑이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },
  {
    id: 'three-kingdoms-026',
    name: '추항',
    period: '삼국시대',
    role: '신라 화랑',
    description: '귀산과 함께 죽주에서 백제군과 싸워 나라를 지킨 화랑이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },
  {
    id: 'three-kingdoms-027',
    name: '사다함',
    period: '삼국시대',
    role: '신라 화랑',
    description: '아들을 앞세워 전투에 나가게 한 엄격한 화랑. 아들이 전사하자 스스로도 싸웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-028',
    name: '김흠돌',
    period: '삼국시대',
    role: '신라 귀족',
    description: '신라 귀족 반란의 주모자. 왕권 강화에 반대하다 실패했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚠️'
  },
  {
    id: 'three-kingdoms-029',
    name: '장보고',
    period: '삼국시대',
    role: '신라 무장',
    description: '청해진을 설치하고 해상무역을 장악한 해상왕. 동아시아 무역의 중심이었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚓'
  },
  {
    id: 'three-kingdoms-030',
    name: '최치원',
    period: '삼국시대',
    role: '신라 문장가',
    description: '12세에 당나라에 유학가 과거에 급제한 천재. 아름다운 문장으로 유명했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✒️'
  },
  {
    id: 'three-kingdoms-031',
    name: '설총',
    period: '삼국시대',
    role: '신라 학자',
    description: '원효의 아들로, 이두를 정리해 한문 학습을 쉽게 만든 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📝'
  },
  {
    id: 'three-kingdoms-032',
    name: '강감찬',
    period: '삼국시대',
    role: '신라 승려',
    description: '지혜로운 승려로 불교를 전파하고 많은 제자를 길렀어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'three-kingdoms-033',
    name: '김대성',
    period: '삼국시대',
    role: '신라 인물',
    description: '석굴암과 불국사를 세운 인물. 부모의 은혜에 보답하기 위해 절을 지었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏯'
  },
  {
    id: 'three-kingdoms-034',
    name: '실성왕',
    period: '삼국시대',
    role: '신라 18대 왕',
    description: '고구려에 인질로 갔다 돌아와 왕이 된 비운의 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-035',
    name: '눌지왕',
    period: '삼국시대',
    role: '신라 19대 왕',
    description: '고구려, 백제와의 외교로 신라를 안정시킨 지혜로운 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-036',
    name: '지증왕',
    period: '삼국시대',
    role: '신라 22대 왕',
    description: '국호를 신라로 정하고, 왕의 칭호를 마립간에서 왕으로 바꾼 개혁 군주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-037',
    name: '법흥왕',
    period: '삼국시대',
    role: '신라 23대 왕',
    description: '불교를 공인하고 율령을 반포한 개혁 군주. 이차돈의 순교로 불교가 공인되었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-038',
    name: '이차돈',
    period: '삼국시대',
    role: '신라 귀족',
    description: '불교 공인을 위해 목숨을 바친 순교자. 죽을 때 흰 피가 흘렀다는 전설이 있어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🩸'
  },
  {
    id: 'three-kingdoms-039',
    name: '진흥왕',
    period: '삼국시대',
    role: '신라 24대 왕',
    description: '신라의 영토를 크게 넓힌 정복 군주. 화랑도를 개편하고 진흥왕 순수비를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-040',
    name: '진평왕',
    period: '삼국시대',
    role: '신라 26대 왕',
    description: '선덕여왕의 아버지. 오랜 재위 기간 동안 신라를 안정시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-041',
    name: '미실',
    period: '삼국시대',
    role: '신라 귀족',
    description: '진흥왕, 진지왕, 진평왕 시대를 거친 영향력 있는 여성 귀족이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💎'
  },
  {
    id: 'three-kingdoms-042',
    name: '도미부인',
    period: '삼국시대',
    role: '백제 열녀',
    description: '개로왕의 협박을 받았지만 정절을 지킨 백제의 열녀예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌺'
  },
  {
    id: 'three-kingdoms-043',
    name: '해론',
    period: '삼국시대',
    role: '백제 장군',
    description: '백제의 용맹한 장군으로 여러 전투에서 활약했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-044',
    name: '흑치상지',
    period: '삼국시대',
    role: '백제 장군',
    description: '백제 멸망 후에도 끝까지 저항한 장군. 나중에 당나라에서도 활약했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'three-kingdoms-045',
    name: '복신',
    period: '삼국시대',
    role: '백제 부흥 운동가',
    description: '백제 멸망 후 부흥 운동을 이끈 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'three-kingdoms-046',
    name: '도침',
    period: '삼국시대',
    role: '백제 부흥 운동가',
    description: '복신과 함께 백제 부흥 운동을 이끈 승려 출신 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'three-kingdoms-047',
    name: '견훤',
    period: '삼국시대',
    role: '후백제 건국자',
    description: '신라 말기 후백제를 세워 백제의 부활을 꿈꾼 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'three-kingdoms-048',
    name: '궁예',
    period: '삼국시대',
    role: '후고구려 건국자',
    description: '후고구려(태봉)를 세웠지만 포악한 정치로 왕건에게 쫓겨났어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚠️'
  },
  {
    id: 'three-kingdoms-049',
    name: '경순왕',
    period: '삼국시대',
    role: '신라 56대 왕',
    description: '신라의 마지막 왕. 천년 왕국 신라를 고려에 평화롭게 넘겨준 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'three-kingdoms-050',
    name: '신충',
    period: '삼국시대',
    role: '신라 화랑',
    description: '김유신의 아버지 김서현을 도운 충성스러운 화랑이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },

  // ========================================
  // 고려시대 (50명)
  // ========================================
  {
    id: 'goryeo-001',
    name: '왕건',
    period: '고려',
    role: '고려 태조',
    description: '고려를 건국하고 후삼국을 통일한 왕. 호족들을 포용하는 정책으로 나라를 안정시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-002',
    name: '광종',
    period: '고려',
    role: '고려 4대 왕',
    description: '노비안검법과 과거제를 실시해 왕권을 강화한 개혁 군주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-003',
    name: '성종',
    period: '고려',
    role: '고려 6대 왕',
    description: '최승로의 시무 28조를 받아들여 유교 정치를 확립한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-004',
    name: '현종',
    period: '고려',
    role: '고려 8대 왕',
    description: '거란의 침입을 물리치고 팔만대장경 조판을 시작한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-005',
    name: '서희',
    period: '고려',
    role: '고려 문신',
    description: '거란의 소손녕과 담판을 벌여 강동 6주를 확보한 외교의 달인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🗣️'
  },
  {
    id: 'goryeo-006',
    name: '강감찬',
    period: '고려',
    role: '고려 문신, 장군',
    description: '귀주대첩에서 거란군을 대승으로 물리친 지혜로운 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-007',
    name: '윤관',
    period: '고려',
    role: '고려 장군',
    description: '별무반을 조직해 여진을 물리치고 9성을 쌓은 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏰'
  },
  {
    id: 'goryeo-008',
    name: '묘청',
    period: '고려',
    role: '고려 승려',
    description: '서경 천도를 주장하며 반란을 일으킨 승려. 자주 의식이 강했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'goryeo-009',
    name: '김부식',
    period: '고려',
    role: '고려 문신',
    description: '삼국사기를 편찬한 역사가. 묘청의 난을 진압했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-010',
    name: '정중부',
    period: '고려',
    role: '고려 무신',
    description: '무신정변을 일으켜 문신 귀족 정치를 무너뜨린 무신의 대표예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-011',
    name: '이의방',
    period: '고려',
    role: '고려 무신',
    description: '정중부와 함께 무신정변을 일으킨 무신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-012',
    name: '경대승',
    period: '고려',
    role: '고려 무신',
    description: '도방을 설치해 무신 정권을 안정시킨 무신 정권의 실력자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },
  {
    id: 'goryeo-013',
    name: '최충헌',
    period: '고려',
    role: '고려 무신',
    description: '최씨 무신 정권을 시작한 인물. 교정도감을 설치해 권력을 장악했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-014',
    name: '최우',
    period: '고려',
    role: '고려 무신',
    description: '최충헌의 아들로, 정방을 설치하고 무신 정권을 강화했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-015',
    name: '최이',
    period: '고려',
    role: '고려 무신',
    description: '최우의 아들로, 몽골의 침입에 맞서 항쟁을 이끌었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-016',
    name: '김윤후',
    period: '고려',
    role: '고려 승려, 장군',
    description: '처인성 전투에서 몽골 장군 살리타이를 죽인 승려 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏹'
  },
  {
    id: 'goryeo-017',
    name: '삼별초',
    period: '고려',
    role: '고려 군사 조직',
    description: '몽골에 끝까지 저항한 특수 부대. 진도와 제주도에서 항전했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-018',
    name: '배중손',
    period: '고려',
    role: '삼별초 장군',
    description: '삼별초를 이끌고 진도에서 몽골에 저항한 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'goryeo-019',
    name: '충렬왕',
    period: '고려',
    role: '고려 25대 왕',
    description: '원나라의 부마국이 된 후 첫 왕. 쿠빌라이의 사위가 되었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-020',
    name: '공민왕',
    period: '고려',
    role: '고려 31대 왕',
    description: '원나라의 간섭을 벗어나고자 개혁을 추진한 왕. 노국대장공주와의 사랑으로 유명해요.',
    unlocked: false,
    imageUrl: '',
    emoji: '❤️'
  },
  {
    id: 'goryeo-021',
    name: '노국대장공주',
    period: '고려',
    role: '고려 왕비',
    description: '공민왕의 왕비. 16세에 공민왕과 결혼해 깊은 사랑을 나눴어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'goryeo-022',
    name: '신돈',
    period: '고려',
    role: '고려 승려',
    description: '공민왕을 도와 개혁을 추진했지만, 결국 제거된 승려 신하예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'goryeo-023',
    name: '최영',
    period: '고려',
    role: '고려 장군',
    description: '왜구를 물리친 명장. "황금 보기를 돌같이 하라"는 청렴한 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-024',
    name: '이성계',
    period: '고려',
    role: '고려 장군',
    description: '왜구를 물리치고 위화도에서 회군해 고려를 무너뜨리고 조선을 건국한 인물이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-025',
    name: '정몽주',
    period: '고려',
    role: '고려 문신',
    description: '고려에 끝까지 충성한 충신. "단심가"를 남기고 선죽교에서 죽음을 맞았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'goryeo-026',
    name: '정도전',
    period: '고려',
    role: '고려 말 문신',
    description: '조선 건국의 설계자. 성리학을 바탕으로 새 나라의 기틀을 만들었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'goryeo-027',
    name: '이색',
    period: '고려',
    role: '고려 문신',
    description: '고려 말 성리학을 발전시킨 학자. 정몽주, 정도전 등을 가르쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-028',
    name: '일연',
    period: '고려',
    role: '고려 승려',
    description: '삼국유사를 쓴 승려 역사가. 단군신화 등 우리 민족의 이야기를 기록했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'goryeo-029',
    name: '이규보',
    period: '고려',
    role: '고려 문신',
    description: '동명왕편을 쓴 문장가. 고구려의 역사를 자랑스럽게 노래했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✒️'
  },
  {
    id: 'goryeo-030',
    name: '이제현',
    period: '고려',
    role: '고려 문신',
    description: '원나라에서 활약한 학자. 성리학을 고려에 소개했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-031',
    name: '안향',
    period: '고려',
    role: '고려 문신',
    description: '주자학(성리학)을 고려에 처음 들여온 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'goryeo-032',
    name: '백이정',
    period: '고려',
    role: '고려 문신',
    description: '성리학을 연구하고 전파한 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-033',
    name: '이승휴',
    period: '고려',
    role: '고려 문신',
    description: '제왕운기를 쓴 역사가. 우리 역사를 중국과 대등하게 서술했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✍️'
  },
  {
    id: 'goryeo-034',
    name: '최충',
    period: '고려',
    role: '고려 문신',
    description: '문헌공도라는 사학을 세워 많은 인재를 길러낸 교육자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'goryeo-035',
    name: '최승로',
    period: '고려',
    role: '고려 문신',
    description: '성종에게 시무 28조를 올려 유교 정치의 기틀을 마련한 학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'goryeo-036',
    name: '대각국사 의천',
    period: '고려',
    role: '고려 승려',
    description: '천태종을 창시하고 교관겸수를 주장한 고승. 문종의 아들이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'goryeo-037',
    name: '보조국사 지눌',
    period: '고려',
    role: '고려 승려',
    description: '조계종을 창시하고 선교일치를 주장한 고승. 수선사를 중심으로 활동했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📿'
  },
  {
    id: 'goryeo-038',
    name: '일지',
    period: '고려',
    role: '고려 승려',
    description: '만행이라는 이름으로도 알려진 승려. 불교 사상을 발전시켰어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'goryeo-039',
    name: '혜심',
    period: '고려',
    role: '고려 승려',
    description: '지눌의 제자로 수선사 결사 운동을 이어간 고승이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📿'
  },
  {
    id: 'goryeo-040',
    name: '이자겸',
    period: '고려',
    role: '고려 권신',
    description: '왕실과 혼인을 맺어 권력을 장악했지만 반란으로 실패한 권신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚠️'
  },
  {
    id: 'goryeo-041',
    name: '이인임',
    period: '고려',
    role: '고려 권신',
    description: '공민왕 사후 권력을 장악했지만, 이성계에 의해 제거된 권신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚠️'
  },
  {
    id: 'goryeo-042',
    name: '이자춘',
    period: '고려',
    role: '고려 무신',
    description: '이성계의 아버지. 동북면에서 세력을 키워 조선 건국의 기반을 만들었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-043',
    name: '이방원',
    period: '고려',
    role: '고려 말 무신',
    description: '이성계의 다섯째 아들. 조선 건국에 큰 역할을 했고 후에 태종이 되었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'goryeo-044',
    name: '만적',
    period: '고려',
    role: '고려 노비',
    description: '노비 신분 해방 운동을 이끈 노비. 최초의 민중 봉기를 계획했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'goryeo-045',
    name: '망이',
    period: '고려',
    role: '고려 농민',
    description: '망소이의 난을 일으킨 농민 반란의 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'goryeo-046',
    name: '망소이',
    period: '고려',
    role: '고려 농민',
    description: '망이와 함께 반란을 일으킨 농민 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  },
  {
    id: 'goryeo-047',
    name: '김사미',
    period: '고려',
    role: '고려 농민',
    description: '무신 정권 시기 농민 반란을 일으킨 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-048',
    name: '효심',
    period: '고려',
    role: '고려 농민',
    description: '김사미와 함께 농민 반란을 일으킨 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-049',
    name: '이방실',
    period: '고려',
    role: '고려 무신',
    description: '이성계의 형으로 동북면에서 세력을 키웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'goryeo-050',
    name: '신숭겸',
    period: '고려',
    role: '고려 장군',
    description: '왕건을 지키기 위해 왕의 갑옷을 입고 대신 죽은 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🛡️'
  },

  // ========================================
  // 조선시대 (50명)
  // ========================================
  {
    id: 'joseon-001',
    name: '이성계',
    period: '조선',
    role: '조선 태조',
    description: '조선을 건국한 왕. 위화도 회군으로 고려를 무너뜨리고 새 나라를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-002',
    name: '정도전',
    period: '조선',
    role: '조선 개국공신',
    description: '조선 건국의 설계자. 한양 천도를 계획하고 경복궁을 지었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📐'
  },
  {
    id: 'joseon-003',
    name: '이방원',
    period: '조선',
    role: '조선 3대 왕 (태종)',
    description: '왕자의 난을 일으켜 왕위에 오른 강력한 군주. 왕권을 강화했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-004',
    name: '세종대왕',
    period: '조선',
    role: '조선 4대 왕',
    description: '한글을 창제하고 과학기술을 발전시킨 성군. 백성을 사랑한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-005',
    name: '장영실',
    period: '조선',
    role: '조선 과학자',
    description: '노비 출신으로 자격루, 측우기 등을 발명한 천재 과학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚙️'
  },
  {
    id: 'joseon-006',
    name: '집현전 학사',
    period: '조선',
    role: '조선 학자 집단',
    description: '세종대왕을 도와 한글을 창제하고 학문을 연구한 학자들이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-007',
    name: '문종',
    period: '조선',
    role: '조선 5대 왕',
    description: '세종의 맏아들로 학문을 사랑했지만 재위 2년 만에 세상을 떠난 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-008',
    name: '단종',
    period: '조선',
    role: '조선 6대 왕',
    description: '어린 나이에 왕위에 올랐다가 숙부 수양대군에게 왕위를 빼앗긴 비운의 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'joseon-009',
    name: '세조',
    period: '조선',
    role: '조선 7대 왕',
    description: '계유정난으로 왕위를 찬탈했지만 강력한 왕권을 확립한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-010',
    name: '성삼문',
    period: '조선',
    role: '조선 문신',
    description: '사육신의 대표로 단종 복위를 위해 목숨을 바친 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'joseon-011',
    name: '박팽년',
    period: '조선',
    role: '조선 문신',
    description: '사육신 중 한 명으로 집현전 학사 출신의 뛰어난 학자였어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-012',
    name: '생육신',
    period: '조선',
    role: '조선 충신',
    description: '단종을 그리워하며 벼슬을 버리고 은둔한 여섯 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🍃'
  },
  {
    id: 'joseon-013',
    name: '김종서',
    period: '조선',
    role: '조선 문신',
    description: '6진을 개척하고 단종을 보필했지만 계유정난 때 죽임을 당한 충신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-014',
    name: '성종',
    period: '조선',
    role: '조선 9대 왕',
    description: '경국대전을 완성해 조선의 법 체계를 확립한 문화 군주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-015',
    name: '김시습',
    period: '조선',
    role: '조선 문인',
    description: '생육신 중 한 명. 금오신화를 쓴 최초의 한글 소설가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-016',
    name: '연산군',
    period: '조선',
    role: '조선 10대 왕',
    description: '무오사화와 갑자사화를 일으킨 폭군. 결국 왕위에서 쫓겨났어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚠️'
  },
  {
    id: 'joseon-017',
    name: '중종',
    period: '조선',
    role: '조선 11대 왕',
    description: '반정으로 왕위에 올라 조광조의 개혁을 지원했지만 기묘사화로 좌절시킨 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-018',
    name: '조광조',
    period: '조선',
    role: '조선 문신',
    description: '현량과를 실시하고 개혁 정치를 펼쳤지만 기묘사화로 죽임을 당한 개혁가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-019',
    name: '이황',
    period: '조선',
    role: '조선 학자',
    description: '퇴계 선생으로 불리는 성리학의 대가. 도산서원에서 제자를 길렀어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-020',
    name: '이이',
    period: '조선',
    role: '조선 학자',
    description: '율곡 선생으로 불리는 개혁 사상가. 십만양병설을 주장했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-021',
    name: '신사임당',
    period: '조선',
    role: '조선 예술가',
    description: '이율곡의 어머니. 뛰어난 화가이자 서예가로 오만원권 지폐 모델이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎨'
  },
  {
    id: 'joseon-022',
    name: '선조',
    period: '조선',
    role: '조선 14대 왕',
    description: '임진왜란을 겪은 왕. 의주까지 피난을 갔던 비운의 군주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-023',
    name: '이순신',
    period: '조선',
    role: '조선 장군',
    description: '임진왜란의 영웅. 23전 23승의 불패 장군으로 거북선을 만들었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🐢'
  },
  {
    id: 'joseon-024',
    name: '류성룡',
    period: '조선',
    role: '조선 문신',
    description: '이순신을 천거하고 징비록을 쓴 명재상이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'joseon-025',
    name: '권율',
    period: '조선',
    role: '조선 장군',
    description: '행주대첩에서 승리한 명장. 행주치마의 유래가 된 전투를 승리로 이끌었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-026',
    name: '곽재우',
    period: '조선',
    role: '조선 의병장',
    description: '홍의장군으로 불린 최초의 의병장. 붉은 옷을 입고 싸웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔴'
  },
  {
    id: 'joseon-027',
    name: '조헌',
    period: '조선',
    role: '조선 의병장',
    description: '금산전투에서 순국한 의병장. 승려 영규와 함께 싸웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-028',
    name: '사명대사',
    period: '조선',
    role: '조선 승려',
    description: '승병을 이끌고 왜군과 싸운 승려. 강화 협상에도 참여했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🙏'
  },
  {
    id: 'joseon-029',
    name: '김덕령',
    period: '조선',
    role: '조선 의병장',
    description: '뛰어난 무예로 의병을 이끌었지만 역모 혐의로 억울하게 죽은 장군이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💔'
  },
  {
    id: 'joseon-030',
    name: '논개',
    period: '조선',
    role: '조선 의기',
    description: '진주성 전투에서 왜장을 안고 남강에 뛰어든 열녀예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'joseon-031',
    name: '광해군',
    period: '조선',
    role: '조선 15대 왕',
    description: '중립 외교로 나라를 지키려 했지만 인조반정으로 쫓겨난 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-032',
    name: '인조',
    period: '조선',
    role: '조선 16대 왕',
    description: '반정으로 왕이 되었지만 병자호란을 겪고 삼전도에서 굴욕을 당한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'joseon-033',
    name: '김상헌',
    period: '조선',
    role: '조선 문신',
    description: '병자호란 때 끝까지 청나라와의 항전을 주장한 척화신이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'joseon-034',
    name: '최명길',
    period: '조선',
    role: '조선 문신',
    description: '병자호란 때 현실적으로 화친을 주장한 주화론자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🕊️'
  },
  {
    id: 'joseon-035',
    name: '임경업',
    period: '조선',
    role: '조선 장군',
    description: '병자호란에서 싸운 명장. 청나라와의 전투에서 활약했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'joseon-036',
    name: '효종',
    period: '조선',
    role: '조선 17대 왕',
    description: '북벌을 꿈꾼 왕. 청나라에 인질로 갔다 온 뒤 복수를 다짐했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-037',
    name: '송시열',
    period: '조선',
    role: '조선 학자',
    description: '서인의 영수로 예송논쟁을 주도한 성리학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'joseon-038',
    name: '허준',
    period: '조선',
    role: '조선 의사',
    description: '동의보감을 쓴 명의. 한의학의 기초를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💊'
  },
  {
    id: 'joseon-039',
    name: '장희빈',
    period: '조선',
    role: '조선 왕비',
    description: '숙종의 후궁에서 왕비가 되었지만 사약을 받은 비운의 여인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'joseon-040',
    name: '숙종',
    period: '조선',
    role: '조선 19대 왕',
    description: '환국 정치로 당쟁을 조절하려 한 강력한 왕이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-041',
    name: '영조',
    period: '조선',
    role: '조선 21대 왕',
    description: '탕평책을 실시해 당쟁을 완화하려 한 장수 군주. 52년간 재위했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-042',
    name: '정조',
    period: '조선',
    role: '조선 22대 왕',
    description: '규장각을 설치하고 개혁 정치를 펼친 개혁 군주. 정약용 등을 등용했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-043',
    name: '정약용',
    period: '조선',
    role: '조선 실학자',
    description: '목민심서, 경세유표 등을 쓴 조선 최고의 실학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'joseon-044',
    name: '박지원',
    period: '조선',
    role: '조선 실학자',
    description: '열하일기를 쓰고 수레와 벽돌 사용을 주장한 북학파 실학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✍️'
  },
  {
    id: 'joseon-045',
    name: '김정희',
    period: '조선',
    role: '조선 예술가',
    description: '추사체를 창안한 서예가. 세한도를 그린 학자이자 예술가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🖌️'
  },
  {
    id: 'joseon-046',
    name: '흥선대원군',
    period: '조선',
    role: '조선 섭정',
    description: '고종의 아버지. 경복궁을 중건하고 쇄국 정책을 펼쳤어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏛️'
  },
  {
    id: 'joseon-047',
    name: '명성황후',
    period: '조선',
    role: '조선 왕비',
    description: '고종의 비로 개화 정책을 추진했지만 일본 낭인들에게 시해당한 비운의 황후예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👸'
  },
  {
    id: 'joseon-048',
    name: '고종',
    period: '조선',
    role: '조선 26대 왕',
    description: '대한제국을 선포하고 황제가 되었지만 일제에 의해 강제 퇴위당한 마지막 군주예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👑'
  },
  {
    id: 'joseon-049',
    name: '순종',
    period: '조선',
    role: '대한제국 황제',
    description: '대한제국의 마지막 황제. 경술국치로 나라를 잃은 비운의 황제예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '😢'
  },
  {
    id: 'joseon-050',
    name: '채제공',
    period: '조선',
    role: '조선 문신',
    description: '정조를 도와 개혁 정치를 펼친 명재상이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },

  // ========================================
  // 근현대 (50명)
  // ========================================
  {
    id: 'modern-001',
    name: '김옥균',
    period: '근현대',
    role: '개화파 정치인',
    description: '갑신정변을 일으켜 근대 개혁을 시도했지만 실패한 개화파 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'modern-002',
    name: '박영효',
    period: '근현대',
    role: '개화파 정치인',
    description: '태극기를 처음 만들고 갑신정변에 참여한 개화파예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🇰🇷'
  },
  {
    id: 'modern-003',
    name: '전봉준',
    period: '근현대',
    role: '동학농민운동 지도자',
    description: '녹두장군으로 불리며 동학농민운동을 이끈 민중 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-004',
    name: '김구',
    period: '근현대',
    role: '독립운동가',
    description: '대한민국 임시정부 주석. 평생을 독립운동에 바친 백범 선생이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🇰🇷'
  },
  {
    id: 'modern-005',
    name: '안중근',
    period: '근현대',
    role: '독립운동가',
    description: '하얼빈에서 이토 히로부미를 저격한 의거의 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-006',
    name: '윤봉길',
    period: '근현대',
    role: '독립운동가',
    description: '상하이 훙커우 공원에서 일본 요인을 폭탄으로 공격한 의사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💣'
  },
  {
    id: 'modern-007',
    name: '이봉창',
    period: '근현대',
    role: '독립운동가',
    description: '일왕 히로히토를 저격하려다 실패했지만 민족의 기개를 보여준 의사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎯'
  },
  {
    id: 'modern-008',
    name: '유관순',
    period: '근현대',
    role: '독립운동가',
    description: '3·1운동을 주도한 열여섯 살 소녀. 고문으로 순국한 민족의 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'modern-009',
    name: '김좌진',
    period: '근현대',
    role: '독립군 장군',
    description: '청산리 대첩에서 일본군을 크게 물리친 독립군 사령관이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-010',
    name: '홍범도',
    period: '근현대',
    role: '독립군 장군',
    description: '봉오동 전투와 청산리 대첩을 이끈 독립군 영웅이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-011',
    name: '이상설',
    period: '근현대',
    role: '독립운동가',
    description: '헤이그 특사로 활동하며 일제의 부당함을 세계에 알린 외교관이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌍'
  },
  {
    id: 'modern-012',
    name: '이준',
    period: '근현대',
    role: '독립운동가',
    description: '헤이그 특사로 활동하다 순국한 애국지사예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🕊️'
  },
  {
    id: 'modern-013',
    name: '이승만',
    period: '근현대',
    role: '대한민국 초대 대통령',
    description: '대한민국 초대 대통령. 독립운동가 출신이지만 독재로 4·19혁명으로 하야했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏛️'
  },
  {
    id: 'modern-014',
    name: '김규식',
    period: '근현대',
    role: '독립운동가',
    description: '임시정부에서 활약하고 통일 정부 수립을 위해 노력한 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🕊️'
  },
  {
    id: 'modern-015',
    name: '여운형',
    period: '근현대',
    role: '정치인',
    description: '좌우 합작을 위해 노력했지만 암살당한 민족 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🤝'
  },
  {
    id: 'modern-016',
    name: '안창호',
    period: '근현대',
    role: '독립운동가',
    description: '도산 선생으로 불리는 교육자이자 독립운동가. 흥사단을 창립했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'modern-017',
    name: '김마리아',
    period: '근현대',
    role: '독립운동가',
    description: '3·1운동을 주도하고 대한민국 애국부인회를 만든 여성 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'modern-018',
    name: '나혜석',
    period: '근현대',
    role: '예술가, 독립운동가',
    description: '최초의 여성 서양화가이자 여성 해방을 주장한 선구자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🎨'
  },
  {
    id: 'modern-019',
    name: '윤희순',
    period: '근현대',
    role: '의병장',
    description: '여성 의병장으로 의병 활동을 펼친 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-020',
    name: '남자현',
    period: '근현대',
    role: '독립운동가',
    description: '대한민국 애국부인회에서 활동한 여성 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-021',
    name: '이회영',
    period: '근현대',
    role: '독립운동가',
    description: '전 재산을 독립운동에 바친 무정부주의자. 신흥무관학교를 세웠어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏫'
  },
  {
    id: 'modern-022',
    name: '이시영',
    period: '근현대',
    role: '독립운동가',
    description: '이회영의 동생으로 함께 독립운동을 한 애국지사. 대한민국 초대 부통령이 되었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🇰🇷'
  },
  {
    id: 'modern-023',
    name: '신채호',
    period: '근현대',
    role: '역사가, 독립운동가',
    description: '단재 선생으로 불리는 민족주의 역사가. 조선상고사를 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'modern-024',
    name: '박은식',
    period: '근현대',
    role: '역사가, 독립운동가',
    description: '대한민국 임시정부 2대 대통령. 한국통사를 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'modern-025',
    name: '한용운',
    period: '근현대',
    role: '승려, 시인',
    description: '만해 선생으로 불리는 독립운동가이자 시인. "님의 침묵"을 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📝'
  },
  {
    id: 'modern-026',
    name: '손병희',
    period: '근현대',
    role: '동학 지도자',
    description: '동학의 3대 교주. 3·1운동을 주도한 민족대표 33인 중 한 명이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-027',
    name: '이상재',
    period: '근현대',
    role: '독립운동가',
    description: 'YMCA를 통해 민족운동을 전개한 기독교 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✝️'
  },
  {
    id: 'modern-028',
    name: '김창숙',
    period: '근현대',
    role: '독립운동가',
    description: '유림 대표로 파리장서운동을 전개한 유학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📜'
  },
  {
    id: 'modern-029',
    name: '조만식',
    period: '근현대',
    role: '독립운동가',
    description: '고당 선생으로 불리는 평안도의 민족 지도자. 물산장려운동을 이끌었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏭'
  },
  {
    id: 'modern-030',
    name: '장준하',
    period: '근현대',
    role: '독립운동가, 언론인',
    description: '학도병으로 끌려갔다 탈출해 광복군이 된 독립운동가. 사상계를 발행했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📰'
  },
  {
    id: 'modern-031',
    name: '지청천',
    period: '근현대',
    role: '독립군 장군',
    description: '한국광복군 총사령관. 일본 육사 출신으로 독립군에 투신했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-032',
    name: '김원봉',
    period: '근현대',
    role: '독립운동가',
    description: '의열단을 조직하고 무장 투쟁을 이끈 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '💣'
  },
  {
    id: 'modern-033',
    name: '약산 김원봉',
    period: '근현대',
    role: '독립운동가',
    description: '의열단과 조선의용대를 이끈 무장 독립운동의 상징이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⚔️'
  },
  {
    id: 'modern-034',
    name: '박열',
    period: '근현대',
    role: '독립운동가',
    description: '일본 천황 암살을 계획하다 체포된 아나키스트 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-035',
    name: '김산',
    period: '근현대',
    role: '독립운동가',
    description: '아리랑의 주인공. 중국 혁명에 참여한 국제적 혁명가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌍'
  },
  {
    id: 'modern-036',
    name: '이육사',
    period: '근현대',
    role: '시인, 독립운동가',
    description: '"청포도"를 쓴 저항 시인. 독립운동을 하다 옥중에서 순국했어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🍇'
  },
  {
    id: 'modern-037',
    name: '윤동주',
    period: '근현대',
    role: '시인',
    description: '"서시", "별 헤는 밤"을 쓴 시인. 일제 감옥에서 순국한 민족 시인이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '⭐'
  },
  {
    id: 'modern-038',
    name: '이광수',
    period: '근현대',
    role: '작가',
    description: '최초의 근대 소설 "무정"을 쓴 작가. 하지만 친일로 돌아서 비판받았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'modern-039',
    name: '최현배',
    period: '근현대',
    role: '한글학자',
    description: '우리말을 연구하고 보급한 한글학자. "우리말본"을 썼어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📚'
  },
  {
    id: 'modern-040',
    name: '주시경',
    period: '근현대',
    role: '한글학자',
    description: '한글 연구와 보급에 평생을 바친 국어학자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✍️'
  },
  {
    id: 'modern-041',
    name: '방정환',
    period: '근현대',
    role: '아동문학가',
    description: '소파 선생으로 불리며 어린이날을 만든 아동 운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '👶'
  },
  {
    id: 'modern-042',
    name: '이인직',
    period: '근현대',
    role: '작가',
    description: '"혈의 누"를 쓴 최초의 신소설 작가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📖'
  },
  {
    id: 'modern-043',
    name: '서재필',
    period: '근현대',
    role: '개화 운동가',
    description: '독립신문을 창간하고 독립협회를 만든 개화파 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '📰'
  },
  {
    id: 'modern-044',
    name: '전명운',
    period: '근현대',
    role: '독립운동가',
    description: '어린 나이에 3·1운동에 참여한 학생 독립운동가예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '✊'
  },
  {
    id: 'modern-045',
    name: '김마리아',
    period: '근현대',
    role: '독립운동가',
    description: '여성 독립운동을 이끈 지도자예요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🌸'
  },
  {
    id: 'modern-046',
    name: '박정희',
    period: '근현대',
    role: '대한민국 대통령',
    description: '경제 개발을 이끌었지만 독재로 비판받는 제5-9대 대통령이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏛️'
  },
  {
    id: 'modern-047',
    name: '김대중',
    period: '근현대',
    role: '대한민국 대통령',
    description: '민주화 운동을 이끌고 대통령이 된 제15대 대통령. 노벨평화상을 받았어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🕊️'
  },
  {
    id: 'modern-048',
    name: '김영삼',
    period: '근현대',
    role: '대한민국 대통령',
    description: '민주화 운동을 이끌고 문민정부를 출범시킨 제14대 대통령이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏛️'
  },
  {
    id: 'modern-049',
    name: '노무현',
    period: '근현대',
    role: '대한민국 대통령',
    description: '서민 출신으로 대통령이 된 제16대 대통령. 참여정부를 이끌었어요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🏛️'
  },
  {
    id: 'modern-050',
    name: '전태일',
    period: '근현대',
    role: '노동운동가',
    description: '근로기준법 준수를 외치며 분신한 노동운동의 상징이에요.',
    unlocked: false,
    imageUrl: '',
    emoji: '🔥'
  }
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

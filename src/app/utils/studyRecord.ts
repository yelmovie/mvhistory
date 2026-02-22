/**
 * studyRecord.ts
 * 학습자별 퀴즈 학습 기록을 localStorage에 저장/관리
 *
 * 저장 키 구조:
 *   study_record_{userId}  →  StudyRecord JSON
 *
 * StudyRecord 구조:
 *   - completedQuestionIds: 맞춘 퀴즈 ID 목록 (중복 출제 방지)
 *   - wrongAnswers: 틀린 문제 목록 (재학습용)
 *   - periodStats: 시대별 통계
 *   - lastStudiedAt: 마지막 학습 일시
 *   - totalCorrect: 누적 정답 수
 *   - totalAttempts: 누적 시도 수
 */

export interface WrongAnswerRecord {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  category: string;
  period: string;
  wrongAt: string; // ISO timestamp
  retryCount: number; // 재도전 횟수
}

export interface PeriodStat {
  period: string;
  totalQuestions: number; // 해당 시대 전체 문제 수
  completedCount: number; // 맞춘 문제 수
  attemptedCount: number; // 시도한 문제 수 (틀린 것 포함)
  lastStudiedAt: string | null;
}

export interface StudyRecord {
  userId: string;
  completedQuestionIds: number[]; // 정답 처리된 퀴즈 ID
  wrongAnswers: WrongAnswerRecord[];
  periodStats: Record<string, PeriodStat>;
  totalCorrect: number;
  totalAttempts: number;
  lastStudiedAt: string | null;
  chattedCharacterIds: string[]; // 대화 완료한 역사 인물 ID 목록
}

// 기본값 생성
function createEmptyRecord(userId: string): StudyRecord {
  return {
    userId,
    completedQuestionIds: [],
    wrongAnswers: [],
    periodStats: {},
    totalCorrect: 0,
    totalAttempts: 0,
    lastStudiedAt: null,
    chattedCharacterIds: [],
  };
}

function getStorageKey(userId: string): string {
  return `study_record_${userId}`;
}

/** 학습 기록 불러오기 */
export function loadStudyRecord(userId: string): StudyRecord {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return createEmptyRecord(userId);
    const parsed = JSON.parse(raw) as StudyRecord;
    // 필드 누락 방어
    return {
      ...createEmptyRecord(userId),
      ...parsed,
      completedQuestionIds: parsed.completedQuestionIds ?? [],
      wrongAnswers: parsed.wrongAnswers ?? [],
      periodStats: parsed.periodStats ?? {},
      chattedCharacterIds: parsed.chattedCharacterIds ?? [],
    };
  } catch {
    return createEmptyRecord(userId);
  }
}

/** 학습 기록 저장 */
export function saveStudyRecord(record: StudyRecord): void {
  try {
    localStorage.setItem(getStorageKey(record.userId), JSON.stringify(record));
  } catch {
    console.warn('[studyRecord] localStorage 저장 실패');
  }
}

/**
 * 정답 처리: completedQuestionIds에 추가 + periodStats 업데이트
 */
export function recordCorrectAnswer(
  userId: string,
  questionId: number,
  period: string,
  periodTotalCount: number
): StudyRecord {
  const record = loadStudyRecord(userId);
  const now = new Date().toISOString();

  // 중복 추가 방지
  if (!record.completedQuestionIds.includes(questionId)) {
    record.completedQuestionIds.push(questionId);
    record.totalCorrect += 1;
  }

  record.totalAttempts += 1;
  record.lastStudiedAt = now;

  // 시대별 통계
  if (!record.periodStats[period]) {
    record.periodStats[period] = {
      period,
      totalQuestions: periodTotalCount,
      completedCount: 0,
      attemptedCount: 0,
      lastStudiedAt: null,
    };
  }
  const stat = record.periodStats[period];
  stat.totalQuestions = periodTotalCount;
  stat.completedCount = record.completedQuestionIds.filter(
    id => id === questionId || stat.completedCount > 0
  ).length;
  // 더 정확하게: 해당 시대 completedIds 기반으로 계산은 외부에서
  stat.attemptedCount += 1;
  stat.lastStudiedAt = now;

  saveStudyRecord(record);
  return record;
}

/**
 * 오답 기록 추가
 */
export function recordWrongAnswer(
  userId: string,
  questionId: number,
  question: string,
  userAnswer: string,
  correctAnswer: string,
  category: string,
  period: string,
  periodTotalCount: number
): StudyRecord {
  const record = loadStudyRecord(userId);
  const now = new Date().toISOString();

  record.totalAttempts += 1;
  record.lastStudiedAt = now;

  // 기존 오답 기록 업데이트 또는 새로 추가
  const existing = record.wrongAnswers.findIndex(w => w.questionId === questionId);
  if (existing >= 0) {
    record.wrongAnswers[existing].retryCount += 1;
    record.wrongAnswers[existing].userAnswer = userAnswer;
    record.wrongAnswers[existing].wrongAt = now;
  } else {
    record.wrongAnswers.push({
      questionId,
      question,
      userAnswer,
      correctAnswer,
      category,
      period,
      wrongAt: now,
      retryCount: 0,
    });
  }

  // 시대별 통계
  if (!record.periodStats[period]) {
    record.periodStats[period] = {
      period,
      totalQuestions: periodTotalCount,
      completedCount: 0,
      attemptedCount: 0,
      lastStudiedAt: null,
    };
  }
  record.periodStats[period].totalQuestions = periodTotalCount;
  record.periodStats[period].attemptedCount += 1;
  record.periodStats[period].lastStudiedAt = now;

  saveStudyRecord(record);
  return record;
}

/**
 * periodStats의 completedCount를 completedQuestionIds 기반으로 정확히 재계산
 * (quizData를 참조해야 하므로 외부에서 periodQuizIds를 넘겨받음)
 */
export function recalcPeriodStats(
  record: StudyRecord,
  periodQuizIds: Record<string, number[]>
): StudyRecord {
  for (const [period, ids] of Object.entries(periodQuizIds)) {
    const completedInPeriod = ids.filter(id =>
      record.completedQuestionIds.includes(id)
    ).length;
    if (!record.periodStats[period]) {
      record.periodStats[period] = {
        period,
        totalQuestions: ids.length,
        completedCount: completedInPeriod,
        attemptedCount: completedInPeriod,
        lastStudiedAt: null,
      };
    } else {
      record.periodStats[period].totalQuestions = ids.length;
      record.periodStats[period].completedCount = completedInPeriod;
    }
  }
  return record;
}

/** 오답 중 특정 문제를 정답 처리 (재도전 성공) */
export function resolveWrongAnswer(userId: string, questionId: number): StudyRecord {
  const record = loadStudyRecord(userId);
  record.wrongAnswers = record.wrongAnswers.filter(w => w.questionId !== questionId);
  if (!record.completedQuestionIds.includes(questionId)) {
    record.completedQuestionIds.push(questionId);
    record.totalCorrect += 1;
  }
  saveStudyRecord(record);
  return record;
}

/** 특정 시대의 학습 진행률 (0~100) */
export function getPeriodProgress(userId: string, period: string, periodTotalCount: number): number {
  const record = loadStudyRecord(userId);
  const stat = record.periodStats[period];
  if (!stat || periodTotalCount === 0) return 0;
  return Math.round((stat.completedCount / periodTotalCount) * 100);
}

/** 모든 시대의 completedQuestionIds 반환 (App.tsx 초기화용) */
export function getCompletedQuestionIds(userId: string): number[] {
  return loadStudyRecord(userId).completedQuestionIds;
}

/** 학습 기록 초기화 (특정 유저) */
export function resetStudyRecord(userId: string): void {
  localStorage.removeItem(getStorageKey(userId));
}

/**
 * 역사 인물과의 대화 완료 기록
 * chattedCharacterIds에 중복 없이 저장
 */
export function recordChatCompleted(userId: string, characterId: string): StudyRecord {
  const record = loadStudyRecord(userId);
  if (!record.chattedCharacterIds.includes(characterId)) {
    record.chattedCharacterIds.push(characterId);
  }
  record.lastStudiedAt = new Date().toISOString();
  saveStudyRecord(record);
  return record;
}

/** 대화한 역사 인물 수 반환 */
export function getChattedCharacterCount(userId: string): number {
  return loadStudyRecord(userId).chattedCharacterIds.length;
}

/** 모든 사용자 학습 기록 키 반환 */
export function getAllStudyRecordUserIds(): string[] {
  const ids: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('study_record_')) {
      ids.push(key.replace('study_record_', ''));
    }
  }
  return ids;
}

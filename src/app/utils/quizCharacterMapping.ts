// 퀴즈와 인물 카드를 자동으로 매핑하는 유틸리티

import type { Quiz, Character } from '../data/quizData';

/**
 * 퀴즈 ID 범위에 따라 자동으로 character ID를 할당합니다.
 * 500개 퀴즈를 210명의 인물에 분산 매핑
 */
export function mapQuizToCharacter(quizzes: Quiz[], characters: Character[]): Quiz[] {
  return quizzes.map(quiz => {
    // 이미 characterId가 설정되어 있으면 그대로 사용
    if (quiz.characterId) {
      return quiz;
    }

    let characterId: string | undefined;

    // 퀴즈 ID 범위에 따라 시대별 인물 할당
    if (quiz.id >= 1 && quiz.id <= 100) {
      // 삼국시대 퀴즈 (1-100번)
      
      // 고조선 퀴즈 (1-25번) -> 고조선 인물 10명
      if (quiz.id >= 1 && quiz.id <= 25) {
        const charIndex = Math.floor((quiz.id - 1) / 2.5); // 2.5개 퀴즈당 1명
        if (charIndex < 10) {
          characterId = `gojoseon-${String(charIndex + 1).padStart(3, '0')}`;
        }
      }
      // 삼국시대 관련 퀴즈 (26-100번) -> 삼국시대 인물 50명  
      else if (quiz.id >= 26 && quiz.id <= 100) {
        const charIndex = Math.floor((quiz.id - 26) / 1.5); // 1.5개 퀴즈당 1명
        if (charIndex < 50) {
          characterId = `three-kingdoms-${String(charIndex + 1).padStart(3, '0')}`;
        }
      }
    }
    else if (quiz.id >= 101 && quiz.id <= 200) {
      // 고려 퀴즈 (101-200번) -> 고려 인물 50명
      const charIndex = Math.floor((quiz.id - 101) / 2); // 2개 퀴즈당 1명
      if (charIndex < 50) {
        characterId = `goryeo-${String(charIndex + 1).padStart(3, '0')}`;
      }
    }
    else if (quiz.id >= 201 && quiz.id <= 300) {
      // 조선 퀴즈 (201-300번) -> 조선 인물 50명
      const charIndex = Math.floor((quiz.id - 201) / 2); // 2개 퀴즈당 1명
      if (charIndex < 50) {
        characterId = `joseon-${String(charIndex + 1).padStart(3, '0')}`;
      }
    }
    else if (quiz.id >= 301 && quiz.id <= 500) {
      // 근현대 퀴즈 (301-500번) -> 근현대 인물 50명
      const charIndex = Math.floor((quiz.id - 301) / 4); // 4개 퀴즈당 1명
      if (charIndex < 50) {
        characterId = `modern-${String(charIndex + 1).padStart(3, '0')}`;
      }
    }

    return {
      ...quiz,
      characterId
    };
  });
}

/**
 * 모든 시대의 퀴즈에 character ID를 할당합니다.
 */
export function mapAllQuizzesToCharacters(
  quizzesByPeriod: Record<string, Quiz[]>,
  characters: Character[]
): Record<string, Quiz[]> {
  const result: Record<string, Quiz[]> = {};

  for (const [period, quizzes] of Object.entries(quizzesByPeriod)) {
    result[period] = mapQuizToCharacter(quizzes, characters);
  }

  return result;
}

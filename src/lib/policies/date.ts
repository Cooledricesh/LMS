/**
 * 날짜 관련 정책 검증 유틸리티
 */

export interface DeadlineCheckResult {
  isPastDue: boolean;
  canSubmitLate: boolean;
  hoursRemaining?: number;
  daysRemaining?: number;
}

/**
 * 마감일 정책 검증
 * @param dueDate - 마감일
 * @param allowLate - 지각 제출 허용 여부
 * @param now - 현재 시간 (테스트용 파라미터)
 * @returns 마감일 체크 결과
 */
export const checkDeadlinePolicy = (
  dueDate: Date | string,
  allowLate: boolean,
  now: Date = new Date()
): DeadlineCheckResult => {
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const nowTime = now.getTime();
  const dueTime = dueDateObj.getTime();

  const isPastDue = nowTime > dueTime;
  const canSubmitLate = isPastDue && allowLate;

  const timeDiff = dueTime - nowTime;
  const hoursRemaining = isPastDue ? undefined : Math.floor(timeDiff / (1000 * 60 * 60));
  const daysRemaining = isPastDue ? undefined : Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return {
    isPastDue,
    canSubmitLate,
    hoursRemaining,
    daysRemaining
  };
};

/**
 * 마감일까지 남은 시간을 사람이 읽기 쉬운 형태로 변환
 * @param dueDate - 마감일
 * @param now - 현재 시간
 * @returns 읽기 쉬운 시간 문자열
 */
export const getTimeUntilDue = (
  dueDate: Date | string,
  now: Date = new Date()
): string => {
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const timeDiff = dueDateObj.getTime() - now.getTime();

  if (timeDiff < 0) {
    return '마감됨';
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}일 ${hours}시간 남음`;
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  } else {
    return `${minutes}분 남음`;
  }
};

/**
 * 날짜가 특정 기간 내에 있는지 확인
 * @param date - 확인할 날짜
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns 기간 내에 있는지 여부
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const startObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const endObj = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return dateObj >= startObj && dateObj <= endObj;
};
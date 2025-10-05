import { format, formatDistanceToNow, isAfter, isBefore, differenceInDays, differenceInHours, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Format date to Korean locale string
 */
export const formatDate = (date: string | Date, formatStr: string = 'yyyy년 MM월 dd일 HH:mm'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr, { locale: ko });
};

/**
 * Format date to relative time (e.g., "3시간 전", "2일 후")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: ko });
};

/**
 * Get D-Day format for assignment due dates
 */
export const getDDayFormat = (dueDate: string | Date): string => {
  const parsedDate = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const now = new Date();

  if (isAfter(now, parsedDate)) {
    return '마감됨';
  }

  const daysUntilDue = differenceInDays(parsedDate, now);

  if (daysUntilDue === 0) {
    const hoursUntilDue = differenceInHours(parsedDate, now);
    if (hoursUntilDue === 0) {
      return '곧 마감';
    }
    return `${hoursUntilDue}시간 남음`;
  }

  if (daysUntilDue === 1) {
    return 'D-1';
  }

  return `D-${daysUntilDue}`;
};

/**
 * Check if date is past due
 */
export const isPastDue = (date: string | Date): boolean => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(new Date(), parsedDate);
};

/**
 * Check if date is upcoming (within specified days)
 */
export const isUpcoming = (date: string | Date, withinDays: number = 7): boolean => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const daysUntil = differenceInDays(parsedDate, now);

  return daysUntil >= 0 && daysUntil <= withinDays;
};

/**
 * Format date for display in assignment list
 */
export const formatAssignmentDueDate = (dueDate: string | Date): {
  formatted: string;
  dDay: string;
  isPastDue: boolean;
  isUrgent: boolean;
} => {
  const parsedDate = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const now = new Date();
  const pastDue = isAfter(now, parsedDate);
  const daysUntilDue = differenceInDays(parsedDate, now);

  return {
    formatted: formatDate(parsedDate, 'MM/dd (E) HH:mm'),
    dDay: getDDayFormat(parsedDate),
    isPastDue: pastDue,
    isUrgent: !pastDue && daysUntilDue <= 3,
  };
};
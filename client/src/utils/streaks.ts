import { parseISO, differenceInCalendarDays, isToday, isYesterday } from 'date-fns';

/**
 * Calculate current and longest streaks from an array of session_date strings.
 * @param sessionDates - Array of YYYY-MM-DD strings, may have duplicates
 * @returns { currentStreak, longestStreak }
 */
export function calculateStreaks(sessionDates: string[]): { currentStreak: number; longestStreak: number } {
  if (sessionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Deduplicate and sort dates ascending
  const uniqueDates = Array.from(new Set(sessionDates))
    .map((d) => parseISO(d))
    .sort((a, b) => a.getTime() - b.getTime());

  // Calculate longest streak
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = differenceInCalendarDays(uniqueDates[i], uniqueDates[i - 1]);
    if (diff === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else if (diff > 1) {
      currentRun = 1;
    }
    // diff === 0 shouldn't happen after dedup, but handle gracefully
  }

  // Calculate current streak (must end today or yesterday)
  const lastDate = uniqueDates[uniqueDates.length - 1];
  let currentStreak = 0;

  if (isToday(lastDate) || isYesterday(lastDate)) {
    currentStreak = 1;

    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const diff = differenceInCalendarDays(uniqueDates[i + 1], uniqueDates[i]);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

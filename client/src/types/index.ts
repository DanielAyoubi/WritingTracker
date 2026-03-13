export interface Participant {
  pseudonym: string;
  created_at: string;
}

export interface Session {
  id: number;
  pseudonym: string;
  session_date: string;
  duration_minutes: number;
  word_count: number;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  topic: string;
  logged_at: string;
}

export interface SessionFormData {
  session_date: string;
  duration_minutes: number;
  word_count: number;
  topic: string;
}

export interface AdminStats {
  totalParticipants: number;
  totalSessions: number;
  totalWords: number;
  totalMinutes: number;
  avgWordsPerSession: number;
  timeOfDayBreakdown: { time_of_day: string; count: number }[];
  recentActivity: { session_date: string; sessions: number; words: number }[];
}

export interface AdminParticipantSummary {
  pseudonym: string;
  created_at: string;
  session_count: number;
  total_words: number;
  total_minutes: number;
  last_session_date: string | null;
}

export interface AdminParticipantDetail {
  participant: Participant;
  sessions: Session[];
  stats: {
    session_count: number;
    total_words: number;
    total_minutes: number;
    avg_words_per_session: number;
  };
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
}

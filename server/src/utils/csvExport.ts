interface SessionRow {
  pseudonym: string;
  session_date: string;
  duration_minutes: number;
  word_count: number;
  time_of_day: string;
  topic: string;
  logged_at: string;
}

export function generateCsv(sessions: SessionRow[]): string {
  const header = 'pseudonym,session_date,duration_minutes,word_count,time_of_day,topic,logged_at';

  const rows = sessions.map((s) => {
    const values = [
      escapeCsvField(s.pseudonym),
      escapeCsvField(s.session_date),
      String(s.duration_minutes),
      String(s.word_count),
      escapeCsvField(s.time_of_day),
      escapeCsvField(s.topic),
      escapeCsvField(s.logged_at),
    ];
    return values.join(',');
  });

  return [header, ...rows].join('\n');
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

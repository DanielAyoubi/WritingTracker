import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfWeek, addDays, subWeeks } from 'date-fns';
import type { Session } from '../../types';

interface Props {
  sessions: Session[];
  weeks?: number;
}

export function WeeklyBarChart({ sessions, weeks = 8 }: Props) {
  // Build week buckets
  const today = new Date();
  const data = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    const label = format(weekStart, 'MMM d');

    const weekSessions = sessions.filter((s) => {
      const date = parseISO(s.session_date);
      return date >= weekStart && date <= weekEnd;
    });

    const totalWords = weekSessions.reduce((sum, s) => sum + s.word_count, 0);
    const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

    data.push({ week: label, words: totalWords, minutes: totalMinutes, count: weekSessions.length });
  }

  return (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
        Words Written per Week
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === 'words' ? `${value.toLocaleString()} words` : `${value} min`,
              name === 'words' ? 'Words' : 'Minutes',
            ]}
          />
          <Bar dataKey="words" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import type { Session } from '../../types';

interface Props {
  sessions: Session[];
  months?: number;
}

export function MonthlyLineChart({ sessions, months = 6 }: Props) {
  const today = new Date();
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(today, i));
    const monthEnd = startOfMonth(subMonths(today, i - 1));
    const label = format(monthStart, 'MMM yyyy');

    const monthSessions = sessions.filter((s) => {
      const date = parseISO(s.session_date);
      return date >= monthStart && date < monthEnd;
    });

    const totalWords = monthSessions.reduce((sum, s) => sum + s.word_count, 0);
    const totalMinutes = monthSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

    data.push({
      month: label,
      words: totalWords,
      minutes: totalMinutes,
      sessions: monthSessions.length,
    });
  }

  return (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
        Monthly Writing Trend
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === 'words' ? `${value.toLocaleString()} words` : `${value} sessions`,
              name === 'words' ? 'Words' : 'Sessions',
            ]}
          />
          <Line
            type="monotone"
            dataKey="words"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ r: 4, fill: '#7c3aed' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

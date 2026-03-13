import { Clock, BookOpen, Calendar } from 'lucide-react';
import type { Session } from '../types';
import { formatDate, formatDuration, formatNumber, toTitleCase } from '../utils/formatters';

interface Props {
  sessions: Session[];
  limit?: number;
}

const timeOfDayColors: Record<string, string> = {
  morning: '#fef9c3',
  afternoon: '#dbeafe',
  evening: '#fce7f3',
  night: '#ede9fe',
};

const timeOfDayBorderColors: Record<string, string> = {
  morning: '#fef08a',
  afternoon: '#bfdbfe',
  evening: '#fbcfe8',
  night: '#ddd6fe',
};

export function RecentSessionsList({ sessions, limit = 10 }: Props) {
  const displayed = sessions.slice(0, limit);

  if (displayed.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
        <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <p>No sessions logged yet. Start tracking your writing!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {displayed.map((session) => (
        <div
          key={session.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '14px 18px',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>
              {toTitleCase(session.topic)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
              <Calendar size={12} />
              {formatDate(session.session_date)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#374151', fontSize: '14px' }}>
              <Clock size={14} />
              {formatDuration(session.duration_minutes)}
            </div>
            <div style={{ color: '#374151', fontSize: '14px' }}>
              {formatNumber(session.word_count)} words
            </div>
            <span style={{
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              backgroundColor: timeOfDayColors[session.time_of_day] || '#f3f4f6',
              border: `1px solid ${timeOfDayBorderColors[session.time_of_day] || '#e5e7eb'}`,
              color: '#374151',
            }}>
              {session.time_of_day}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

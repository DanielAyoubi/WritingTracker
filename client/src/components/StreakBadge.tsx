import { Flame, Trophy } from 'lucide-react';
import type { StreakInfo } from '../types';

interface Props {
  streakInfo: StreakInfo;
}

export function StreakBadge({ streakInfo }: Props) {
  const { currentStreak, longestStreak } = streakInfo;

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: currentStreak > 0 ? '#fff7ed' : '#f9fafb',
        border: `1px solid ${currentStreak > 0 ? '#fed7aa' : '#e5e7eb'}`,
        borderRadius: '10px',
        padding: '12px 20px',
      }}>
        <Flame size={24} color={currentStreak > 0 ? '#f97316' : '#9ca3af'} />
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: currentStreak > 0 ? '#c2410c' : '#6b7280' }}>
            {currentStreak}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Day streak</div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#fefce8',
        border: '1px solid #fde68a',
        borderRadius: '10px',
        padding: '12px 20px',
      }}>
        <Trophy size={24} color='#d97706' />
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#92400e' }}>
            {longestStreak}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Best streak</div>
        </div>
      </div>
    </div>
  );
}

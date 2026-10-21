import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { usePseudonym } from '../hooks/usePseudonym';
import { useSessions } from '../hooks/useSessions';
import { calculateStreaks } from '../utils/streaks';
import { formatNumber, formatDuration } from '../utils/formatters';
import { StreakBadge } from '../components/StreakBadge';
import { RecentSessionsList } from '../components/RecentSessionsList';
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart';
import { MonthlyLineChart } from '../components/charts/MonthlyLineChart';

export function Dashboard() {
  const { pseudonym } = usePseudonym();
  const { data: sessions = [], isLoading, error } = useSessions(pseudonym);

  const streakInfo = useMemo(() => {
    const dates = sessions.map((s) => s.session_date);
    return calculateStreaks(dates);
  }, [sessions]);

  const stats = useMemo(() => {
    const totalWords = sessions.reduce((sum, s) => sum + s.word_count, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    return { totalWords, totalMinutes, totalSessions: sessions.length };
  }, [sessions]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#9ca3af' }}>
        Loading your writing data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#ef4444' }}>
        Failed to load sessions. Please refresh.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Welcome back, <strong>{pseudonym}</strong>
          </p>
        </div>
        <Link
          to="/log"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#0ea5e9',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <PenLine size={16} />
          Log Session
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={<BookOpen size={20} color="#0ea5e9" />} label="Total Sessions" value={String(stats.totalSessions)} />
        <StatCard icon={<PenLine size={20} color="#0ea5e9" />} label="Total Words" value={formatNumber(stats.totalWords)} />
        <StatCard icon={<Clock size={20} color="#10b981" />} label="Time Writing" value={formatDuration(stats.totalMinutes)} />
        <StatCard icon={<TrendingUp size={20} color="#f59e0b" />} label="Avg per Session" value={`${stats.totalSessions > 0 ? Math.round(stats.totalWords / stats.totalSessions) : 0} words`} />
      </div>

      {/* Streaks */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#374151', marginBottom: '14px' }}>Streaks</h2>
        <StreakBadge streakInfo={streakInfo} />
      </div>

      {/* Charts */}
      {sessions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#fff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px' }}>
            <WeeklyBarChart sessions={sessions} />
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px' }}>
            <MonthlyLineChart sessions={sessions} />
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#374151' }}>Recent Sessions</h2>
        </div>
        <RecentSessionsList sessions={sessions} limit={10} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #bae6fd',
      borderRadius: '12px',
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: '#e0f2fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{value}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { adminApi } from '../../api/client';
import { useAdmin } from '../../hooks/useAdmin';
import { formatNumber, formatDuration, formatDate, formatDateTime } from '../../utils/formatters';
import { calculateStreaks } from '../../utils/streaks';
import { StreakBadge } from '../../components/StreakBadge';
import type { AdminParticipantDetail as Detail } from '../../types';

export function AdminParticipantDetail() {
  const { pseudonym } = useParams<{ pseudonym: string }>();
  const { token, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login');
  }, [isAuthenticated, navigate]);

  const { data, isLoading, error } = useQuery<Detail>({
    queryKey: ['admin', 'participant', pseudonym],
    queryFn: () => adminApi.getParticipantDetail(pseudonym!, token!),
    enabled: !!token && !!pseudonym,
  });

  async function handleExport() {
    if (!token || !pseudonym) return;
    try {
      const csv = await adminApi.exportCsv(token, pseudonym);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pseudonym}_sessions.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV');
    }
  }

  if (!isAuthenticated) return null;

  if (isLoading) {
    return <div style={{ padding: '32px', color: '#9ca3af' }}>Loading participant data...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ padding: '32px', color: '#ef4444' }}>
        Failed to load participant data.{' '}
        <Link to="/admin/dashboard" style={{ color: '#0ea5e9' }}>Back</Link>
      </div>
    );
  }

  const { participant, sessions, stats } = data;
  const streakInfo = calculateStreaks(sessions.map((s) => s.session_date));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Back */}
      <Link
        to="/admin/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0ea5e9', textDecoration: 'none', fontSize: '14px', marginBottom: '20px' }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>
            {participant.pseudonym}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Member since {formatDate(participant.created_at)}
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', backgroundColor: '#f0f9ff',
            border: '1px solid #d1d5db', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px',
          }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <MiniStat label="Sessions" value={String(stats.session_count)} />
        <MiniStat label="Total Words" value={formatNumber(stats.total_words)} />
        <MiniStat label="Total Time" value={formatDuration(stats.total_minutes)} />
        <MiniStat label="Avg Words/Session" value={String(Math.round(stats.avg_words_per_session))} />
      </div>

      {/* Streaks */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Streaks</h2>
        <StreakBadge streakInfo={streakInfo} />
      </div>

      {/* Sessions Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #bae6fd', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #bae6fd' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
            All Sessions ({sessions.length})
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                {['Date', 'Topic', 'Duration', 'Words', 'Time of Day', 'Logged At'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #bae6fd' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '11px 16px', color: '#374151' }}>{formatDate(s.session_date)}</td>
                  <td style={{ padding: '11px 16px', color: '#1f2937', fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.topic}
                  </td>
                  <td style={{ padding: '11px 16px', color: '#374151' }}>{formatDuration(s.duration_minutes)}</td>
                  <td style={{ padding: '11px 16px', color: '#374151' }}>{formatNumber(s.word_count)}</td>
                  <td style={{ padding: '11px 16px', color: '#374151' }}>{s.time_of_day}</td>
                  <td style={{ padding: '11px 16px', color: '#9ca3af', fontSize: '12px' }}>{formatDateTime(s.logged_at)}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                    No sessions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '10px',
      padding: '16px',
    }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

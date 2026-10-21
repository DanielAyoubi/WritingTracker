import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, PenLine, Clock, Download, LogOut } from 'lucide-react';
import { adminApi } from '../../api/client';
import { useAdmin } from '../../hooks/useAdmin';
import { formatNumber, formatDuration, formatDate } from '../../utils/formatters';
import type { AdminParticipantSummary, AdminStats } from '../../types';

export function AdminDashboard() {
  const { token, logout, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/admin/login');
  }, [isAuthenticated, navigate]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(token!),
    enabled: !!token,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery<AdminParticipantSummary[]>({
    queryKey: ['admin', 'participants'],
    queryFn: () => adminApi.getParticipants(token!),
    enabled: !!token,
  });

  async function handleExport() {
    if (!token) return;
    try {
      const csv = await adminApi.exportCsv(token);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'writing_sessions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV');
    }
  }

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  if (!isAuthenticated) return null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1f2937' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', backgroundColor: '#f0f9ff',
              border: '1px solid #d1d5db', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', color: '#374151',
            }}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', backgroundColor: '#0c4a6e',
              border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', color: '#fff',
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <p style={{ color: '#9ca3af' }}>Loading stats...</p>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <AdminStatCard icon={<Users size={20} color="#0ea5e9" />} label="Participants" value={String(stats.totalParticipants)} />
          <AdminStatCard icon={<BookOpen size={20} color="#0ea5e9" />} label="Total Sessions" value={String(stats.totalSessions)} />
          <AdminStatCard icon={<PenLine size={20} color="#10b981" />} label="Total Words" value={formatNumber(stats.totalWords)} />
          <AdminStatCard icon={<Clock size={20} color="#f59e0b" />} label="Total Time" value={formatDuration(stats.totalMinutes)} />
        </div>
      ) : null}

      {/* Participants Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #bae6fd', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #bae6fd' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1f2937' }}>Participants</h2>
        </div>

        {participantsLoading ? (
          <p style={{ padding: '20px', color: '#9ca3af' }}>Loading participants...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  {['Pseudonym', 'Sessions', 'Words', 'Time', 'Last Session', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #bae6fd' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(participants || []).map((p) => (
                  <tr key={p.pseudonym} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1f2937' }}>{p.pseudonym}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{p.session_count}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{formatNumber(p.total_words)}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{formatDuration(p.total_minutes)}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>
                      {p.last_session_date ? formatDate(p.last_session_date) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        to={`/admin/participants/${encodeURIComponent(p.pseudonym)}`}
                        style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!participants || participants.length === 0) && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                      No participants yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
        width: '40px', height: '40px', borderRadius: '10px',
        backgroundColor: '#f0f9ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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

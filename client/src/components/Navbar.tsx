import { Link, useNavigate } from 'react-router-dom';
import { PenLine, LayoutDashboard, LogOut, BookOpen } from 'lucide-react';
import { usePseudonym } from '../hooks/usePseudonym';

export function Navbar() {
  const { pseudonym, removePseudonym } = usePseudonym();
  const navigate = useNavigate();

  function handleLogout() {
    removePseudonym();
    navigate('/onboarding');
  }

  return (
    <nav style={{
      backgroundColor: '#1a1a2e',
      color: '#eee',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      height: '60px',
      gap: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', textDecoration: 'none', fontWeight: 700, fontSize: '18px' }}>
        <PenLine size={22} />
        WritingTracker
      </Link>

      <div style={{ flex: 1 }} />

      {pseudonym && (
        <>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link to="/log" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc', textDecoration: 'none', fontSize: '14px' }}>
            <BookOpen size={16} />
            Log Session
          </Link>
          <span style={{ color: '#888', fontSize: '13px' }}>
            {pseudonym}
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: '1px solid #444',
              color: '#ccc',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            <LogOut size={14} />
            Switch
          </button>
        </>
      )}
    </nav>
  );
}

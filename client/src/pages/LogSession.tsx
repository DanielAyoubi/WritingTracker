import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePseudonym } from '../hooks/usePseudonym';
import { useLogSession } from '../hooks/useSessions';
import { SessionForm } from '../components/SessionForm';

export function LogSession() {
  const { pseudonym } = usePseudonym();
  const { mutateAsync: logSession, isPending } = useLogSession();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(data: {
    session_date: string;
    duration_minutes: number;
    word_count: number;
    topic: string;
  }) {
    if (!pseudonym) {
      navigate('/onboarding');
      return;
    }

    setError('');
    try {
      await logSession({ ...data, pseudonym });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to log session. Please try again.');
      }
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#7c3aed',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>
          Log Writing Session
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          Record your writing session as <strong>{pseudonym}</strong>
        </p>
      </div>

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          color: '#16a34a',
        }}>
          <CheckCircle size={20} />
          Session logged successfully!
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          color: '#dc2626',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '28px',
      }}>
        <SessionForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { participantsApi, ApiError } from '../api/client';
import { usePseudonym } from '../hooks/usePseudonym';

export function Onboarding() {
  const [pseudonym, setPseudonymInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { savePseudonym } = usePseudonym();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = pseudonym.trim();

    if (trimmed.length < 2) {
      setError('Pseudonym must be at least 2 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await participantsApi.register(trimmed);
      savePseudonym(trimmed);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Pseudonym taken - offer to use it anyway (if it's theirs)
        try {
          await participantsApi.get(trimmed);
          // It exists - let them claim it (trust-based, no auth)
          savePseudonym(trimmed);
          navigate('/dashboard');
        } catch {
          setError('Pseudonym already taken. Please choose another.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f3ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(124, 58, 237, 0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#ede9fe',
            borderRadius: '16px',
            marginBottom: '16px',
          }}>
            <PenLine size={32} color="#7c3aed" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
            Welcome to WritingTracker
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            Choose a pseudonym to start tracking your writing sessions privately.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="pseudonym"
              style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}
            >
              Your Pseudonym
            </label>
            <input
              id="pseudonym"
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonymInput(e.target.value)}
              placeholder="e.g. QuietScribbler42"
              maxLength={50}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{error}</p>
            )}
            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '6px' }}>
              2–50 characters: letters, numbers, spaces, hyphens, underscores.
              If the pseudonym exists and is yours, you'll be taken to your dashboard.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? '#a78bfa' : '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Getting started...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}

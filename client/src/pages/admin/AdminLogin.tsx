import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { adminApi, ApiError } from '../../api/client';
import { useAdmin } from '../../hooks/useAdmin';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken } = useAdmin();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { token } = await adminApi.login(password);
      setToken(token);
      navigate('/admin/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Too many login attempts. Please wait 15 minutes.');
        } else {
          setError('Invalid password.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f9ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            backgroundColor: '#0c4a6e',
            borderRadius: '14px',
            marginBottom: '16px',
          }}>
            <Shield size={28} color="#38bdf8" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
            Admin Access
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Enter the admin password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151', fontSize: '14px' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#6b7280' : '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

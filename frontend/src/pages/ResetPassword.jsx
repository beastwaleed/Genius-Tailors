import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

import authBg from '../assets/port_model_classic_1781781070827.png';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error('Please fill in all fields');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const { data } = await api.post(`/api/auth/reset-password/${token}`, { password });
      toast.success(data.message || 'Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <Link to="/" className="auth-logo-mobile">GT</Link>
          <h1 className="text-heading-2" style={{ marginBottom: '0.5rem', color: 'var(--onyx)' }}>Create New Password</h1>
          <p className="text-subtitle" style={{ color: 'var(--stone)', marginBottom: '2.5rem' }}>
            Please enter your new secure password below.
          </p>

          <form onSubmit={handleSubmit} className="form-layout">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-input" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Visual Side */}
      <div className="auth-visual">
        <img src={authBg} alt="Genius Tailors" className="auth-img" />
        <div className="auth-overlay">
          <Link to="/" className="auth-logo">GT</Link>
          <div className="auth-quote">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Welcome Back</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Your new password ensures your measurements and orders remain strictly confidential.</p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-layout {
          display: flex;
          min-height: 100vh;
          background: var(--ivory);
        }

        .auth-visual {
          flex: 1;
          position: relative;
          display: none;
        }

        .auth-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .auth-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%, rgba(10,10,10,0.4) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4rem;
        }

        .auth-logo {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--ivory);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-quote {
          color: var(--ivory);
          max-width: 480px;
        }

        .auth-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--ivory);
        }

        .auth-form-container {
          width: 100%;
          max-width: 400px;
        }

        .auth-logo-mobile {
          display: block;
          font-family: var(--font-serif);
          font-size: 2rem;
          color: var(--onyx);
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        @media (min-width: 1024px) {
          .auth-visual {
            display: block;
          }
          .auth-logo-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

import authBg from '../assets/port_detail_stitch_1781781054620.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link requested!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request reset link');
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
          <h1 className="text-heading-2" style={{ marginBottom: '0.5rem', color: 'var(--onyx)' }}>Reset Password</h1>
          
          {sent ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
              <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>Check your email</h3>
              <p style={{ color: '#15803d', fontSize: '0.95rem', lineHeight: 1.5 }}>
                If an account exists for <strong>{email}</strong>, we have sent a password reset link. 
                <br /><br />
                <span style={{ fontSize: '0.85rem' }}>(Note: If you are testing locally without SMTP configured, check your backend terminal for the link!)</span>
              </p>
              <Link to="/login" className="btn btn-outline" style={{ display: 'inline-block', marginTop: '1.5rem' }}>Return to Login</Link>
            </div>
          ) : (
            <>
              <p className="text-subtitle" style={{ color: 'var(--stone)', marginBottom: '2.5rem' }}>
                Enter your email address and we'll send you a secure link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="form-layout">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Processing...' : 'Send Reset Link'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--stone)', fontSize: '0.95rem' }}>
                Remember your password? <Link to="/login" style={{ color: 'var(--onyx)', fontWeight: '600', borderBottom: '1px solid var(--onyx)' }}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Visual Side */}
      <div className="auth-visual">
        <img src={authBg} alt="Genius Tailors" className="auth-img" />
        <div className="auth-overlay">
          <Link to="/" className="auth-logo">GT</Link>
          <div className="auth-quote">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Secure Recovery</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Regain access to your customized dashboard safely and easily.</p>
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

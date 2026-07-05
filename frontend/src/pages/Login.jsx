import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

import authBg from '../assets/port_model_shalwar_1781781002030.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname ? (location.state.from.pathname + (location.state.from.search || '')) : null;

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from || '/dashboard', { replace: true });
      }
    }
  }, [isLoggedIn, navigate, from, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data, data.token);
      toast.success('Welcome back to Genius Tailors!');
      // Redirection is now handled by the useEffect above
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Visual Side */}
      <div className="auth-visual">
        <img src={authBg} alt="Genius Tailors" className="auth-img" />
        <div className="auth-overlay">
          <Link to="/" className="auth-logo">GT</Link>
          <div className="auth-quote">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>The Perfect Fit</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Sign in to manage your measurements, track orders, and experience true bespoke tailoring.</p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <Link to="/" className="auth-logo-mobile">GT</Link>
          <h1 className="text-heading-2" style={{ marginBottom: '0.5rem', color: 'var(--onyx)' }}>Welcome Back</h1>
          <p className="text-subtitle" style={{ color: 'var(--stone)', marginBottom: '2.5rem' }}>Please enter your details to sign in.</p>

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

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--stone)', textDecoration: 'underline' }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                className="form-input"
                required
                style={{ marginTop: '0.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--stone)', fontSize: '0.95rem' }}>
            Don't have an account? <Link to="/register" state={{ from: location.state?.from }} style={{ color: 'var(--onyx)', fontWeight: '600', borderBottom: '1px solid var(--onyx)' }}>Sign up</Link>
          </p>
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
          padding: 3rem;
          color: white;
        }

        .auth-logo {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: white;
          text-decoration: none;
        }

        .auth-logo-mobile {
          display: none;
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--onyx);
          text-decoration: none;
          margin-bottom: 2rem;
          text-align: center;
        }

        .auth-quote {
          max-width: 400px;
        }

        .auth-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .auth-form-container {
          width: 100%;
          max-width: 420px;
        }

        @media (min-width: 1024px) {
          .auth-visual {
            display: flex;
          }
        }

        @media (max-width: 1023px) {
          .auth-logo-mobile {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

import authBg from '../assets/port_detail_stitch_1781781054620.png';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [loading, setLoading] = useState(false);
  
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ? (location.state.from.pathname + (location.state.from.search || '')) : null;

  useEffect(() => {
    if (isLoggedIn) {
      navigate(from || '/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || name.trim() === '') {
      return toast.error('Full Name is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error('Please enter a valid email address');
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^\+92\d{10}$/.test(cleanPhone)) {
      return toast.error('Phone number must start with +92 followed by 10 digits (e.g., +923001234567)');
    }

    if (!street || street.trim() === '') {
      return toast.error('Street Address is required');
    }

    if (!city || city.trim() === '') {
      return toast.error('City is required');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    setLoading(true);
    try {
      // Send the cleaned phone number to the backend
      const { data } = await api.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        phone: cleanPhone, 
        street, 
        city, 
        country 
      });
      login(data, data.token);
      toast.success('Account created successfully!');
      // Redirection is now handled by the useEffect above
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
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
          <h1 className="text-heading-2" style={{ marginBottom: '0.5rem', color: 'var(--onyx)' }}>Create Account</h1>
          <p className="text-subtitle" style={{ color: 'var(--stone)', marginBottom: '2.5rem' }}>Join Genius Tailors to manage your bespoke journey.</p>

          <form onSubmit={handleSubmit} className="form-layout">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              <label className="form-label">Phone (WhatsApp)</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. +92 300 1234567"
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="House #, Street, Block"
                required 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="form-input" 
                  readOnly
                  value="Pakistan"
                  style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', borderColor: '#e2e8f0' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--stone)', fontSize: '0.95rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--onyx)', fontWeight: '600', borderBottom: '1px solid var(--onyx)' }}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* Visual Side */}
      <div className="auth-visual">
        <img src={authBg} alt="Genius Tailors" className="auth-img" />
        <div className="auth-overlay">
          <Link to="/" className="auth-logo">GT</Link>
          <div className="auth-quote">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Bespoke Quality</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Create a profile to save your exact measurements and easily order custom-tailored garments to your door.</p>
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
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
        }

        .auth-form-container {
          max-width: 400px;
          margin: 0 auto;
          width: 100%;
        }

        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--onyx);
        }

        .form-input {
          padding: 0.85rem 1rem;
          border: 1px solid var(--ivory-border);
          border-radius: 4px;
          font-family: inherit;
          font-size: 1rem;
          background: white;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--onyx);
        }

        @media (min-width: 900px) {
          .auth-visual {
            display: flex;
          }
        }

        @media (max-width: 899px) {
          .auth-logo-mobile {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
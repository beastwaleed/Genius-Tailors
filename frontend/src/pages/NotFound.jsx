import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0a0a0a',
        color: '#fdfbf7',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '8rem',
          margin: 0,
          background: 'linear-gradient(45deg, #ffd700, #ffaa00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1
        }}>404</h1>
        
        <h2 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '1.5rem', fontWeight: 300 }}>
          Oops! This fabric is out of stock.
        </h2>
        
        <p style={{ color: '#aaa', maxWidth: '500px', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          We can't seem to find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable. Let's get you back to the perfect fit.
        </p>

        <Link to="/" style={{
          background: '#ffd700',
          color: '#0a0a0a',
          padding: '14px 32px',
          borderRadius: '50px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1.1rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Return to Homepage
        </Link>
      </div>
      <Footer />
    </>
  );
}

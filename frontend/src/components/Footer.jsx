import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link">
              <img
                src={logo}
                alt="Genius Tailors"
                className="footer-logo-img"
              />
            </Link>
            <p className="footer-tagline">
              Hyderabad's finest bespoke tailoring —<br />
              crafted with care since 1992.
            </p>
            <p className="footer-contact">📞 0333-2662110 / 0324-3041248</p>
            <p className="footer-contact">📍 Hyderabad, Sindh, Pakistan</p>
          </div>

          {/* Links */}
          <div className="footer-links">
            <div className="footer-col">
              <h4 className="footer-col-title">Services</h4>
              <Link to="/services">Kameez Shalwar</Link>
              <Link to="/services">Kurta Shalwar</Link>
              <Link to="/services">Kurta Pajama</Link>
              <Link to="/services">Waistcoat</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Quick Links</h4>
              <Link to="/about">About Us</Link>
              <Link to="/portfolio">Our Portfolio</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-conditions">Terms & Conditions</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">My Account</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/my-orders">My Orders</Link>
              <Link to="/measurements">Measurements</Link>
              <Link to="/loyalty">Loyalty Points</Link>
              <Link to="/profile">Profile</Link>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Genius Tailors, Hyderabad. All rights reserved.</p>
          <div className="footer-bottom-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="https://www.facebook.com/Geniustailorspk" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: 'var(--stone)', transition: 'color 0.2s', display: 'flex' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--ivory)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--stone)'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://www.instagram.com/geniustailors/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--stone)', transition: 'color 0.2s', display: 'flex' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--ivory)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--stone)'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.youtube.com/geniustailors" target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ color: 'var(--stone)', transition: 'color 0.2s', display: 'flex' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--ivory)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--stone)'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

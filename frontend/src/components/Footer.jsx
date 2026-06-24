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
            <p className="footer-contact">📞 0333-2662110</p>
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
              <Link to="/register">Register</Link>
              <Link to="/login">Sign In</Link>
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
          <p className="footer-bottom-right">Made with ❤️ in Hyderabad, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}

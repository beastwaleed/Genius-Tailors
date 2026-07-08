import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <img src={logo} alt="Genius Tailors" className="navbar-logo-img" />
            </Link>

            {/* Desktop Nav Links */}
            <div className="navbar-links">
              <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>Home</Link>
              <Link to="/services" className={`nav-link ${isActive('/services') ? 'nav-link-active' : ''}`}>Services</Link>
              <Link to="/portfolio" className={`nav-link ${isActive('/portfolio') ? 'nav-link-active' : ''}`}>Portfolio</Link>
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'nav-link-active' : ''}`}>About</Link>
              <Link to="/blogs" className={`nav-link ${isActive('/blogs') ? 'nav-link-active' : ''}`}>Journal</Link>
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'nav-link-active' : ''}`}>Contact</Link>
              <Link to="/track" className={`nav-link ${isActive('/track') ? 'nav-link-active' : ''}`} style={{ color: 'var(--gold)', fontWeight: 600 }}>Track Order</Link>



              {isAdmin && (
                <>
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}>Dashboard</Link>
                  <Link to="/admin/orders" className={`nav-link ${isActive('/admin/orders') ? 'nav-link-active' : ''}`}>Orders</Link>
                  <Link to="/admin/queue" className={`nav-link ${isActive('/admin/queue') ? 'nav-link-active' : ''}`}>Queue</Link>
                  <Link to="/admin/customers" className={`nav-link ${isActive('/admin/customers') ? 'nav-link-active' : ''}`}>Customers</Link>
                </>
              )}
            </div>

            {/* Right Actions */}
            <div className="navbar-actions">
              {isLoggedIn ? (
                <div className="nav-user" style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="nav-user-info"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <span className="nav-avatar">{user?.name?.[0]?.toUpperCase()}</span>
                    <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
                    {!isAdmin && user?.membershipLevel && (
                      <span className={`badge badge-${user.membershipLevel.toLowerCase()}`}>
                        {user.membershipLevel}
                      </span>
                    )}
                    {isAdmin && <span className="badge badge-admin">Admin</span>}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '0.5rem' }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="user-dropdown">
                      {!isAdmin && (
                        <>
                          <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                          <Link to="/my-orders" className="dropdown-item">My Orders</Link>
                          <Link to="/measurements" className="dropdown-item">Measurements</Link>
                          <Link to="/loyalty" className="dropdown-item">Loyalty Points</Link>
                        </>
                      )}
                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item">Admin Dashboard</Link>
                      )}
                    </div>
                  )}

                  <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="nav-auth">
                  <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-links">
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/services" className="mobile-link">Services</Link>
          <Link to="/portfolio" className="mobile-link">Portfolio</Link>
          <Link to="/about" className="mobile-link">About</Link>
          <Link to="/blogs" className="mobile-link">Journal</Link>
          <Link to="/contact" className="mobile-link">Contact</Link>
          <Link to="/track" className="mobile-link" style={{ color: 'var(--gold)', fontWeight: 600 }}>Track Order</Link>

          {isLoggedIn && !isAdmin && (
            <>
              <Link to="/dashboard" className="mobile-link">Dashboard</Link>
              <Link to="/my-orders" className="mobile-link">My Orders</Link>
              <Link to="/loyalty" className="mobile-link">Loyalty Points</Link>
              <Link to="/measurements" className="mobile-link">Measurements</Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin" className="mobile-link">Dashboard</Link>
              <Link to="/admin/orders" className="mobile-link">All Orders</Link>
              <Link to="/admin/queue" className="mobile-link">Priority Queue</Link>
              <Link to="/admin/services" className="mobile-link">Services</Link>
              <Link to="/admin/seasons" className="mobile-link">Seasons</Link>
              <Link to="/admin/customers" className="mobile-link">Customers</Link>
            </>
          )}

          <div className="mobile-menu-footer">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%' }}>
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

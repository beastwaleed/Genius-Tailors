import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerLayout({ children, title }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar toggle state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minimized, setMinimized] = useState(() => {
    return localStorage.getItem('gt_sidebar_min') === 'true';
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      const newVal = !minimized;
      setMinimized(newVal);
      localStorage.setItem('gt_sidebar_min', newVal);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Icons = {
    Dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    Orders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    Measurements: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>,
    Loyalty: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    Reviews: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    Profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  };

  const SidebarLink = ({ to, icon, label, onClick }) => {
    const isActive = location.pathname === to;
    if (onClick) {
      return (
        <button onClick={() => { onClick(); if(isMobile) setMobileOpen(false); }} className="luxury-sidebar-link" title={minimized && !isMobile ? label : ''}>
          <span className="luxury-icon">{icon}</span>
          <span className={`luxury-label ${minimized && !isMobile ? 'hide' : ''}`}>{label}</span>
        </button>
      );
    }
    return (
      <Link to={to} onClick={() => { if(isMobile) setMobileOpen(false); }} className={`luxury-sidebar-link ${isActive ? 'active' : ''}`} title={minimized && !isMobile ? label : ''}>
        <span className="luxury-icon">{icon}</span>
        <span className={`luxury-label ${minimized && !isMobile ? 'hide' : ''}`}>{label}</span>
      </Link>
    );
  };

  return (
    <div className="luxury-dashboard-layout">
      {isMobile && mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`luxury-sidebar ${!isMobile && minimized ? 'minimized' : ''} ${isMobile && mobileOpen ? 'mobile-open' : ''}`}>
        <div className="luxury-sidebar-header">
          {(!minimized || isMobile) && (
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--onyx)' }}>
              <h2>GENIUS TAILORS</h2>
            </Link>
          )}
        </div>
        <nav className="luxury-sidebar-nav">
          <SidebarLink to="/dashboard" icon={Icons.Dashboard} label="Dashboard" />
          <SidebarLink to="/my-orders" icon={Icons.Orders} label="My Orders" />
          <SidebarLink to="/measurements" icon={Icons.Measurements} label="Measurements" />
          <SidebarLink to="/loyalty" icon={Icons.Loyalty} label="Loyalty" />
          <SidebarLink to="/reviews" icon={Icons.Reviews} label="Reviews" />
          <SidebarLink to="/profile" icon={Icons.Profile} label="Profile" />

          <div style={{ flex: 1 }} />
          <SidebarLink onClick={handleLogout} icon={Icons.Logout} label="Logout" />
        </nav>
      </aside>

      {/* Main Area */}
      <main className="luxury-main">
        {/* Header */}
        <header className="luxury-main-header" style={{ justifyContent: 'space-between' }}>
          <div className="luxury-header-left">
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
            <span className="luxury-header-title">{title || 'Customer Dashboard'}</span>
          </div>
          <Link to="/" className="luxury-btn-home">
            Back to Home
          </Link>
        </header>

        {/* Content Scrollable Area */}
        <div className="luxury-workspace">
          {children}
        </div>
      </main>

      <style>{`
        .luxury-dashboard-layout {
          display: flex;
          height: 100vh;
          background-color: var(--ivory);
          font-family: var(--font-sans);
          overflow: hidden;
        }

        .luxury-sidebar {
          width: 260px;
          background-color: #ffffff;
          border-right: 1px solid var(--ivory-border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
        }

        .luxury-sidebar.minimized {
          width: 80px;
        }

        .luxury-sidebar-header {
          height: 72px;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--ivory-border);
          white-space: nowrap;
          overflow: hidden;
        }

        .luxury-sidebar.minimized .luxury-sidebar-header {
          padding: 0;
          justify-content: center;
        }

        .luxury-sidebar-header h2 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin: 0;
          letter-spacing: 1px;
          color: var(--onyx);
        }

        .luxury-sidebar-nav {
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .luxury-sidebar-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--stone);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 400;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          width: 100%;
          white-space: nowrap;
        }

        .luxury-sidebar.minimized .luxury-sidebar-link {
          padding: 0.875rem;
          justify-content: center;
        }

        .luxury-sidebar-link:hover {
          background-color: var(--ivory-dark);
          color: var(--onyx);
        }

        .luxury-sidebar-link.active {
          background-color: var(--onyx);
          color: var(--ivory);
        }

        .luxury-icon {
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
        }

        .luxury-label {
          transition: opacity 0.2s ease;
        }

        .luxury-label.hide {
          opacity: 0;
          width: 0;
          display: none;
        }

        .luxury-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background-color: var(--ivory);
        }

        .luxury-main-header {
          height: 72px;
          border-bottom: 1px solid var(--ivory-border);
          display: flex;
          align-items: center;
          padding: 0 2rem;
          background-color: #ffffff;
          flex-shrink: 0;
        }

        .luxury-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sidebar-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--stone);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .sidebar-toggle-btn:hover {
          background: var(--ivory-dark);
          color: var(--onyx);
        }

        .luxury-header-title {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--onyx);
          letter-spacing: 0.5px;
        }

        .luxury-btn-home {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--onyx);
          text-decoration: none;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .luxury-btn-home:hover {
          background: var(--ivory-dark);
          border-color: var(--onyx);
        }

        .luxury-workspace {
          flex: 1;
          padding: 3rem;
          overflow-y: auto;
        }

        .luxury-workspace-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .luxury-sidebar {
            position: fixed;
            left: -280px;
            height: 100vh;
            width: 280px;
            box-shadow: 4px 0 24px rgba(0,0,0,0.1);
          }
          .luxury-sidebar.mobile-open {
            left: 0;
          }
          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 5;
            animation: fadeIn 0.3s ease;
          }
          .luxury-main-header {
            padding: 0 1rem;
          }
          .luxury-workspace {
            padding: 1.5rem 1rem;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

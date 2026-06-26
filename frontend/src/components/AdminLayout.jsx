import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children, title }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [minimized, setMinimized] = useState(() => {
    return localStorage.getItem('gt_admin_sidebar_min') === 'true';
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
      localStorage.setItem('gt_admin_sidebar_min', newVal);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Icons = {
    Dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    Orders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    Queue: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
    Services: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Seasons: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
    Customers: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Fabrics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    Marketing: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>,
    Carts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
    Logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  };

  const SidebarLink = ({ to, icon, label, onClick }) => {
    const isActive = location.pathname === to;
    if (onClick) {
      return (
        <button onClick={() => { onClick(); if(isMobile) setMobileOpen(false); }} className="admin-sidebar-link" title={minimized && !isMobile ? label : ''}>
          <span className="admin-icon">{icon}</span>
          <span className={`admin-label ${minimized && !isMobile ? 'hide' : ''}`}>{label}</span>
        </button>
      );
    }
    return (
      <Link to={to} onClick={() => { if(isMobile) setMobileOpen(false); }} className={`admin-sidebar-link ${isActive ? 'active' : ''}`} title={minimized && !isMobile ? label : ''}>
        <span className="admin-icon">{icon}</span>
        <span className={`admin-label ${minimized && !isMobile ? 'hide' : ''}`}>{label}</span>
      </Link>
    );
  };

  return (
    <div className="admin-dashboard-layout">
      {isMobile && mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      {/* Admin Sidebar (Darker Theme) */}
      <aside className={`admin-sidebar ${!isMobile && minimized ? 'minimized' : ''} ${isMobile && mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          {(!minimized || isMobile) && (
            <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
              <h2>GT ADMIN</h2>
            </Link>
          )}
        </div>
        <nav className="admin-sidebar-nav">
          <SidebarLink to="/admin" icon={Icons.Dashboard} label="Dashboard" />
          <SidebarLink to="/admin/orders" icon={Icons.Orders} label="All Orders" />
          <SidebarLink to="/admin/queue" icon={Icons.Queue} label="Priority Queue" />
          <SidebarLink to="/admin/services" icon={Icons.Services} label="Services" />
          <SidebarLink to="/admin/seasons" icon={Icons.Seasons} label="Season Config" />
          <SidebarLink to="/admin/customers" icon={Icons.Customers} label="Customers" />
          <SidebarLink to="/admin/fabrics" icon={Icons.Fabrics} label="Fabrics" />
          <SidebarLink to="/admin/marketing" icon={Icons.Marketing} label="Marketing" />
          <SidebarLink to="/admin/abandoned-carts" icon={Icons.Carts} label="Abandoned Carts" />
          
          <div style={{ flex: 1 }} />
          <div style={{ marginBottom: '4rem' }}>
            <SidebarLink onClick={handleLogout} icon={Icons.Logout} label="Logout" />
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-main-header" style={{ justifyContent: 'space-between' }}>
          <div className="admin-header-left">
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
            <span className="admin-header-title">{title || 'Admin Panel'}</span>
          </div>
          <Link to="/" className="admin-btn-home">
            Back to Home
          </Link>
        </header>

        <div className="admin-workspace">
          {children}
        </div>
      </main>

      <style>{`
        .admin-dashboard-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          max-width: 100%;
          background-color: #f3f4f6; /* slightly cooler gray for admin */
          font-family: var(--font-sans);
          overflow: hidden;
        }

        .admin-sidebar {
          width: 260px;
          background-color: #111827; /* Dark background for admin sidebar */
          color: #fff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
        }

        .admin-sidebar.minimized {
          width: 80px;
        }

        .admin-sidebar-header {
          height: 72px;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
          overflow: hidden;
        }

        .admin-sidebar.minimized .admin-sidebar-header {
          padding: 0;
          justify-content: center;
        }

        .admin-sidebar-header h2 {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 1.25rem;
          margin: 0;
          letter-spacing: 2px;
          color: #fff;
        }

        .admin-sidebar-nav {
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .admin-sidebar-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-sm);
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          width: 100%;
          white-space: nowrap;
        }

        .admin-sidebar.minimized .admin-sidebar-link {
          padding: 0.875rem;
          justify-content: center;
        }

        .admin-sidebar-link:hover {
          background-color: rgba(255,255,255,0.05);
          color: #f3f4f6;
        }

        .admin-sidebar-link.active {
          background-color: #3b82f6; /* Blue accent for admin active state */
          color: #ffffff;
        }

        .admin-icon {
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
        }

        .admin-label {
          transition: opacity 0.2s ease;
        }

        .admin-label.hide {
          opacity: 0;
          width: 0;
          display: none;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          max-width: 100%;
          overflow: hidden;
        }

        .admin-main-header {
          height: 72px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          padding: 0 2rem;
          background-color: #ffffff;
          flex-shrink: 0;
        }

        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sidebar-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .sidebar-toggle-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .admin-header-title {
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 1.1rem;
          color: #111827;
        }

        .admin-btn-home {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          border: 1px solid #d1d5db;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }

        .admin-btn-home:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .admin-workspace {
          flex: 1;
          padding: 2.5rem;
          overflow-y: auto;
          overflow-x: hidden;
          width: 100%;
        }

        /* Generic Admin Component Utilities */
        .admin-section-title {
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 1.5rem;
          color: #111827;
          margin-bottom: 1.5rem;
        }

        .admin-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: var(--radius-md);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .admin-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          max-width: 100%;
        }

        .admin-table {
          width: 100%;
          min-width: 800px;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .admin-table th {
          background-color: #f9fafb;
          color: #4b5563;
          font-weight: 600;
          text-align: left;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .admin-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
        }

        .admin-table tr:hover {
          background-color: #f9fafb;
        }

        .admin-btn-primary {
          background: #3b82f6;
          color: #ffffff;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-btn-primary:hover {
          background: #2563eb;
        }

        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed;
            left: -280px;
            height: 100vh;
            width: 280px;
            box-shadow: 4px 0 24px rgba(0,0,0,0.2);
          }
          .admin-sidebar.mobile-open {
            left: 0;
          }
          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 5;
            animation: fadeIn 0.3s ease;
          }
          .admin-main-header {
            padding: 0 1rem;
          }
          .admin-workspace {
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

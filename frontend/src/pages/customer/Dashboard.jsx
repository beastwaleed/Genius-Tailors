import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import CustomerLayout from '../../components/CustomerLayout';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
    fetchLatestProfile();
  }, []);

  const fetchLatestProfile = async () => {
    try {
      const { data } = await api.get('/api/profile');
      updateUser(data);
    } catch (err) {
      console.error('Failed to sync latest profile stats', err);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const { data } = await api.get('/api/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const activeOrdersCount = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;

  return (
    <CustomerLayout title="Dashboard Overview">
      <div className="premium-dashboard">
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Here is a summary of your recent orders and tailoring rewards.</p>
        </div>

        {/* Metric Cards */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
          <div className="admin-stat-card">
            <span className="stat-label">Total Orders</span>
            <span className="stat-val">{orders.length}</span>
          </div>

          <div className="admin-stat-card">
            <span className="stat-label">Active Orders</span>
            <span className="stat-val" style={{ color: '#2563eb' }}>{activeOrdersCount}</span>
          </div>

          <div className="admin-stat-card">
            <span className="stat-label">Loyalty Points</span>
            <span className="stat-val" style={{ color: '#d97706' }}>{user?.loyaltyPoints || 0} pts</span>
          </div>
        </div>

        {/* Recent Orders List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 className="premium-title" style={{ margin: 0, fontSize: '1rem' }}>Recent Orders</h2>
            {orders.length > 0 && (
              <Link to="/my-orders" className="premium-link">
                View All Orders →
              </Link>
            )}
          </div>

          <div className="admin-table-container">
            {loading ? (
              <p style={{ padding: '2rem', color: '#64748b', textAlign: 'center', margin: 0 }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>You haven't placed any orders yet.</p>
                <Link to="/services" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px' }}>Start an Online Order</Link>
              </div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Service Garment</th>
                    <th>Date</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(order => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{order.serviceName}</td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>Rs. {order.totalPrice.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/my-orders/${order._id}`} className="premium-link" style={{ fontSize: '0.825rem' }}>Details &rarr;</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .luxury-welcome {
          margin-bottom: 3rem;
        }

        .luxury-welcome h1 {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--onyx);
          margin: 0;
          letter-spacing: -0.5px;
        }

        .luxury-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .luxury-metric-card {
          background: #ffffff;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }

        .luxury-metric-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 3px;
          background: var(--onyx);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .luxury-metric-card:hover::after {
          transform: scaleX(1);
        }

        .luxury-metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .luxury-metric-header h3 {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--stone);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .metric-icon {
          font-size: 1.25rem;
          opacity: 0.5;
        }

        .luxury-metric-value {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--onyx);
          line-height: 1;
        }

        .luxury-section {
          margin-bottom: 4rem;
        }

        .luxury-section-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          color: var(--onyx);
          margin-bottom: 1.5rem;
        }

        .luxury-card {
          background: #ffffff;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .luxury-table {
          display: flex;
          flex-direction: column;
        }

        .luxury-table-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--ivory-border);
          transition: background 0.2s ease;
        }
        
        .luxury-table-row:hover {
          background: var(--ivory-dark);
        }

        .luxury-table-row:last-child {
          border-bottom: none;
        }

        .luxury-table-cell {
          flex: 1;
        }

        .main-cell h4 {
          margin: 0 0 0.25rem;
          color: var(--onyx);
          font-weight: 500;
          font-size: 1.05rem;
        }

        .subtext {
          font-size: 0.85rem;
          color: var(--stone);
        }

        .price {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--onyx);
        }

        .align-right {
          text-align: right;
        }

        .luxury-badge {
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .badge-pending { background: #f5f1ea; color: var(--stone); }
        .badge-cutting { background: #e8f0fe; color: #1a73e8; }
        .badge-stitching { background: #fff8e1; color: #f57f17; }
        .badge-ready { background: #e6f4ea; color: #137333; }
        .badge-delivered { background: #f1f3f4; color: #5f6368; }

        .luxury-btn-primary {
          background: var(--onyx);
          color: #ffffff;
          padding: 0.875rem 2rem;
          border-radius: var(--radius-sm);
          border: none;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s ease;
        }

        .luxury-btn-primary:hover {
          background: var(--charcoal);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 1024px) {
          .luxury-metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 600px) {
          .luxury-welcome h1 {
            font-size: 1.75rem;
          }
          .luxury-metrics-grid {
            grid-template-columns: 1fr;
          }
          .luxury-table-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1.25rem 1rem;
          }
          .align-right {
            text-align: left;
            width: 100%;
          }
          .luxury-table-cell {
            width: 100%;
          }
        }
      `}</style>
    </CustomerLayout>
  );
}
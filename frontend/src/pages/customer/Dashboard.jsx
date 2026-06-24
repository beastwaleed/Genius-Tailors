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
      <div className="luxury-workspace-inner">
        <div className="luxury-welcome">
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
        </div>

        {/* Metric Cards */}
        <div className="luxury-metrics-grid">
          <div className="luxury-metric-card">
            <div className="luxury-metric-header">
              <h3>Total Orders</h3>
              <span className="metric-icon">🛍️</span>
            </div>
            <div className="luxury-metric-value">{orders.length}</div>
          </div>

          <div className="luxury-metric-card">
            <div className="luxury-metric-header">
              <h3>Active Orders</h3>
              <span className="metric-icon">⏳</span>
            </div>
            <div className="luxury-metric-value">{activeOrdersCount}</div>
          </div>

          <div className="luxury-metric-card">
            <div className="luxury-metric-header">
              <h3>Loyalty Points</h3>
              <span className="metric-icon">✧</span>
            </div>
            <div className="luxury-metric-value">{user?.loyaltyPoints || 0}</div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="luxury-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <h2 className="luxury-section-title" style={{ marginBottom: 0 }}>Recent Orders</h2>
            {orders.length > 0 && (
              <Link to="/my-orders" style={{ color: 'var(--stone)', textDecoration: 'none', fontSize: '0.9rem' }}>
                View All →
              </Link>
            )}
          </div>

          <div className="luxury-card">
            {loading ? (
              <p style={{ padding: '3rem', color: 'var(--stone)', textAlign: 'center' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--stone)', marginBottom: '1.5rem' }}>You haven't placed any orders yet.</p>
                <Link to="/services" className="luxury-btn-primary">Start a Online Order</Link>
              </div>
            ) : (
              <div className="luxury-table">
                {orders.slice(0, 5).map(order => (
                  <div key={order._id} className="luxury-table-row">
                    <div className="luxury-table-cell main-cell">
                      <h4>{order.serviceName}</h4>
                      <span className="subtext">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="luxury-table-cell">
                      <span className="price">Rs. {order.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="luxury-table-cell align-right">
                      <span className={`luxury-badge badge-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
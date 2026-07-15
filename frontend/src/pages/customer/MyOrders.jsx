import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import CustomerLayout from '../../components/CustomerLayout';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

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

  const STATUS_STEPS = ['Pending', 'Cutting', 'Stitching', 'Ready', 'Delivered'];

  const getStatusProgress = (status) => {
    if (status === 'Cancelled') return 0;
    const index = STATUS_STEPS.indexOf(status);
    return index >= 0 ? (index / (STATUS_STEPS.length - 1)) * 100 : 0;
  };

  return (
    <CustomerLayout title="My Orders">
      <div className="orders-page-container">
        <div className="orders-header">
          <div>
            <h2 className="orders-title">Order History</h2>
            <p className="orders-subtitle">Track your bespoke creations in real-time.</p>
          </div>
          {orders.length > 0 && (
            <Link to="/services" className="btn btn-gold new-order-btn">
              <span className="plus-icon">+</span> Place New Order
            </Link>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching your tailoring history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-state">
            <div className="empty-icon-wrapper">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="empty-icon">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3>Your wardrobe awaits</h3>
            <p>You haven't placed any custom orders yet. Start building your perfect fit today.</p>
            <Link to="/services" className="btn btn-gold start-order-btn">Start an Online Order</Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card-premium">
                <div className="order-card-header">
                  <div className="order-brand-label">Genius Tailors</div>
                  <div className={`status-badge-premium ${order.status.toLowerCase()}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-card-body">
                  <h3 className="order-service-name">{order.serviceName}</h3>
                  <div className="order-meta">
                    <span className="order-date">Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="order-price">Rs. {order.totalPrice.toLocaleString()}</span>
                  </div>
                  
                  {order.isRush && <div className="rush-tag">⚡ Rush Delivery</div>}
                  {order.isPriority && <div className="priority-tag">⭐ Priority Gold</div>}

                  {order.trackingNumber && (
                    <div style={{ marginTop: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>PostEx:</span>
                      <span style={{ fontSize: '0.85rem', color: '#C9A96E', fontWeight: 600 }}>
                        {order.trackingNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.25rem' }}>(Click View Details for live tracking)</span>
                    </div>
                  )}

                  {order.status !== 'Cancelled' && (
                    <div className="status-progress-wrapper">
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${getStatusProgress(order.status)}%` }}
                        ></div>
                      </div>
                      <div className="progress-labels">
                        <span>Pending</span>
                        <span>Stitching</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <span className="order-id-label">{order.orderNumber || order._id}</span>
                  <Link to={`/my-orders/${order._id}`} className="view-details-link">
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .orders-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          border-bottom: 1px solid rgba(201, 169, 110, 0.2);
          padding-bottom: 1.5rem;
        }

        .orders-title {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--onyx);
          margin-bottom: 0.5rem;
        }

        .orders-subtitle {
          color: var(--stone);
          font-size: 1rem;
        }

        .new-order-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-weight: 500;
          box-shadow: 0 4px 15px rgba(201, 169, 110, 0.3);
        }

        .plus-icon {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .order-card-premium {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .order-card-premium:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(201, 169, 110, 0.15);
          border-color: rgba(201, 169, 110, 0.3);
        }

        .order-card-header {
          background: linear-gradient(135deg, var(--onyx), #2a2a2a);
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-brand-label {
          color: #C9A96E;
          font-family: var(--font-serif);
          font-size: 0.9rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .status-badge-premium {
          padding: 0.35rem 1rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .status-badge-premium.pending { background: rgba(255,255,255,0.1); color: #fff; }
        .status-badge-premium.cutting { background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid #3498db; }
        .status-badge-premium.stitching { background: rgba(155, 89, 182, 0.2); color: #9b59b6; border: 1px solid #9b59b6; }
        .status-badge-premium.ready { background: rgba(241, 196, 15, 0.2); color: #f1c40f; border: 1px solid #f1c40f; }
        .status-badge-premium.delivered { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid #2ecc71; }
        .status-badge-premium.cancelled { background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid #e74c3c; }

        .order-card-body {
          padding: 1.5rem;
          flex-grow: 1;
        }

        .order-service-name {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: var(--onyx);
          margin-bottom: 0.75rem;
        }

        .order-meta {
          display: flex;
          justify-content: space-between;
          color: var(--stone);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .order-price {
          font-weight: 600;
          color: var(--gold);
        }

        .rush-tag, .priority-tag {
          display: inline-block;
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          margin-right: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .rush-tag { background: #fff3cd; color: #856404; }
        .priority-tag { background: #fcf6e8; color: #C9A96E; border: 1px solid #C9A96E; }

        .status-progress-wrapper {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed rgba(0,0,0,0.1);
        }

        .progress-bar-bg {
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #C9A96E, #e0c694);
          border-radius: 10px;
          transition: width 1s ease-in-out;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .order-card-footer {
          padding: 1.25rem 1.5rem;
          background: #fcfcfc;
          border-top: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-id-label {
          font-family: monospace;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .view-details-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--onyx);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .view-details-link:hover {
          color: var(--gold);
        }

        .view-details-link svg {
          transition: transform 0.2s;
        }

        .view-details-link:hover svg {
          transform: translateX(4px);
        }

        .empty-orders-state {
          text-align: center;
          padding: 6rem 2rem;
          background: #fff;
          border-radius: 16px;
          border: 1px dashed rgba(201, 169, 110, 0.4);
        }

        .empty-icon-wrapper {
          width: 100px;
          height: 100px;
          background: #fdfbf7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: var(--gold);
        }

        .empty-orders-state h3 {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: var(--onyx);
          margin-bottom: 1rem;
        }

        .empty-orders-state p {
          color: var(--stone);
          max-width: 400px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .start-order-btn {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem;
          color: var(--stone);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(201, 169, 110, 0.2);
          border-radius: 50%;
          border-top-color: var(--gold);
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .orders-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .orders-page-container {
            padding: 1rem;
          }
        }
      `}</style>
    </CustomerLayout>
  );
}

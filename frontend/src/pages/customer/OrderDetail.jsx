import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import CustomerLayout from '../../components/CustomerLayout';
import { toast } from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/api/orders/${id}`);
      setOrder(data);
      if (data.trackingNumber) {
        api.get(`/api/orders/${id}/tracking`)
          .then(res => {
            setTrackingHistory(res.data.history || []);
            setTrackingLoading(false);
          })
          .catch(() => setTrackingLoading(false));
      } else {
        setTrackingLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch order', error);
      toast.error('Could not load order details.');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setActionLoading(true);
    try {
      await api.put(`/api/orders/${id}/cancel`);
      toast.success('Order cancelled successfully.');
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!window.confirm('Would you like to duplicate this exact order (same service, style, and measurements)?')) return;
    
    setActionLoading(true);
    try {
      const { data } = await api.post(`/api/orders/${id}/reorder`);
      toast.success('Reorder successful! Redirecting...');
      navigate(`/my-orders/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to duplicate order.');
    } finally {
      setActionLoading(false);
    }
  };

  const STATUS_STEPS = ['Pending', 'Cutting', 'Stitching', 'Ready', 'Delivered'];

  const getStatusProgress = (status) => {
    if (status === 'Cancelled') return 0;
    const index = STATUS_STEPS.indexOf(status);
    return index >= 0 ? (index / (STATUS_STEPS.length - 1)) * 100 : 0;
  };

  if (loading) {
    return (
      <CustomerLayout title="Order Details">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div className="spinner"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) return null;

  return (
    <CustomerLayout title="Order Details">
      <div className="order-detail-container">
        {/* Header */}
        <div className="order-detail-header">
          <div>
            <Link to="/my-orders" className="back-link">← Back to Orders</Link>
            <h2 className="detail-title">{order.serviceName}</h2>
            <p className="detail-subtitle">{order.orderNumber || order._id}</p>
          </div>
          <div className={`status-badge-large ${order.status.toLowerCase()}`}>
            {order.status}
          </div>
        </div>

        {/* Status Timeline */}
        {order.status !== 'Cancelled' && (
          <div className="luxury-card status-card">
            <h3>Order Progress</h3>
            <div className="status-progress-wrapper-large">
              <div className="progress-bar-bg-large">
                <div 
                  className="progress-bar-fill-large" 
                  style={{ width: `${getStatusProgress(order.status)}%` }}
                ></div>
              </div>
              <div className="progress-labels-large">
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = STATUS_STEPS.indexOf(order.status) >= idx;
                  return (
                    <span key={step} className={isActive ? 'active-step' : ''}>
                      {step}
                    </span>
                  );
                })}
              </div>
            </div>
            {order.estimatedDelivery && (
              <p className="estimated-delivery">
                <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}
              </p>
            )}

            {/* PostEx Live Tracking Timeline */}
            {order.trackingNumber && (
              <div className="postex-tracking-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <h4 style={{ marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-serif)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  Live Courier Tracking
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Tracking #: <strong>{order.trackingNumber}</strong></p>
                
                {trackingLoading ? (
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Fetching live timeline...</p>
                ) : trackingHistory.length > 0 ? (
                  <div className="tracking-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {trackingHistory.map((event, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: '12px', height: '12px', borderRadius: '50%', background: idx === 0 ? '#C9A96E' : '#e2e8f0', marginTop: '4px', boxShadow: idx === 0 ? '0 0 0 4px rgba(201, 169, 110, 0.2)' : 'none' }}></div>
                        <div>
                          <p style={{ fontSize: '0.95rem', fontWeight: idx === 0 ? '600' : '500', color: idx === 0 ? '#1e293b' : '#64748b', margin: 0 }}>
                            {event.transactionStatusMessage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>No tracking events recorded by courier yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="order-details-grid">
          {/* Left Column */}
          <div className="details-col">
            <div className="luxury-card">
              <h3 className="card-section-title">Order Summary</h3>
              <div className="detail-row">
                <span className="label">Date Placed</span>
                <span className="val">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Base Service</span>
                <span className="val">{order.serviceName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Price</span>
                <span className="val price-val">Rs. {order.totalPrice.toLocaleString()}</span>
              </div>
              {(order.advancePaid > 0) && (
                <>
                  <div className="detail-row">
                    <span className="label" style={{ color: '#0284c7' }}>Advance Paid (Online)</span>
                    <span className="val" style={{ color: '#0284c7', fontWeight: 600 }}>- Rs. {order.advancePaid.toLocaleString()}</span>
                  </div>
                  <div className="detail-row" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                    <span className="label" style={{ color: '#0f172a', fontWeight: 600 }}>Remaining Balance (COD)</span>
                    <span className="val" style={{ color: '#0f172a', fontWeight: 700 }}>Rs. {order.remainingBalance.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="detail-row">
                <span className="label">Loyalty Points Earned</span>
                <span className="val" style={{ color: 'var(--gold)', fontWeight: 'bold' }}>+{order.pointsEarned} pts</span>
              </div>
              
              <div className="tags-container">
                {order.isRush && <span className="rush-tag">⚡ Rush Processing</span>}
                {order.isPriority && <span className="priority-tag">⭐ Priority Gold Member</span>}
                {order.season && <span className="season-tag">🍂 {order.season} Collection</span>}
              </div>
            </div>

            {order.customerNote && (
              <div className="luxury-card">
                <h3 className="card-section-title">Your Special Instructions</h3>
                <p className="note-text">"{order.customerNote}"</p>
              </div>
            )}

            {order.referenceImageUrl && (
              <div className="luxury-card">
                <h3 className="card-section-title">Reference Design</h3>
                <img src={order.referenceImageUrl} alt="Reference" className="reference-image" />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="details-col">
            <div className="luxury-card">
              <h3 className="card-section-title">Fabric Details</h3>
              <div className="detail-row">
                <span className="label">Fabric Source</span>
                <span className="val">{order.fabricSelection || 'Provide my own fabric'}</span>
              </div>
              {order.fabricSelection !== 'Provide my own fabric' && order.fabricColor && (
                <div className="detail-row">
                  <span className="label">Color Selected</span>
                  <span className="val" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', background: order.fabricColor, border: '1px solid #ccc' }}></span>
                    {order.fabricColor}
                  </span>
                </div>
              )}
            </div>

            <div className="luxury-card">
              <h3 className="card-section-title">Style Variations</h3>
              {order.styleVariations && Object.keys(order.styleVariations).length > 0 ? (
                <div className="meta-grid">
                  {Object.entries(order.styleVariations).map(([key, val]) => (
                    <div className="meta-item" key={key}>
                      <span className="meta-key">{key}</span>
                      <span className="meta-val">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">Standard Style Selected</p>
              )}
            </div>

            <div className="luxury-card">
              <h3 className="card-section-title">Measurement Snapshot</h3>
              <p className="snapshot-info">These exact measurements were used for this garment.</p>
              {order.measurementSnapshot && Object.keys(order.measurementSnapshot).length > 0 ? (
                <div className="meta-grid">
                  {Object.entries(order.measurementSnapshot.measurements || order.measurementSnapshot).map(([key, val]) => { if (typeof val === 'object' || val === null) return null; if (['_id', 'customer', 'profileName', 'createdAt', 'updatedAt', '__v'].includes(key)) return null; return ( <div className="meta-item measurement-item" key={key}> <span className="meta-key">{key}</span> <span className="meta-val">{val}"</span> </div> ); })}
                </div>
              ) : (
                <p className="no-data">No measurements provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="order-actions-footer">
          {order.status === 'Pending' && (
            <button 
              className="btn btn-outline-danger" 
              onClick={handleCancelOrder}
              disabled={actionLoading}
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {(order.status === 'Delivered' || order.status === 'Cancelled') && (
            <button 
              className="btn btn-gold" 
              onClick={handleReorder}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Clone & Reorder Exactly This'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .order-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: var(--font-sans);
        }

        .back-link {
          color: var(--stone);
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-block;
          margin-bottom: 1rem;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--onyx);
        }

        .order-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .detail-title {
          font-family: var(--font-serif);
          font-size: 2.5rem;
          color: var(--onyx);
          margin-bottom: 0.5rem;
        }

        .detail-subtitle {
          color: var(--stone);
          font-family: monospace;
          font-size: 1rem;
        }

        .status-badge-large {
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .status-badge-large.pending { background: rgba(0,0,0,0.05); color: var(--stone); }
        .status-badge-large.cutting { background: rgba(52, 152, 219, 0.1); color: #2980b9; border: 1px solid #3498db; }
        .status-badge-large.stitching { background: rgba(155, 89, 182, 0.1); color: #8e44ad; border: 1px solid #9b59b6; }
        .status-badge-large.ready { background: rgba(241, 196, 15, 0.1); color: #d35400; border: 1px solid #f39c12; }
        .status-badge-large.delivered { background: rgba(46, 204, 113, 0.1); color: #27ae60; border: 1px solid #2ecc71; }
        .status-badge-large.cancelled { background: rgba(231, 76, 60, 0.1); color: #c0392b; border: 1px solid #e74c3c; }

        .status-card {
          margin-bottom: 2rem;
          padding: 2rem !important;
        }

        .status-progress-wrapper-large {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .progress-bar-bg-large {
          height: 10px;
          background: #f1f5f9;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar-fill-large {
          height: 100%;
          background: linear-gradient(90deg, #C9A96E, #e0c694);
          border-radius: 20px;
          transition: width 1s ease-in-out;
        }

        .progress-labels-large {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .active-step {
          color: var(--onyx);
          font-weight: 700;
        }

        .estimated-delivery {
          text-align: right;
          color: var(--onyx);
          font-size: 0.95rem;
          padding-top: 1rem;
          border-top: 1px dashed rgba(0,0,0,0.1);
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .details-col {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .card-section-title {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: var(--onyx);
          border-bottom: 1px solid rgba(201, 169, 110, 0.2);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row:last-of-type {
          border-bottom: none;
        }

        .label {
          color: var(--stone);
          font-size: 0.95rem;
        }

        .val {
          color: var(--onyx);
          font-weight: 500;
        }

        .price-val {
          color: var(--gold);
          font-size: 1.1rem;
          font-weight: 700;
        }

        .tags-container {
          margin-top: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .rush-tag, .priority-tag, .season-tag {
          font-size: 0.75rem;
          padding: 0.35rem 0.85rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .rush-tag { background: #fff3cd; color: #856404; }
        .priority-tag { background: #fcf6e8; color: #C9A96E; border: 1px solid #C9A96E; }
        .season-tag { background: #eef2f6; color: #475569; }

        .note-text {
          font-style: italic;
          color: var(--stone);
          line-height: 1.6;
          padding: 1rem;
          background: #fdfbf7;
          border-left: 4px solid var(--gold);
        }

        .reference-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 8px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .meta-item {
          background: #fdfbf7;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(201, 169, 110, 0.1);
        }

        .measurement-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .meta-key {
          display: block;
          font-size: 0.8rem;
          color: var(--stone);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .meta-val {
          display: block;
          font-size: 1rem;
          color: var(--onyx);
          font-weight: 500;
        }

        .snapshot-info {
          font-size: 0.85rem;
          color: var(--stone);
          margin-bottom: 1.5rem;
        }

        .no-data {
          color: var(--stone);
          font-style: italic;
        }

        .order-actions-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 2rem;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        .btn-outline-danger {
          background: transparent;
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 0.75rem 2rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-danger:hover {
          background: #e74c3c;
          color: white;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(201, 169, 110, 0.2);
          border-radius: 50%;
          border-top-color: var(--gold);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .order-details-grid {
            grid-template-columns: 1fr;
          }
          .order-detail-header {
            flex-direction: column;
            gap: 1rem;
          }
          .progress-labels-large {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </CustomerLayout>
  );
}


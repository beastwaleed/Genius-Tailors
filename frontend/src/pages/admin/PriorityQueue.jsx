import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';

export default function PriorityQueue() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriorityOrders();
  }, []);

  const fetchPriorityOrders = async () => {
    try {
      const { data } = await api.get('/api/orders');
      // Filter only expedited orders that are not delivered/cancelled
      const expedited = data.filter(o => o.priorityStatus === 'Expedited' && !['Delivered', 'Cancelled'].includes(o.status));
      setOrders(expedited);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Priority Queue">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="admin-section-title" style={{ marginBottom: '0.5rem' }}>Active Priority Queue</h2>
        <p style={{ color: '#6b7280' }}>These orders have requested expedited service and need immediate attention.</p>
      </div>
      
      {loading ? (
        <p>Loading queue...</p>
      ) : (
        <div className="admin-card admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Current Status</th>
                <th>Deadline Warning</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order._id} style={{ backgroundColor: '#fff5f5' }}>
                    <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{order.orderNumber || `...${order._id.slice(-6)}`}</td>
                    <td style={{ fontWeight: 500 }}>{order.user?.name || 'Unknown'}</td>
                    <td>{order.serviceName}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>⚠️</span> Fast-Track
                      </span>
                    </td>
                    <td>
                      <button className="admin-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Process Fast</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉</div>
                    No priority orders currently in the queue!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-pending { background: #fef3c7; color: #d97706; }
        .status-cutting { background: #dbeafe; color: #2563eb; }
        .status-stitching { background: #fce7f3; color: #db2777; }
        .status-ready { background: #e0e7ff; color: #4f46e5; }
      `}</style>
    </AdminLayout>
  );
}

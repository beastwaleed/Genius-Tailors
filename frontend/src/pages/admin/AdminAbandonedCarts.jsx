import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      const { data } = await api.get('/api/abandoned-carts');
      setCarts(data);
    } catch (error) {
      toast.error('Failed to fetch abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/api/abandoned-carts/${id}/recover`, { status });
      setCarts(carts.map(c => c._id === id ? data : c));
      toast.success(`Marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSendRecovery = async (id, phone) => {
    try {
      await api.put(`/api/abandoned-carts/${id}/recover`, { messageSent: true, sendAutoMessage: true, phone });
      setCarts(carts.map(c => c._id === id ? { ...c, recoveryMessageSent: true } : c));
      
      if (phone) {
        toast.success("Recovery message auto-sent via WhatsApp API!");
      } else {
        toast.error("Cart marked as sent, but no phone number was found to deliver it.");
      }
    } catch (error) {
      toast.error('Failed to auto-send recovery message');
    }
  };

  const handleDeleteCart = async (id) => {
    if (!window.confirm('Are you sure you want to delete this abandoned cart?')) return;
    try {
      await api.delete(`/api/abandoned-carts/${id}`);
      setCarts(carts.filter(c => c._id !== id));
      toast.success('Abandoned cart deleted successfully');
    } catch (error) {
      toast.error('Failed to delete abandoned cart');
    }
  };

  const pendingCount = carts.filter(c => c.recoveryStatus === 'Pending').length;
  const recoveredCount = carts.filter(c => c.recoveryStatus === 'Recovered').length;
  const lostRevenue = carts.filter(c => c.recoveryStatus === 'Pending').reduce((sum, c) => sum + c.totalPrice, 0);

  return (
    <AdminLayout title="Abandoned Carts">
      <div className="premium-dashboard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="premium-title" style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Cart Recovery Engine</h2>
            <p style={{ color: '#64748b', margin: '0.2rem 0 0 0' }}>Track incomplete checkouts and recapture lost sales.</p>
          </div>
        </div>

        <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' }}>🛒</div>
            <div className="stat-info">
              <h4>Pending Carts</h4>
              <p className="stat-value">{pendingCount}</p>
            </div>
          </div>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' }}>✅</div>
            <div className="stat-info">
              <h4>Successfully Recovered</h4>
              <p className="stat-value">{recoveredCount}</p>
            </div>
          </div>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>💸</div>
            <div className="stat-info">
              <h4>Potential Revenue</h4>
              <p className="stat-value">Rs. {lostRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading data...</div>
        ) : (
          <div className="admin-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer Info</th>
                  <th>Garment & Value</th>
                  <th>Drop-off Point</th>
                  <th>Recovery Actions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {carts.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No abandoned carts found.</td></tr>
                ) : (
                  carts.map(cart => (
                    <tr key={cart._id} style={{ opacity: cart.recoveryStatus === 'Lost' ? 0.6 : 1 }}>
                      <td style={{ color: '#475569', fontWeight: 500 }}>
                        {new Date(cart.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br/>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(cart.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {cart.customer?.name || cart.customerName || 'Guest User'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                          {cart.customer?.phone || cart.customerPhone || 'No Phone'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{cart.serviceName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Rs. {cart.totalPrice.toLocaleString()}</div>
                      </td>
                      <td>
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {cart.dropoffStep}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleSendRecovery(cart._id, cart.customer?.phone || cart.customerPhone)}
                          style={{ 
                            background: cart.recoveryMessageSent ? '#f1f5f9' : '#1e293b', 
                            color: cart.recoveryMessageSent ? '#94a3b8' : 'white', 
                            border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '0.8rem'
                          }}
                        >
                          {cart.recoveryMessageSent ? 'Message Sent ✓' : 'Send WhatsApp'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select 
                            value={cart.recoveryStatus} 
                            onChange={(e) => handleUpdateStatus(cart._id, e.target.value)}
                            style={{
                              background: cart.recoveryStatus === 'Recovered' ? '#dcfce7' : (cart.recoveryStatus === 'Lost' ? '#fee2e2' : '#f1f5f9'),
                              color: cart.recoveryStatus === 'Recovered' ? '#166534' : (cart.recoveryStatus === 'Lost' ? '#991b1b' : '#475569'),
                              border: 'none', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontWeight: 700, outline: 'none', cursor: 'pointer', fontSize: '0.8rem'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Recovered">Recovered</option>
                            <option value="Lost">Lost</option>
                          </select>
                          <button 
                            onClick={() => handleDeleteCart(cart._id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem', fontSize: '1rem' }}
                            title="Delete Cart"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .premium-dashboard { animation: fadeUp 0.6s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
        
        .premium-stat-card {
          position: relative; background: linear-gradient(145deg, #0f172a, #1e293b); border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.25rem; padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease; color: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
        .premium-stat-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4); border-color: rgba(255, 255, 255, 0.1); }
        .stat-icon { width: 3.5rem; height: 3.5rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.1); }
        .stat-info h4 { margin: 0 0 0.25rem 0; font-size: 0.85rem; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { margin: 0; font-size: 1.75rem; font-weight: 800; background: linear-gradient(to right, #ffffff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .premium-table { width: 100%; min-width: 800px; border-collapse: separate; border-spacing: 0 0.75rem; font-size: 0.95rem; }
        .premium-table th { font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; border: none; padding: 1rem 1.5rem; text-align: left; }
        .premium-table tbody tr { background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .premium-table tbody tr:hover { transform: translateY(-2px) scale(1.005); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .premium-table td { padding: 1rem 1.5rem; border: none; background: transparent; vertical-align: middle; }
        .premium-table td:first-child { border-radius: 0.75rem 0 0 0.75rem; }
        .premium-table td:last-child { border-radius: 0 0.75rem 0.75rem 0; }
      `}</style>
    </AdminLayout>
  );
}

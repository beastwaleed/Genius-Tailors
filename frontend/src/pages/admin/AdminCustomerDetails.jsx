import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminCustomerDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tagging State
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  
  // Notes State
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchCRMProfile();
  }, [id]);

  const fetchCRMProfile = async () => {
    try {
      const response = await api.get(`/api/admin/crm/users/${id}`);
      setData(response.data);
      setTags(response.data.profile.tags || []);
      setAdminNotes(response.data.profile.adminNotes || '');
    } catch (error) {
      toast.error('Failed to fetch CRM profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag('');
    
    try {
      await api.put(`/api/admin/crm/users/${id}/tags`, { tags: updatedTags });
      toast.success('Tag added');
    } catch (error) {
      toast.error('Failed to save tag');
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    try {
      await api.put(`/api/admin/crm/users/${id}/tags`, { tags: updatedTags });
    } catch (error) {
      toast.error('Failed to remove tag');
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.put(`/api/admin/crm/users/${id}/notes`, { adminNotes });
      toast.success('Notes saved securely');
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Customer CRM">
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading 360° Profile...</div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const { profile, analytics, recentOrders } = data;

  return (
    <AdminLayout title={`CRM: ${profile.name}`}>
      <div className="premium-dashboard">
        
        {/* Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <Link to="/admin/customers" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              &larr; Back to Directory
            </Link>
            <h2 className="premium-title" style={{ margin: 0 }}>{profile.name}</h2>
            <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>{profile.email} • {profile.phone || 'No phone'}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ padding: '0.5rem 1rem', background: '#fef3c7', color: '#b45309', borderRadius: '2rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
              {profile.membershipLevel} Member
            </span>
          </div>
        </div>

        {/* 360 Analytics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="premium-stat-card">
            <h3 className="stat-title">Lifetime Value (LTV)</h3>
            <p className="stat-value" style={{ color: '#059669' }}>Rs. {analytics.totalSpent.toLocaleString()}</p>
          </div>
          <div className="premium-stat-card">
            <h3 className="stat-title">Average Order Value (AOV)</h3>
            <p className="stat-value">Rs. {analytics.averageOrderValue.toLocaleString()}</p>
          </div>
          <div className="premium-stat-card">
            <h3 className="stat-title">Total Orders</h3>
            <p className="stat-value">{analytics.orderCount}</p>
          </div>
          <div className="premium-stat-card">
            <h3 className="stat-title">Loyalty Points</h3>
            <p className="stat-value" style={{ color: '#d97706' }}>{profile.loyaltyPoints} pts</p>
          </div>
        </div>

        <div className="crm-grid">
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Tagging Engine */}
            <div className="premium-glass-card">
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🏷️ Customer Tags & Segmentation
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {tags.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No tags assigned yet.</span>}
                {tags.map(tag => (
                  <span key={tag} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}>&times;</button>
                  </span>
                ))}
              </div>
              
              <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Add a tag (e.g., VIP, Prefers Shalwar)" 
                  value={newTag} 
                  onChange={(e) => setNewTag(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
                />
                <button type="submit" className="premium-btn-sm" style={{ padding: '0.5rem 1rem' }}>Add Tag</button>
              </form>
            </div>

            {/* Recent Orders */}
            <div className="premium-glass-card">
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🛍️ Recent Orders
              </h3>
              {recentOrders.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No orders found for this customer.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '0.5rem' }}>Date</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Service</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Status</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Total</th>
                      <th style={{ paddingBottom: '0.5rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 0', color: '#475569' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 0', fontWeight: 500, color: '#1e293b' }}>{order.serviceName}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <span style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{order.status}</span>
                        </td>
                        <td style={{ padding: '1rem 0', fontWeight: 600 }}>Rs. {order.totalPrice.toLocaleString()}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <Link to={`/admin/orders/${order._id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>View &rarr;</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Admin Private Notes */}
            <div className="premium-glass-card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#b45309', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔒 Private Support Notes
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#92400e', marginBottom: '1rem' }}>Visible only to the admin team. Use this to track customer preferences, complaints, or VIP treatment rules.</p>
              
              <textarea 
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Type notes here..."
                style={{ width: '100%', height: '150px', padding: '1rem', border: '1px solid #fcd34d', borderRadius: '0.5rem', outline: 'none', resize: 'vertical', background: 'rgba(255,255,255,0.7)', color: '#78350f', fontFamily: 'inherit' }}
              />
              <button 
                onClick={handleSaveNotes} 
                disabled={savingNotes}
                style={{ width: '100%', padding: '0.75rem', background: '#d97706', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', marginTop: '1rem', cursor: 'pointer', transition: '0.2s' }}
              >
                {savingNotes ? 'Saving...' : 'Save Private Notes'}
              </button>
            </div>

          </div>
        </div>

      </div>
      <style>{`
        .crm-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 768px) {
          .crm-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .premium-stat-card {
            padding: 1rem;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

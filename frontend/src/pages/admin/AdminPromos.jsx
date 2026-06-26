import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    minSpend: 0,
    expiryDate: '',
    requiredTags: '',
    isActive: true
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const response = await api.get('/api/promos');
      setPromos(response.data);
    } catch (error) {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        requiredTags: formData.requiredTags ? formData.requiredTags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      await api.post('/api/promos', payload);
      toast.success('Promo Code created successfully');
      setShowModal(false);
      fetchPromos();
      setFormData({ code: '', discountType: 'Percentage', discountValue: '', minSpend: 0, expiryDate: '', requiredTags: '', isActive: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create promo code');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        await api.delete(`/api/promos/${id}`);
        toast.success('Promo code deleted');
        fetchPromos();
      } catch (error) {
        toast.error('Failed to delete promo code');
      }
    }
  };

  return (
    <AdminLayout title="Promo Code Engine">
      <div className="premium-dashboard">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="premium-title" style={{ margin: 0 }}>Marketing Campaigns</h2>
          <button 
            className="premium-btn" 
            onClick={() => setShowModal(true)}
            style={{ background: '#1e293b', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold' }}
          >
            + Generate Promo Code
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading campaigns...</div>
        ) : (
          <div className="admin-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Spend</th>
                  <th>Restrictions</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Uses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No promo codes generated yet.</td></tr>
                ) : (
                  promos.map(promo => (
                    <tr key={promo._id}>
                      <td style={{ fontWeight: 800, color: '#1e293b', letterSpacing: '1px' }}>{promo.code}</td>
                      <td style={{ fontWeight: 600, color: '#059669' }}>
                        {promo.discountType === 'Percentage' ? `${promo.discountValue}% OFF` : `Rs. ${promo.discountValue} OFF`}
                      </td>
                      <td>{promo.minSpend > 0 ? `Rs. ${promo.minSpend}` : 'None'}</td>
                      <td>
                        {promo.requiredTags && promo.requiredTags.length > 0 ? (
                          <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            Restricted: {promo.requiredTags.join(', ')}
                          </span>
                        ) : <span style={{ color: '#94a3b8' }}>Public (All Users)</span>}
                      </td>
                      <td style={{ color: new Date() > new Date(promo.expiryDate) ? '#ef4444' : '#1e293b' }}>
                        {new Date(promo.expiryDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span style={{ 
                          background: promo.isActive && new Date() < new Date(promo.expiryDate) ? '#dcfce7' : '#fee2e2', 
                          color: promo.isActive && new Date() < new Date(promo.expiryDate) ? '#166534' : '#991b1b',
                          padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {promo.isActive && new Date() < new Date(promo.expiryDate) ? 'Active' : 'Expired/Inactive'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{promo.usageCount}</td>
                      <td>
                        <button onClick={() => handleDelete(promo._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Generate Promo Code</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Code Name (e.g. EID2026)</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required className="premium-input" style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Discount Type</label>
                    <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="premium-input" style={{ width: '100%' }}>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Flat">Flat Amount (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Value</label>
                    <input type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required min="1" className="premium-input" style={{ width: '100%' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Minimum Spend (Rs.)</label>
                    <input type="number" value={formData.minSpend} onChange={e => setFormData({...formData, minSpend: e.target.value})} min="0" className="premium-input" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Expiry Date</label>
                    <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required className="premium-input" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Restrict by Tag (Optional)</label>
                  <input type="text" placeholder="e.g. VIP, Priority (comma separated)" value={formData.requiredTags} onChange={e => setFormData({...formData, requiredTags: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>If left blank, any customer can use this code.</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="premium-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="premium-btn" style={{ background: '#1e293b', color: 'white' }}>Create Promo</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

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

  const activePromos = promos.filter(p => p.isActive && new Date() < new Date(p.expiryDate)).length;
  const totalUses = promos.reduce((sum, p) => sum + p.usageCount, 0);

  return (
    <AdminLayout title="Marketing & Promos">
      <div className="premium-dashboard">
        
        {/* Top Header & Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="premium-title" style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Promo Code Engine</h2>
            <p style={{ color: '#64748b', margin: '0.2rem 0 0 0' }}>Generate targeted discount codes and track campaign performance.</p>
          </div>
          <button 
            className="premium-btn" 
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Generate Promo Code
          </button>
        </div>

        <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' }}>
              🎟️
            </div>
            <div className="stat-info">
              <h4>Total Campaigns</h4>
              <p className="stat-value">{promos.length}</p>
            </div>
          </div>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' }}>
              ✅
            </div>
            <div className="stat-info">
              <h4>Active Promos</h4>
              <p className="stat-value">{activePromos}</p>
            </div>
          </div>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' }}>
              🔥
            </div>
            <div className="stat-info">
              <h4>Total Uses</h4>
              <p className="stat-value">{totalUses}</p>
            </div>
          </div>
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
                    <tr key={promo._id} style={{ transition: 'all 0.2s', background: 'white' }}>
                      <td style={{ fontWeight: 800, color: '#1e293b', letterSpacing: '1px', fontSize: '1.05rem' }}>{promo.code}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '0.3rem 0.6rem', borderRadius: '0.5rem' }}>
                          {promo.discountType === 'Percentage' ? `${promo.discountValue}% OFF` : `Rs. ${promo.discountValue} OFF`}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontWeight: 500 }}>{promo.minSpend > 0 ? `Rs. ${promo.minSpend.toLocaleString()}` : 'None'}</td>
                      <td>
                        {promo.requiredTags && promo.requiredTags.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {promo.requiredTags.map((tag, idx) => (
                              <span key={idx} style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0284c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Public (All Users)</span>}
                      </td>
                      <td style={{ color: new Date() > new Date(promo.expiryDate) ? '#ef4444' : '#475569', fontWeight: 500 }}>
                        {new Date(promo.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <span style={{ 
                          background: promo.isActive && new Date() < new Date(promo.expiryDate) ? '#dcfce7' : '#fee2e2', 
                          color: promo.isActive && new Date() < new Date(promo.expiryDate) ? '#166534' : '#991b1b',
                          padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px'
                        }}>
                          {promo.isActive && new Date() < new Date(promo.expiryDate) ? 'ACTIVE' : 'EXPIRED'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#1e293b' }}>{promo.usageCount}</td>
                      <td>
                        <button onClick={() => handleDelete(promo._id)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }} onMouseOver={e => e.target.style.background = '#fecaca'} onMouseOut={e => e.target.style.background = '#fee2e2'}>
                          Delete
                        </button>
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

      {/* Advanced Premium CSS for Marketing Dashboard */}
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

        .premium-input {
          padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; color: #1e293b;
          background-color: white; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .premium-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .premium-table { width: 100%; min-width: 800px; border-collapse: separate; border-spacing: 0 0.75rem; font-size: 0.95rem; }
        .premium-table th { font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; border: none; padding: 1rem 1.5rem; text-align: left; }
        .premium-table tbody tr { background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .premium-table tbody tr:hover { transform: translateY(-2px) scale(1.005); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .premium-table td { padding: 1rem 1.5rem; border: none; background: transparent; vertical-align: middle; }
        .premium-table td:first-child { border-radius: 0.75rem 0 0 0.75rem; }
        .premium-table td:last-child { border-radius: 0 0.75rem 0.75rem 0; }

        .premium-btn-secondary {
          background: #f1f5f9; color: #475569; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease;
        }
        .premium-btn-secondary:hover { background: #e2e8f0; color: #1e293b; }
        
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          background: white; padding: 2rem; border-radius: 1.5rem; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </AdminLayout>
  );
}

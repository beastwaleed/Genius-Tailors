import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminSeasons() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Normal', startDate: '', endDate: '', announcement: '' });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const { data } = await api.get('/api/season');
      setSeasons(data);
    } catch (error) {
      console.error('Failed to fetch seasons', error);
      toast.error('Failed to load seasons');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeason = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/season', formData);
      setSeasons([data, ...seasons]);
      toast.success('Season created successfully');
      setShowModal(false);
      setFormData({ name: '', type: 'Normal', startDate: '', endDate: '', announcement: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create season');
    }
  };

  const handleToggleActive = async (season) => {
    try {
      if (season.isActive) {
        await api.put(`/api/season/${season._id}/deactivate`);
        setSeasons(seasons.map(s => s._id === season._id ? { ...s, isActive: false } : s));
        toast.success('Season deactivated');
      } else {
        const { data } = await api.put(`/api/season/${season._id}/activate`);
        setSeasons(seasons.map(s => s._id === season._id ? { ...s, isActive: true } : { ...s, isActive: false }));
        toast.success(data.message || 'Season activated');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle season status');
    }
  };

  const handleDeleteSeason = async (id) => {
    if (window.confirm('Are you sure you want to delete this season?')) {
      try {
        await api.delete(`/api/season/${id}`);
        setSeasons(seasons.filter(s => s._id !== id));
        toast.success('Season deleted successfully');
      } catch (error) {
        toast.error('Failed to delete season');
      }
    }
  };

  return (
    <AdminLayout title="Season Configuration">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="admin-section-title" style={{ marginBottom: '0.25rem' }}>Seasonal Campaigns</h2>
          <p style={{ color: '#6b7280' }}>Manage discounts and seasonal fabric availability.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setShowModal(true)}>+ Create Season</button>
      </div>

      {loading ? (
        <p>Loading seasons...</p>
      ) : (
        <div className="admin-card admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Status</th>
                <th>Type</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map(season => (
                <tr key={season._id}>
                  <td style={{ fontWeight: 500 }}>{season.name}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: season.isActive ? '#d1fae5' : '#f3f4f6',
                      color: season.isActive ? '#059669' : '#4b5563'
                    }}>
                      {season.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#3b82f6' }}>{season.type}</td>
                  <td>{new Date(season.endDate).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-link" onClick={() => handleToggleActive(season)} style={{ marginRight: '1rem', color: season.isActive ? '#d97706' : '#059669' }}>
                      {season.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn-link" onClick={() => handleDeleteSeason(season._id)} style={{ color: '#dc2626' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Create New Season</h3>
            <form onSubmit={handleSaveSeason} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Campaign Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                  placeholder="e.g. Ramazan 2026"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Season Type *</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Ramazan">Ramazan</option>
                  <option value="Eid">Eid</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Start Date *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>End Date *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Announcement Banner (Optional)</label>
                <input 
                  type="text" 
                  value={formData.announcement}
                  onChange={e => setFormData({...formData, announcement: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                  placeholder="e.g. 10% Off on all Eid Orders!"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1 }}>Create Season</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .btn-link {
          background: none;
          border: none;
          color: #3b82f6;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-link:hover {
          text-decoration: underline;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: modalSlide 0.3s ease-out;
        }

        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';
import CustomerLayout from '../../components/CustomerLayout';

export default function Profile() {
  const { user, login } = useAuth();
  
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: '', 
    address: '', 
    password: '' 
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/profile');
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.location?.street || '',
          password: ''
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/api/profile', formData);
      login(data, data.token); 
      toast.success('Profile updated successfully');
      setFormData({ ...formData, password: '' }); 

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomerLayout title="My Profile">
      <div className="luxury-workspace-inner" style={{ maxWidth: '800px', margin: '0' }}>
        
        <div className="luxury-section">
          <h2 className="luxury-section-title">Personal Information</h2>
          <div className="luxury-card profile-card-inner">
            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--stone)' }}>Loading profile data...</p>
            ) : (
            <form onSubmit={handleProfileUpdate} className="luxury-form">
              
              <div className="form-row">
                <div className="luxury-form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="luxury-form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="luxury-form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="luxury-form-group">
                  <label>Shipping Address</label>
                  <input 
                    type="text" 
                    placeholder="Your primary delivery address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--ivory-border)', margin: '1rem 0' }} />

              <div className="luxury-form-group" style={{ maxWidth: '50%' }}>
                <label>Change Password (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <span className="subtext" style={{ marginTop: '0.25rem', display: 'block' }}>Only fill this out if you wish to change your password.</span>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button type="submit" className="luxury-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              </div>
            </form>
            )}
          </div>
        </div>

      </div>

      <style>{`
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
        }

        .profile-card-inner {
          padding: 3rem;
        }

        .luxury-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .luxury-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .luxury-form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--stone);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .luxury-form-group input {
          padding: 1rem 1.25rem;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          background: var(--ivory);
          color: var(--onyx);
          transition: all 0.2s ease;
          font-family: var(--font-sans);
        }

        .luxury-form-group input:focus {
          outline: none;
          border-color: var(--onyx);
          background: #ffffff;
        }

        .luxury-btn-primary {
          background: var(--onyx);
          color: #ffffff;
          padding: 0.875rem 2.5rem;
          border-radius: var(--radius-sm);
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .luxury-btn-primary:hover {
          background: var(--charcoal);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .subtext {
          font-size: 0.85rem;
          color: var(--stone);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .profile-card-inner {
            padding: 2rem;
          }
          .luxury-form-group[style] {
            max-width: 100% !important;
          }
        }
      `}</style>
    </CustomerLayout>
  );
}

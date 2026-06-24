import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', street: '', city: '', country: 'Pakistan'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/api/admin/users'); // Assuming an admin endpoint exists for users
      const filtered = data.filter(user => user.role === 'Customer');
      setCustomers(filtered);
    } catch (error) {
      console.error('Failed to fetch customers', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    );

    if (filteredCustomers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    const csvData = filteredCustomers.map(c => ({
      'Customer ID': c._id,
      'Name': c.name,
      'Email': c.email,
      'Phone': c.phone || 'N/A',
      'Address': `${c.street || ''} ${c.city || ''} ${c.country || ''}`.trim() || 'N/A',
      'Registered Date': new Date(c.createdAt).toLocaleDateString(),
      'Loyalty Points': c.loyaltyPoints || 0,
      'Membership': c.membershipLevel || 'Standard'
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Customers_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Customers exported successfully');
  };

  return (
    <AdminLayout title="Customer Base">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Registered Customers</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 'var(--radius-sm)', width: '250px' }}
          />
          <button className="admin-btn-primary" onClick={() => setShowModal(true)}>+ Add Customer</button>
          <button className="btn btn-outline" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <div className="admin-card admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Registered Date</th>
                <th>Loyalty Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .filter(c => 
                  c.name.toLowerCase().includes(search.toLowerCase()) || 
                  c.email.toLowerCase().includes(search.toLowerCase()) ||
                  (c.phone && c.phone.includes(search))
                )
                .map(customer => (
                <tr key={customer._id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '999px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#4b5563', fontSize: '0.85rem' }}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      {customer.name}
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600, color: '#f59e0b' }}>{customer.loyaltyPoints || 0}</td>
                  <td>
                    <button className="btn-link" onClick={() => setViewCustomer(customer)}>View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Add New Customer</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.post('/api/admin/users', formData);
                toast.success('Customer created successfully');
                setShowModal(false);
                setFormData({ name: '', email: '', password: '', phone: '', street: '', city: '', country: 'Pakistan' });
                fetchCustomers();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to create customer');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Full Name *</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Email Address *</label>
                <input type="email" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Password *</label>
                <input type="password" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Phone Number</label>
                <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>City</label>
                  <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Street Address</label>
                  <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewCustomer && (
        <div className="modal-backdrop" onClick={() => setViewCustomer(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>Customer Profile</h2>
              <button onClick={() => setViewCustomer(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '999px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#4b5563', fontSize: '1.5rem' }}>
                  {viewCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>{viewCustomer.name}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{viewCustomer.customerNumber || viewCustomer._id}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Email Address</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontWeight: 500 }}>{viewCustomer.email}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Phone Number</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontWeight: 500 }}>{viewCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Membership Level</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontWeight: 500 }}>{viewCustomer.membershipLevel || 'Bronze'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Loyalty Points</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#f59e0b', fontWeight: 600 }}>{viewCustomer.loyaltyPoints || 0}</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Shipping Address</p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', lineHeight: 1.5 }}>
                  {viewCustomer.location?.street || viewCustomer.street || 'No street address provided.'} <br/>
                  {viewCustomer.location?.city || viewCustomer.city || ''} {viewCustomer.location?.country || viewCustomer.country || ''}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setViewCustomer(null)}>Close</button>
              </div>
            </div>
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
        .modal-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </AdminLayout>
  );
}

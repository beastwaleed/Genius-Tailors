import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const ADMIN_STYLE_CONFIGS = {
  'Kameez Shalwar': {
    collarTypes: ['Ban Collar', 'Shirt Collar'],
    collarSubs: {
      'Ban Collar': ['0.9 inch', '0.75 inch', '1 inch', '1.25 inch'],
      'Shirt Collar': ['2 inch notch', '2.25 inch notch', 'Arrow Collar']
    },
    cuffs: ['Round Cuff', 'Square Cuff', 'Double Cuff'],
    pockets: ['2 Side Pockets', '1 Front and 2 Sides'],
    bottomPockets: ['No Pocket', '1 Pocket'],
    bottomDesigns: ['No Design', 'Zigzag Stitch']
  },
  'Kurta Shalwar': {
    collarTypes: ['Ban Collar'],
    collarSubs: { 'Ban Collar': ['0.9 inch', '0.75 inch', '1 inch', '1.25 inch'] },
    cuffs: ['Round Sleeves', 'Square Cuff'],
    pockets: ['2 Side Pockets', '1 Front and 2 Sides'],
    bottomPockets: ['No Pocket', '1 Pocket'],
    bottomDesigns: ['No Design', 'Zigzag Stitch']
  },
  'Kurta Pajama': {
    collarTypes: ['Ban Collar'],
    collarSubs: { 'Ban Collar': ['0.9 inch', '0.75 inch', '1 inch', '1.25 inch'] },
    cuffs: ['Round Sleeves', 'Square Cuff'],
    pockets: ['2 Side Pockets'],
    bottomPockets: ['No Pocket', '1 Pocket'],
    bottomDesigns: ['No Design', 'Zigzag Stitch']
  }
};

const MEASUREMENT_TEMPLATES = {
  'Shalwar Kameez': { length: '', shoulder: '', chest: '', waist: '', hip: '', sleeves: '', collar: '', shalwarLength: '', bottomPanja: '' },
  'Kurta Shalwar': { length: '', shoulder: '', chest: '', waist: '', hip: '', sleeves: '', collar: '', shalwarLength: '', bottomPanja: '' },
  'Kurta Pajama': { length: '', shoulder: '', chest: '', waist: '', hip: '', sleeves: '', collar: '', pajamaLength: '', bottomPanja: '' },
  'Waistcoat': { length: '', shoulder: '', chest: '', waist: '', hip: '' }
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', street: '', city: '', country: 'Pakistan',
    profileName: 'Shalwar Kameez',
    measurements: { ...MEASUREMENT_TEMPLATES['Shalwar Kameez'] }
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    profileName: 'Shalwar Kameez',
    measurements: { ...MEASUREMENT_TEMPLATES['Shalwar Kameez'] }
  });

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [services, setServices] = useState([]);
  const [customerProfiles, setCustomerProfiles] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [orderForm, setOrderForm] = useState({
    serviceName: '',
    profileId: '',
    totalPrice: '',
    isRush: false,
    styleVariations: {
      collar: 'Ban Collar',
      collarSub: '0.9 inch',
      cuff: 'Round Cuff',
      pockets: '2 Side Pockets',
      bottomPocket: 'No Pocket',
      bottomDesign: 'No Design'
    }
  });

  useEffect(() => {
    fetchCustomers();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/api/services');
      setServices(data.filter(s => s.isActive));
    } catch (error) {
      console.error('Failed to fetch services', error);
    }
  };

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

  const handleViewProfile = async (customer) => {
    setViewCustomer(customer);
    setCustomerProfiles([]);
    setCustomerOrders([]);
    try {
      const [profilesRes, ordersRes] = await Promise.all([
        api.get(`/api/admin/users/${customer._id}/measurements`),
        api.get('/api/orders') // Fetch all admin orders
      ]);
      setCustomerProfiles(profilesRes.data);
      // Filter orders to only this customer
      const userOrders = ordersRes.data.filter(o => o.customer && o.customer._id === customer._id);
      setCustomerOrders(userOrders);
    } catch (error) {
      toast.error('Failed to load profile details');
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
    toast.success('Customers exported successfully');
  };

  const totalPoints = customers.reduce((acc, c) => acc + (c.loyaltyPoints || 0), 0);
  const activeMembers = customers.filter(c => (c.loyaltyPoints || 0) > 0).length;

  return (
    <AdminLayout title="Customer Base">
      <div className="premium-dashboard">
        <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>👥</div>
            <div className="stat-info">
              <h4>Total Customers</h4>
              <p className="stat-value">{customers.length}</p>
            </div>
          </div>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>⭐</div>
            <div className="stat-info">
              <h4>Loyalty Members</h4>
              <p className="stat-value">{activeMembers}</p>
            </div>
          </div>
          <div className="premium-stat-card">
            <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>🏆</div>
            <div className="stat-info">
              <h4>Total Points Issued</h4>
              <p className="stat-value">{totalPoints}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <h2 className="premium-title" style={{ marginBottom: 0, fontSize: '1.5rem' }}>Customer Directory</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search by name, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="premium-input"
              style={{ width: '250px' }}
            />
            <button className="premium-btn" onClick={() => setShowModal(true)} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Customer</button>
            <button className="premium-btn" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#C9A96E', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading directory...</div>
        ) : (
        <div className="admin-table-container">
          <table className="premium-table">
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
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="premium-btn-sm" onClick={() => handleViewProfile(customer)}>View Measurements</button>
                    <Link to={`/admin/customers/${customer._id}`} className="premium-btn-sm" style={{ background: '#0284c7', color: 'white', textDecoration: 'none' }}>
                      360° CRM
                    </Link>
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
                toast.success('Customer created successfully. Email & WhatsApp sent!');
                console.log('Success: Account creation email and WhatsApp message dispatched.');
                setShowModal(false);
                setFormData({ 
                  name: '', email: '', password: '', phone: '', street: '', city: '', country: 'Pakistan',
                  profileName: 'Shalwar Kameez',
                  measurements: { ...MEASUREMENT_TEMPLATES['Shalwar Kameez'] }
                });
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
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>City</label>
                  <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Street Address</label>
                  <input type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b' }}>Initial Measurements (Optional)</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>Garment / Profile Type</label>
                  <select style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }} value={formData.profileName} onChange={(e) => {
                    const newProfile = e.target.value;
                    setFormData({ ...formData, profileName: newProfile, measurements: { ...MEASUREMENT_TEMPLATES[newProfile] } });
                  }}>
                    {Object.keys(MEASUREMENT_TEMPLATES).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                  {Object.keys(formData.measurements).map(key => (
                    <div key={key}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500, color: '#475569', textTransform: 'capitalize' }}>{key}</label>
                      <input type="text" placeholder={`e.g. ${key === 'length' ? '40' : '15'}`} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }} value={formData.measurements[key]} onChange={(e) => setFormData({...formData, measurements: {...formData.measurements, [key]: e.target.value}})} />
                    </div>
                  ))}
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Email Address</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontWeight: 500, wordBreak: 'break-all' }}>{viewCustomer.email}</p>
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

              {/* Order Stats */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', display: 'flex', gap: '2rem' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Orders</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>{customerOrders.length}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Current Active Orders</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#2563eb', fontSize: '1.25rem', fontWeight: 600 }}>
                    {customerOrders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length}
                  </p>
                </div>
              </div>

              {/* Measurement Profiles List */}
              <div>
                <h4 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Measurement Profiles</h4>
                {customerProfiles.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No measurement profiles found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {customerProfiles.map(p => (
                      <div key={p._id} style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>{p.profileName}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {Object.entries(p.measurements).map(([key, value]) => (
                            <span key={key} style={{ fontSize: '0.8rem', background: '#e2e8f0', color: '#334155', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" onClick={() => setViewCustomer(null)}>Close</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowProfileModal(true)}>Add Profile</button>
                <button type="button" className="premium-btn" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }} onClick={async () => {
                  try {
                    const { data } = await api.get(`/api/admin/users/${viewCustomer._id}/measurements`);
                    setCustomerProfiles(data);
                    setShowOrderModal(true);
                  } catch(err) {
                    toast.error('Failed to load profiles');
                  }
                }}>Place an Order</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && viewCustomer && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Add Measurement Profile</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.post(`/api/admin/users/${viewCustomer._id}/measurements`, profileForm);
                toast.success('Profile added successfully');
                setShowProfileModal(false);
                setProfileForm({ profileName: 'Shalwar Kameez', measurements: { ...MEASUREMENT_TEMPLATES['Shalwar Kameez'] } });
                
                // If they add a profile, let's pre-load the updated list just in case they open the Order modal next
                const { data } = await api.get(`/api/admin/users/${viewCustomer._id}/measurements`);
                setCustomerProfiles(data);
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to add profile');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Garment / Profile Type</label>
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={profileForm.profileName} onChange={(e) => {
                  const newProfile = e.target.value;
                  setProfileForm({ ...profileForm, profileName: newProfile, measurements: { ...MEASUREMENT_TEMPLATES[newProfile] } });
                }} required>
                  {Object.keys(MEASUREMENT_TEMPLATES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                {Object.keys(profileForm.measurements).map(key => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500, color: '#475569', textTransform: 'capitalize' }}>{key}</label>
                    <input type="text" placeholder={`e.g. ${key === 'length' ? '40' : '15'}`} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }} value={profileForm.measurements[key]} onChange={(e) => setProfileForm({...profileForm, measurements: {...profileForm.measurements, [key]: e.target.value}})} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOrderModal && viewCustomer && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Place Order for {viewCustomer.name}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const service = services.find(s => s._id === orderForm.serviceName);
                if (!service) return toast.error('Select a service');
                
                const profile = customerProfiles.find(p => p._id === orderForm.profileId);
                if (!profile) return toast.error('Select a measurement profile');

                await api.post('/api/admin/orders/place', {
                  customerId: viewCustomer._id,
                  serviceName: service.name,
                  measurementSnapshot: {
                    profileName: profile.profileName,
                    measurements: profile.measurements
                  },
                  styleVariations: orderForm.styleVariations,
                  totalPrice: Number(orderForm.totalPrice),
                  isRush: orderForm.isRush
                });
                
                toast.success('Order placed successfully');
                setShowOrderModal(false);
                setOrderForm({ 
                  serviceName: '', profileId: '', totalPrice: '', isRush: false,
                  styleVariations: { collar: 'Ban Collar', collarSub: '0.9 inch', cuff: 'Round Cuff', pockets: '2 Side Pockets', bottomPocket: 'No Pocket', bottomDesign: 'No Design' }
                });
                setViewCustomer(null);
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to place order');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Service *</label>
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={orderForm.serviceName} onChange={(e) => {
                  const sId = e.target.value;
                  const s = services.find(s => s._id === sId);
                  
                  const sName = s ? s.name : 'Kameez Shalwar';
                  const config = ADMIN_STYLE_CONFIGS[sName] || ADMIN_STYLE_CONFIGS['Kameez Shalwar'];
                  
                  setOrderForm({
                    ...orderForm, 
                    serviceName: sId, 
                    totalPrice: s ? s.basePrice : '',
                    styleVariations: {
                      collar: config.collarTypes[0],
                      collarSub: config.collarSubs[config.collarTypes[0]][0],
                      cuff: config.cuffs[0],
                      pockets: config.pockets[0],
                      bottomPocket: config.bottomPockets[0],
                      bottomDesign: config.bottomDesigns[0]
                    }
                  });
                }} required>
                  <option value="">Select Service...</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name} (from Rs. {s.basePrice})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Measurement Profile *</label>
                {customerProfiles.length === 0 ? (
                  <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: 0 }}>This customer has no measurement profiles. Please add measurements first via their profile.</p>
                ) : (
                  <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={orderForm.profileId} onChange={(e) => setOrderForm({...orderForm, profileId: e.target.value})} required>
                    <option value="">Select Profile...</option>
                    {customerProfiles.map(p => <option key={p._id} value={p._id}>{p.profileName}</option>)}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Total Price (Rs.) *</label>
                <input type="number" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }} value={orderForm.totalPrice} onChange={(e) => setOrderForm({...orderForm, totalPrice: e.target.value})} required min="1" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="isRush" checked={orderForm.isRush} onChange={(e) => setOrderForm({...orderForm, isRush: e.target.checked})} />
                <label htmlFor="isRush" style={{ fontWeight: 500, color: '#475569', cursor: 'pointer' }}>Mark as Priority/Rush Order</label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Styling Variations</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  {(() => {
                    const s = services.find(serv => serv._id === orderForm.serviceName);
                    const sName = s ? s.name : 'Kameez Shalwar';
                    const config = ADMIN_STYLE_CONFIGS[sName] || ADMIN_STYLE_CONFIGS['Kameez Shalwar'];
                    
                    return (
                      <>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Collar Type</label>
                          <select 
                            value={orderForm.styleVariations.collar} 
                            onChange={(e) => {
                              const newCollar = e.target.value;
                              setOrderForm({...orderForm, styleVariations: {...orderForm.styleVariations, collar: newCollar, collarSub: (config.collarSubs[newCollar] || [])[0] }});
                            }}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                          >
                            {config.collarTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Collar Size / Sub-style</label>
                          <select 
                            value={orderForm.styleVariations.collarSub} 
                            onChange={(e) => setOrderForm({...orderForm, styleVariations: {...orderForm.styleVariations, collarSub: e.target.value}})}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                          >
                            {(config.collarSubs[orderForm.styleVariations.collar] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Cuff / Sleeves</label>
                          <select 
                            value={orderForm.styleVariations.cuff} 
                            onChange={(e) => setOrderForm({...orderForm, styleVariations: {...orderForm.styleVariations, cuff: e.target.value}})}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                          >
                            {config.cuffs.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Pockets</label>
                          <select 
                            value={orderForm.styleVariations.pockets} 
                            onChange={(e) => setOrderForm({...orderForm, styleVariations: {...orderForm.styleVariations, pockets: e.target.value}})}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                          >
                            {config.pockets.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Bottom Pocket</label>
                          <select 
                            value={orderForm.styleVariations.bottomPocket} 
                            onChange={(e) => setOrderForm({...orderForm, styleVariations: {...orderForm.styleVariations, bottomPocket: e.target.value}})}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                          >
                            {config.bottomPockets.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Bottom Design</label>
                          <select 
                            value={orderForm.styleVariations.bottomDesign} 
                            onChange={(e) => setOrderForm({...orderForm, styleVariations: {...orderForm.styleVariations, bottomDesign: e.target.value}})}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                          >
                            {config.bottomDesigns.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowOrderModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={customerProfiles.length === 0}>Place Order</button>
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
        .modal-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-height: 90vh; overflow-y: auto; box-sizing: border-box;
        }
        @media (max-width: 600px) {
          .modal-content {
            padding: 1.5rem;
            width: 100%;
          }
        }
      `}</style>
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

        .premium-btn-sm {
          background: rgba(59, 130, 246, 0.1); color: #2563eb; border: none; padding: 0.5rem 1rem; border-radius: 999px;
          font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease;
        }
        .premium-btn-sm:hover { background: #2563eb; color: white; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
      `}</style>
      </div>
    </AdminLayout>
  );
}

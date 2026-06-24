import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminFabrics() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    desc: '',
    category: 'General',
    imageUrl: '',
    colors: [{ name: '', hex: '#000000' }]
  });

  useEffect(() => {
    fetchFabrics();
  }, []);

  const fetchFabrics = async () => {
    try {
      const { data } = await api.get('/api/fabrics');
      setFabrics(data);
    } catch (error) {
      toast.error('Failed to fetch fabrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fabric?')) return;
    try {
      await api.delete(`/api/fabrics/${id}`);
      toast.success('Fabric deleted successfully');
      fetchFabrics();
    } catch (error) {
      toast.error('Failed to delete fabric');
    }
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData({ ...formData, colors: newColors });
  };

  const addColor = () => {
    setFormData({ ...formData, colors: [...formData.colors, { name: '', hex: '#ffffff' }] });
  };

  const removeColor = (index) => {
    const newColors = [...formData.colors];
    newColors.splice(index, 1);
    setFormData({ ...formData, colors: newColors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = formData;
      let headers = {};

      if (imageFile) {
        payload = new FormData();
        payload.append('name', formData.name);
        payload.append('price', formData.price);
        payload.append('desc', formData.desc);
        payload.append('category', formData.category);
        payload.append('colors', JSON.stringify(formData.colors));
        if (formData.imageUrl) payload.append('imageUrl', formData.imageUrl);
        payload.append('image', imageFile);
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      await api.post('/api/fabrics', payload, { headers });
      toast.success('Fabric created successfully');
      setShowModal(false);
      setFormData({ name: '', price: '', desc: '', category: 'General', imageUrl: '', colors: [{ name: '', hex: '#000000' }] });
      setImageFile(null);
      fetchFabrics();
    } catch (error) {
      console.error('Fabric save error:', error.response?.data || error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to save fabric');
    }
  };

  return (
    <AdminLayout title="Manage Fabrics">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Fabric Catalog</h2>
        <button className="admin-btn-primary" onClick={() => { setShowModal(true); setImageFile(null); setFormData({ name: '', price: '', desc: '', category: 'General', imageUrl: '', colors: [{ name: '', hex: '#000000' }] }); }}>+ Add New Fabric</button>
      </div>

      {loading ? (
        <p>Loading fabrics...</p>
      ) : (
        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {fabrics.map(fabric => (
            <div key={fabric._id} className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '140px', background: '#f3f4f6', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                {fabric.imageUrl ? (
                  <img src={fabric.imageUrl} alt={fabric.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{fabric.name}</h3>
                <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>Rs. {fabric.price}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem', flex: 1 }}>{fabric.desc}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {fabric.colors.map(c => (
                  <div key={c._id || c.name} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c.hex, border: '1px solid #d1d5db' }} title={c.name} />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDelete(fabric._id)}>Delete</button>
              </div>
            </div>
          ))}
          {fabrics.length === 0 && <p style={{ color: '#6b7280' }}>No fabrics found. Add one to get started.</p>}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Add New Fabric</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Fabric Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Price (Rs.)</label>
                  <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Category</label>
                  <input type="text" className="form-control" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Cotton, Silk" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#475569' }}>Upload Image File</label>
                  <input type="file" accept="image/*" className="form-control" onChange={(e) => setImageFile(e.target.files[0])} />
                </div>
                <div style={{ padding: '0 1rem', color: '#94a3b8', fontWeight: 700 }}>OR</div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#475569' }}>Image URL</label>
                  <input type="url" className="form-control" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." disabled={!!imageFile} />
                </div>
              </div>
              <div>
                <label>Description</label>
                <textarea className="form-control" value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} rows="3" />
              </div>
              
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0 }}>Color Variants</label>
                  <button type="button" onClick={addColor} style={{ background: '#e5e7eb', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>+ Add Color</button>
                </div>
                {formData.colors.map((color, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Color Name (e.g. Navy Blue)" className="form-control" value={color.name} onChange={(e) => handleColorChange(idx, 'name', e.target.value)} required style={{ flex: 2 }} />
                    <input type="color" className="form-control" value={color.hex} onChange={(e) => handleColorChange(idx, 'hex', e.target.value)} required style={{ flex: 1, padding: '0 0.5rem' }} />
                    {formData.colors.length > 1 && (
                      <button type="button" onClick={() => removeColor(idx)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Fabric</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
        }
        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-top: 0.25rem;
        }
      `}</style>
    </AdminLayout>
  );
}

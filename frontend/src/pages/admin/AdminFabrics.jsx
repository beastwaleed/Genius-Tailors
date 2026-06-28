import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminFabrics() {
  const [fabrics, setFabrics] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [colorImageFiles, setColorImageFiles] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    desc: '',
    category: 'General',
    imageUrl: '',
    colors: [{ name: '', hex: '#000000', imageUrl: '' }],
    allowedServices: []
  });

  useEffect(() => {
    fetchFabrics();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/api/services');
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services');
    }
  };

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
    setFormData({ ...formData, colors: [...formData.colors, { name: '', hex: '#ffffff', imageUrl: '' }] });
  };

  const removeColor = (index) => {
    const newColors = [...formData.colors];
    newColors.splice(index, 1);
    setFormData({ ...formData, colors: newColors });
    
    const newColorFiles = { ...colorImageFiles };
    delete newColorFiles[index];
    // Re-index remaining files
    const reindexedFiles = {};
    Object.keys(newColorFiles).forEach(key => {
      const k = parseInt(key);
      if (k > index) {
        reindexedFiles[k - 1] = newColorFiles[key];
      } else {
        reindexedFiles[key] = newColorFiles[key];
      }
    });
    setColorImageFiles(reindexedFiles);
  };

  const handleServiceToggle = (serviceName) => {
    const current = [...formData.allowedServices];
    if (current.includes(serviceName)) {
      setFormData({ ...formData, allowedServices: current.filter(s => s !== serviceName) });
    } else {
      setFormData({ ...formData, allowedServices: [...current, serviceName] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('price', formData.price);
      payload.append('desc', formData.desc);
      payload.append('category', formData.category);
      payload.append('colors', JSON.stringify(formData.colors));
      payload.append('allowedServices', JSON.stringify(formData.allowedServices));
      
      if (formData.imageUrl && !imageFile) {
        payload.append('imageUrl', formData.imageUrl);
      }
      if (imageFile) {
        payload.append('image', imageFile);
      }

      // Append color variant images
      Object.keys(colorImageFiles).forEach(index => {
        if (colorImageFiles[index]) {
          payload.append(`colorImage_${index}`, colorImageFiles[index]);
        }
      });

      if (editingId) {
        await api.put(`/api/fabrics/${editingId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Fabric updated successfully');
      } else {
        await api.post('/api/fabrics', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Fabric created successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', price: '', desc: '', category: 'General', imageUrl: '', colors: [{ name: '', hex: '#000000', imageUrl: '' }], allowedServices: [] });
      setImageFile(null);
      setColorImageFiles({});
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
        <button className="admin-btn-primary" onClick={() => { setShowModal(true); setEditingId(null); setImageFile(null); setColorImageFiles({}); setFormData({ name: '', price: '', desc: '', category: 'General', imageUrl: '', colors: [{ name: '', hex: '#000000', imageUrl: '' }], allowedServices: [] }); }}>+ Add New Fabric</button>
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
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem', flex: 1 }}>{fabric.desc}</p>
              
              {fabric.allowedServices && fabric.allowedServices.length > 0 && (
                <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <strong>For:</strong> {fabric.allowedServices.join(', ')}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {fabric.colors.map((c, i) => (
                  <div key={c._id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c.hex, border: '1px solid #d1d5db' }} title={c.name} />
                    {c.imageUrl && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>(img)</span>}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', color: '#3b82f6', borderColor: '#93c5fd' }} onClick={() => {
                  setEditingId(fabric._id);
                  setFormData({
                    name: fabric.name || '',
                    price: fabric.price || '',
                    desc: fabric.desc || '',
                    category: fabric.category || 'General',
                    imageUrl: fabric.imageUrl || '',
                    colors: fabric.colors && fabric.colors.length > 0 ? fabric.colors : [{ name: '', hex: '#000000', imageUrl: '' }],
                    allowedServices: fabric.allowedServices || []
                  });
                  setImageFile(null);
                  setColorImageFiles({});
                  setShowModal(true);
                }}>Edit</button>
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
            <h2>{editingId ? 'Edit Fabric' : 'Add New Fabric'}</h2>
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
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Allowed Services</label>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' }}>Select which services this fabric is available for. Leave empty to allow for all services.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {services.map(s => (
                    <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.allowedServices.includes(s.name)}
                        onChange={() => handleServiceToggle(s.name)}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0 }}>Color Variants</label>
                  <button type="button" onClick={addColor} style={{ background: '#e5e7eb', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>+ Add Color</button>
                </div>
                {formData.colors.map((color, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input type="text" placeholder="Color Name (e.g. Navy Blue)" className="form-control" value={color.name} onChange={(e) => handleColorChange(idx, 'name', e.target.value)} required style={{ flex: 2, margin: 0 }} />
                      <input type="color" className="form-control" value={color.hex} onChange={(e) => handleColorChange(idx, 'hex', e.target.value)} required style={{ flex: 1, padding: '0 0.5rem', margin: 0, height: '42px' }} />
                      {formData.colors.length > 1 && (
                        <button type="button" onClick={() => removeColor(idx)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="form-control" 
                        style={{ flex: 1, margin: 0, fontSize: '0.85rem' }} 
                        onChange={(e) => {
                          const newColorFiles = { ...colorImageFiles };
                          newColorFiles[idx] = e.target.files[0];
                          setColorImageFiles(newColorFiles);
                        }} 
                      />
                      <input 
                        type="url" 
                        placeholder="Or Image URL" 
                        className="form-control" 
                        value={color.imageUrl} 
                        onChange={(e) => handleColorChange(idx, 'imageUrl', e.target.value)} 
                        style={{ flex: 1, margin: 0, fontSize: '0.85rem' }} 
                        disabled={!!colorImageFiles[idx]}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setEditingId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Fabric' : 'Save Fabric'}</button>
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

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', description: '', basePrice: '', 
    collarStyles: '', sleeveStyles: '', frontStyles: '', bottomStyles: '', featuredImage: '', images: []
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/api/services');
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({ 
        name: service.name, 
        description: service.description || '', 
        basePrice: service.basePrice || '',
        collarStyles: service.customizations?.collarStyles?.join(', ') || '',
        sleeveStyles: service.customizations?.sleeveStyles?.join(', ') || '',
        frontStyles: service.customizations?.frontStyles?.join(', ') || '',
        bottomStyles: service.customizations?.bottomStyles?.join(', ') || '',
        featuredImage: service.featuredImage || '',
        images: service.images || []
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', basePrice: '', collarStyles: '', sleeveStyles: '', frontStyles: '', bottomStyles: '', featuredImage: '', images: [] });
    }
    setShowModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();

    const processArray = (str) => str ? str.split(',').map(s => s.trim()).filter(s => s) : [];

    const payload = {
      name: formData.name,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      customizations: {
        collarStyles: processArray(formData.collarStyles),
        sleeveStyles: processArray(formData.sleeveStyles),
        frontStyles: processArray(formData.frontStyles),
        bottomStyles: processArray(formData.bottomStyles),
      },
      featuredImage: formData.featuredImage,
      images: formData.images
    };

    try {
      if (editingService) {
        const { data } = await api.put(`/api/services/${editingService._id}`, payload);
        setServices(services.map(s => s._id === editingService._id ? data : s));
        toast.success('Service updated successfully');
      } else {
        const { data } = await api.post('/api/services', payload);
        setServices([data, ...services]);
        toast.success('Service created successfully');
      }
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    try {
      setImageUploading(true);
      const { data } = await api.post('/api/upload/reference-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success('Gallery image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
      e.target.value = null;
    }
  };

  const handleUploadFeaturedImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    try {
      setImageUploading(true);
      const { data } = await api.post('/api/upload/reference-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, featuredImage: data.url }));
      toast.success('Featured image uploaded');
    } catch (error) {
      toast.error('Failed to upload featured image');
    } finally {
      setImageUploading(false);
      e.target.value = null;
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/api/services/${id}`);
        setServices(services.filter(s => s._id !== id));
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  return (
    <AdminLayout title="Tailoring Services">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Available Services</h2>
        <button className="admin-btn-primary" onClick={() => handleOpenModal()}>+ Add New Service</button>
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="services-grid">
          {services.length > 0 ? (
            services.map(service => (
              <div key={service._id} className="admin-card service-card">
                {service.featuredImage && (
                  <img src={service.featuredImage} alt={service.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                )}
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <span className="price-tag">Rs. {service.basePrice.toLocaleString()}</span>
                </div>
                <p className="service-desc">{service.description}</p>
                <div className="service-actions">
                  <button 
                    className="btn-outline-gold" 
                    onClick={() => handleOpenModal(service)}
                  >
                    Edit Service
                  </button>
                  <button className="btn-outline danger" onClick={() => handleDeleteService(service._id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280' }}>No services available.</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Service Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                  placeholder="e.g. Kurta Shalwar"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Base Price (Rs.)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.basePrice}
                  onChange={e => setFormData({...formData, basePrice: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                  placeholder="e.g. 2500"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Featured Image (Main Card Image)</label>
                {formData.featuredImage && (
                  <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '0.5rem' }}>
                    <img src={formData.featuredImage} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleUploadFeaturedImage}
                  disabled={imageUploading}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px dashed #d1d5db' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Gallery Images (Detailed closeups)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <img src={imgUrl} alt={`Service gallery image ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage(idx)}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  ))}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={imageUploading}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px dashed #d1d5db' }}
                />
                {imageUploading && <span style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '0.25rem', display: 'block' }}>Uploading image...</span>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minHeight: '60px', fontFamily: 'inherit' }}
                  placeholder="Short description of the service..."
                />
              </div>

              <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#374151' }}>Customization Options (Comma-separated)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#6b7280' }}>Collar Styles</label>
                    <input 
                      type="text" 
                      value={formData.collarStyles}
                      onChange={e => setFormData({...formData, collarStyles: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                      placeholder="Ban, Sherwani, Collar..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#6b7280' }}>Sleeve Styles</label>
                    <input 
                      type="text" 
                      value={formData.sleeveStyles}
                      onChange={e => setFormData({...formData, sleeveStyles: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                      placeholder="Cuff, Open..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#6b7280' }}>Front Styles</label>
                    <input 
                      type="text" 
                      value={formData.frontStyles}
                      onChange={e => setFormData({...formData, frontStyles: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                      placeholder="Hidden Placket, Visible..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#6b7280' }}>Bottom Styles</label>
                    <input 
                      type="text" 
                      value={formData.bottomStyles}
                      onChange={e => setFormData({...formData, bottomStyles: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                      placeholder="Straight Shalwar, Pajama..."
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1 }}>
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .service-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .service-header h3 {
          margin: 0;
          font-size: 1.15rem;
          color: #111827;
        }

        .price-tag {
          background: #f3f4f6;
          color: #374151;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .service-desc {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 2rem;
          flex: 1;
        }

        .service-actions {
          display: flex;
          gap: 0.75rem;
          border-top: 1px solid #e5e7eb;
          padding-top: 1.25rem;
        }

        .btn-outline {
          flex: 1;
          background: transparent;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-outline.danger {
          color: #dc2626;
        }

        .btn-outline.danger:hover {
          background: #fef2f2;
          border-color: #f87171;
        }

        .btn-outline-gold {
          flex: 1;
          background: transparent;
          border: 1px solid #C9A96E;
          color: #b48e4b;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-gold:hover {
          background: rgba(201, 169, 110, 0.1);
          color: #92733c;
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
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
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

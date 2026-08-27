import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminPortfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kameez Shalwar');
  const [altText, setAltText] = useState('');
  const [description, setDescription] = useState('');
  const [featuredOnHome, setFeaturedOnHome] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Kameez Shalwar', 'Kurta Shalwar', 'Kurta Pajama', 'Waistcoat', 'Zardari Suit', 'Shirt', 'General Craftsmanship'];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/portfolio');
      setItems(data);
    } catch (error) {
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Kameez Shalwar');
    setAltText('');
    setDescription('');
    setFeaturedOnHome(true);
    setSortOrder(0);
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCategory(item.category || 'Kameez Shalwar');
    setAltText(item.altText || '');
    setDescription(item.description || '');
    setFeaturedOnHome(item.featuredOnHome !== false);
    setSortOrder(item.sortOrder || 0);
    setImageFile(null);
    setImageUrl(item.imageUrl || '');
    setImagePreview(item.imageUrl || '');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!imageFile && !imageUrl && !editingItem) {
      toast.error('Please upload an image or provide an Image URL');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('altText', altText || title);
      formData.append('description', description);
      formData.append('featuredOnHome', featuredOnHome);
      formData.append('sortOrder', sortOrder);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      if (editingItem) {
        await api.put(`/api/portfolio/${editingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Portfolio item updated successfully!');
      } else {
        await api.post('/api/portfolio', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('New portfolio picture added!');
      }

      setModalOpen(false);
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save portfolio item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from the portfolio?`)) return;
    try {
      await api.delete(`/api/portfolio/${id}`);
      toast.success('Portfolio item deleted');
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const toggleFeatured = async (item) => {
    try {
      const newStatus = !item.featuredOnHome;
      const { data } = await api.put(`/api/portfolio/${item._id}`, { featuredOnHome: newStatus });
      setItems(items.map(i => i._id === item._id ? data : i));
      toast.success(newStatus ? 'Added to Homepage Slider!' : 'Removed from Homepage Slider');
    } catch (error) {
      toast.error('Failed to update homepage status');
    }
  };

  return (
    <AdminLayout title="Portfolio Management">
      <div style={{ padding: '1.5rem 0' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--onyx)', margin: 0 }}>Portfolio & Homepage Slider</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Add, edit, or delete gallery pictures. Items marked "Featured on Homepage" automatically sync to the homepage slider!
            </p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem' }}>
            <span>➕</span> Add New Portfolio Image
          </button>
        </div>

        {/* Content Table / Grid */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ color: '#64748b' }}>Loading portfolio gallery...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🖼️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--onyx)', marginBottom: '0.5rem' }}>No Custom Portfolio Pictures Yet</h3>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Add your first image to customize your website gallery and homepage slider!
            </p>
            <button onClick={openAddModal} className="btn btn-primary">➕ Add First Portfolio Picture</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {items.map((item) => (
              <div key={item._id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', position: 'relative', background: '#f8fafc', overflow: 'hidden' }}>
                  <img src={item.imageUrl} alt={item.altText || item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => toggleFeatured(item)}
                      style={{
                        background: item.featuredOnHome ? '#10b981' : 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      title="Click to toggle Homepage Slider visibility"
                    >
                      {item.featuredOnHome ? '✓ Home Slider' : 'Hidden on Home'}
                    </button>
                  </div>
                  <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#f8fafc', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                    {item.category}
                  </span>
                </div>

                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--onyx)', margin: '0 0 0.5rem 0' }}>{item.title}</h3>
                  
                  {/* SEO Alt Text Tag Preview */}
                  <div style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', marginBottom: '1rem', wordBreak: 'break-word' }}>
                    <strong style={{ color: '#0284c7' }}>SEO Alt:</strong> "{item.altText || item.title}"
                  </div>

                  {item.description && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0', flex: 1 }}>{item.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => openEditModal(item)}
                      style={{ flex: 1, padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--onyx)' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.title)}
                      style={{ flex: 1, padding: '8px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Portfolio Item */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setModalOpen(false)}>
            <div style={{ background: 'white', borderRadius: '14px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--onyx)' }}>
                  {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Image'}
                </h2>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                {/* Image Upload / Preview */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--onyx)', marginBottom: '0.5rem' }}>Image File or URL</label>
                  
                  {imagePreview && (
                    <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '0.75rem' }}
                  />

                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', margin: '0.25rem 0' }}>— OR ENTER IMAGE URL —</div>

                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Title */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--onyx)', marginBottom: '0.5rem' }}>Garment / Image Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Bespoke Kameez Shalwar"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Category & Sort Order */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--onyx)', marginBottom: '0.5rem' }}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', background: 'white' }}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--onyx)', marginBottom: '0.5rem' }}>Display Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* SEO Image Alt Text */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--onyx)', marginBottom: '0.25rem' }}>
                    🔍 Image Alt Text (SEO Purpose)
                  </label>
                  <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 0.5rem 0' }}>
                    Helps your portfolio images rank on Google Image Search (e.g., "Custom stitched kameez shalwar in Hyderabad Pakistan").
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Best tailor stitched men's kameez shalwar design in Pakistan"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--onyx)', marginBottom: '0.5rem' }}>Short Description (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="Brief detail about fabric or stitching style..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  ></textarea>
                </div>

                {/* Featured on Home Toggle */}
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--onyx)', display: 'block' }}>Display on Homepage Slider</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>If enabled, this image will automatically slide on the homepage.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featuredOnHome}
                    onChange={(e) => setFeaturedOnHome(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                    {submitting ? 'Saving...' : (editingItem ? 'Update Image' : 'Save Image')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

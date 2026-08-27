import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: null,
    title: '',
    slug: '',
    content: '',
    summary: '',
    featuredImage: '',
    altText: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
    fetchAnalytics();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/blogs'); // Admin gets all by default
      setBlogs(res.data.blogs || []);
    } catch (error) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await api.get('/api/admin/blogs/analytics');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to fetch blog analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      title: '',
      slug: '',
      content: '',
      summary: '',
      featuredImage: '',
      altText: '',
      tags: '',
      metaTitle: '',
      metaDescription: '',
      status: 'draft'
    });
    setShowForm(false);
  };

  const handleEdit = (blog) => {
    setFormData({
      ...blog,
      tags: blog.tags ? blog.tags.join(', ') : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.delete(`/api/blogs/${id}`);
      toast.success('Blog deleted');
      fetchBlogs();
      fetchAnalytics();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      if (formData._id) {
        await api.put(`/api/blogs/${formData._id}`, payload);
        toast.success('Blog updated successfully');
      } else {
        await api.post('/api/blogs', payload);
        toast.success('Blog created successfully & customers notified!');
      }
      fetchBlogs();
      fetchAnalytics();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save blog');
    }
  };

  const handleInlineImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await api.post('/api/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data.url;
      setFormData(prev => ({
        ...prev,
        content: prev.content + `\n\n![Image description](${imageUrl})\n\n`
      }));
      toast.success('Image added to content!');
    } catch (error) {
      console.error('Image upload failed:', error.response?.data || error);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = null;
    }
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFeaturedImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await api.post('/api/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, featuredImage: res.data.url }));
      toast.success('Featured image uploaded!');
    } catch (error) {
      toast.error('Failed to upload featured image');
    } finally {
      setUploadingFeaturedImage(false);
      e.target.value = null;
    }
  };

  return (
    <AdminLayout title="Blog Analytics & Management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 className="premium-title" style={{ marginBottom: '0.25rem' }}>Blog Analytics & SEO</h2>
            <p style={{ color: 'var(--stone)', fontSize: '0.9rem', margin: 0 }}>Real-time reader engagement, view counts, likes, and social shares</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowForm(!showForm); }}
          >
            {showForm ? '← Back to Overview' : '+ Create New Article'}
          </button>
        </div>

        {/* Analytics Cards Header Grid */}
        {!showForm && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>👁️ TOTAL VIEWS</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0 0 0', color: '#0f172a' }}>
                {loadingAnalytics ? '...' : (analytics?.totalViews || 0).toLocaleString()}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Real-time reader visits</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>❤️ TOTAL LIKES</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0 0 0', color: '#dc2626' }}>
                {loadingAnalytics ? '...' : (analytics?.totalLikes || 0).toLocaleString()}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer appreciations</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>📤 SOCIAL SHARES</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0 0 0', color: '#2563eb' }}>
                {loadingAnalytics ? '...' : (analytics?.totalShares || 0).toLocaleString()}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>WhatsApp/Social shares</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>📰 PUBLISHED ARTICLES</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0 0 0', color: '#059669' }}>
                {loadingAnalytics ? '...' : (analytics?.totalPublished || 0).toLocaleString()}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{analytics?.totalDrafts || 0} Drafts pending</span>
            </div>

          </div>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit} className="luxury-card" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            
            {/* Main Content Area */}
            <div>
              <h3>{formData._id ? 'Edit Post' : 'New Post'}</h3>
              
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug (leave blank to auto-generate)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="e.g., best-kurta-designs-2026"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Summary / Excerpt</label>
                <textarea 
                  className="form-input" 
                  rows="2"
                  value={formData.summary} 
                  onChange={e => setFormData({...formData, summary: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content (Markdown Supported) *</label>
                <p style={{ fontSize: '0.85rem', color: 'var(--stone)', marginBottom: '0.5rem' }}>
                  Use # for H1, ## for H2, **bold**, *italic*, [text](link).
                </p>
                <textarea 
                  className="form-input" 
                  rows="15"
                  required
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}
                />
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--stone)' }}>
                    {uploadingImage ? 'Uploading...' : 'Insert Image into Content:'}
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleInlineImageUpload}
                    disabled={uploadingImage}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Settings Area */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Publish Settings</h4>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-input" 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <h4 style={{ margin: '2rem 0 1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>SEO Settings</h4>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="form-label">Meta Title</label>
                  <span style={{ fontSize: '0.75rem', color: formData.metaTitle.length > 60 ? 'red' : 'gray' }}>
                    {formData.metaTitle.length} / 60
                  </span>
                </div>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.metaTitle} 
                  onChange={e => setFormData({...formData, metaTitle: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="form-label">Meta Description</label>
                  <span style={{ fontSize: '0.75rem', color: formData.metaDescription.length > 160 ? 'red' : 'gray' }}>
                    {formData.metaDescription.length} / 160
                  </span>
                </div>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={formData.metaDescription} 
                  onChange={e => setFormData({...formData, metaDescription: e.target.value})} 
                />
              </div>

              <h4 style={{ margin: '2rem 0 1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Featured Media</h4>

              <div className="form-group">
                <label className="form-label">Featured Image URL</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.featuredImage} 
                  onChange={e => setFormData({...formData, featuredImage: e.target.value})} 
                  placeholder="https://..."
                />
                
                <div style={{ marginTop: '0.5rem' }}>
                  <label className="btn btn-outline" style={{ display: 'inline-block', width: '100%', textAlign: 'center', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {uploadingFeaturedImage ? 'Uploading Image...' : '📁 Upload Local File'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFeaturedImageUpload}
                      disabled={uploadingFeaturedImage}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                
                {formData.featuredImage && (
                  <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={formData.featuredImage} alt="Featured Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Image Alt Text (SEO)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.altText} 
                  onChange={e => setFormData({...formData, altText: e.target.value})} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})} 
                  placeholder="e.g. fashion, weddings"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {formData._id ? 'Update Post' : 'Save & Publish Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="luxury-card">
            {loading ? (
              <p>Loading blogs & analytics...</p>
            ) : blogs.length === 0 ? (
              <p>No blog posts found. Create your first post to boost SEO and customer engagement!</p>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ivory-border)' }}>
                    <th style={{ padding: '1rem 0' }}>Article Title</th>
                    <th>Status</th>
                    <th>Views 👁️</th>
                    <th>Likes ❤️</th>
                    <th>Shares 📤</th>
                    <th>Read Time</th>
                    <th>Published Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog._id} style={{ borderBottom: '1px solid var(--ivory-border)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 600, color: 'var(--charcoal)', maxWidth: '280px' }}>
                        <div>{blog.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>/{blog.slug}</div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '99px', 
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: blog.status === 'published' ? '#dcfce7' : '#f1f5f9',
                          color: blog.status === 'published' ? '#166534' : '#475569'
                        }}>
                          {blog.status}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{(blog.viewsCount || 0).toLocaleString()}</strong>
                      </td>
                      <td>
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>{(blog.likesCount || 0).toLocaleString()}</span>
                      </td>
                      <td>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>{(blog.sharesCount || 0).toLocaleString()}</span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                        📖 {blog.readTimeMinutes || 2} min
                      </td>
                      <td style={{ color: 'var(--stone)', fontSize: '0.85rem' }}>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button onClick={() => handleEdit(blog)} className="btn btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}>Edit</button>
                          <button onClick={() => handleDelete(blog._id)} className="btn btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem', color: 'red', borderColor: 'red' }}>Delete</button>
                          {blog.status === 'published' && (
                            <button onClick={() => navigate(`/blog/${blog.slug}`)} className="btn btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}>View</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
    </AdminLayout>
  );
}

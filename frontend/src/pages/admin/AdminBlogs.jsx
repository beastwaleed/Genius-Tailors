import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
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
        toast.success('Blog created successfully');
      }
      fetchBlogs();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save blog');
    }
  };

  return (
    <AdminLayout title="Blog & SEO Management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="premium-title" style={{ marginBottom: 0 }}>SEO Articles</h2>
          <button 
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowForm(!showForm); }}
          >
            {showForm ? '← Back to List' : '+ Create New Post'}
          </button>
        </div>

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
                  style={{ fontFamily: 'monospace' }}
                />
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
                  rows="4"
                  value={formData.metaDescription} 
                  onChange={e => setFormData({...formData, metaDescription: e.target.value})} 
                />
              </div>

              <h4 style={{ margin: '2rem 0 1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Media</h4>
              <div className="form-group">
                <label className="form-label">Featured Image URL</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.featuredImage} 
                  onChange={e => setFormData({...formData, featuredImage: e.target.value})} 
                />
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
                {formData._id ? 'Update Post' : 'Save Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="luxury-card">
            {loading ? (
              <p>Loading blogs...</p>
            ) : blogs.length === 0 ? (
              <p>No blog posts found. Create your first post to boost SEO!</p>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ivory-border)' }}>
                    <th style={{ padding: '1rem 0' }}>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map(blog => (
                    <tr key={blog._id} style={{ borderBottom: '1px solid var(--ivory-border)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 500 }}>{blog.title}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '99px', 
                          fontSize: '0.85rem',
                          background: blog.status === 'published' ? '#dcfce7' : '#f1f5f9',
                          color: blog.status === 'published' ? '#166534' : '#475569'
                        }}>
                          {blog.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--stone)' }}>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(blog)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>Edit</button>
                          <button onClick={() => handleDelete(blog._id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', color: 'red', borderColor: 'red' }}>Delete</button>
                          {blog.status === 'published' && (
                            <button onClick={() => navigate(`/blog/${blog.slug}`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>View</button>
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

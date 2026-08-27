import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const fetchAndTrackBlog = async () => {
      try {
        const res = await api.get(`/api/blogs/${slug}`);
        setBlog(res.data);
        setLikeCount(res.data.likesCount || 0);
        setShareCount(res.data.sharesCount || 0);
        setViewCount(res.data.viewsCount || 0);

        // Check local storage for like state
        if (localStorage.getItem(`blog_liked_${res.data._id}`)) {
          setLiked(true);
        }

        // Record real view count in API
        try {
          const viewRes = await api.post(`/api/blogs/${slug}/view`);
          if (viewRes.data.viewsCount) {
            setViewCount(viewRes.data.viewsCount);
          }
        } catch (vErr) {
          console.warn('View tracking silent catch:', vErr);
        }
      } catch (error) {
        console.error('Failed to load blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTrackBlog();
  }, [slug]);

  const handleLike = async () => {
    if (!blog || liked) return;
    try {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      localStorage.setItem(`blog_liked_${blog._id}`, 'true');
      const res = await api.post(`/api/blogs/${blog._id}/like`);
      if (res.data.likesCount) {
        setLikeCount(res.data.likesCount);
      }
      toast.success('Thank you for liking this article!');
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleShare = async (platform) => {
    if (!blog) return;
    const url = window.location.href;
    const text = `Check out this article on Genius Tailors: ${blog.title}`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Article link copied to clipboard!');
    }

    // Increment share analytics counter
    try {
      const res = await api.post(`/api/blogs/${blog._id}/share`);
      if (res.data.sharesCount) {
        setShareCount(res.data.sharesCount);
      }
    } catch (e) {
      console.warn('Share analytics catch:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="container" style={{ flex: 1, textAlign: 'center', paddingTop: '10rem' }}>
          <h2>Blog Post Not Found</h2>
          <p>The article you are looking for does not exist or has been removed.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>Return Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.metaTitle || blog.title}</title>
        <meta name="description" content={blog.metaDescription || blog.summary || 'Read this latest article on Genius Tailors.'} />
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.summary} />
        {blog.featuredImage && <meta property="og:image" content={blog.featuredImage} />}
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ivory)' }}>
        <Navbar />
        
        <article className="container" style={{ flex: 1, paddingTop: 'calc(var(--nav-height) + 3rem)', paddingBottom: '5rem', maxWidth: '820px', margin: '0 auto' }}>
          
          <Link to="/blogs" style={{ color: 'var(--stone)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            ← Back to all posts
          </Link>

          <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            {blog.tags && blog.tags.length > 0 && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {blog.tags.map(tag => (
                  <span key={tag} style={{ background: '#f1f5f9', color: '#334155', padding: '0.25rem 0.85rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="text-heading-1" style={{ marginBottom: '1.2rem', lineHeight: 1.25 }}>{blog.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: 'var(--stone)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
              <span>Published {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>•</span>
              <span>📖 {blog.readTimeMinutes || 2} min read</span>
              <span>•</span>
              <span>👁️ {viewCount} Views</span>
            </div>
          </header>

          {blog.featuredImage && (
            <figure style={{ margin: '0 0 3rem 0' }}>
              <img 
                src={blog.featuredImage} 
                alt={blog.altText || blog.title} 
                style={{ width: '100%', borderRadius: '14px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', maxHeight: '480px', objectFit: 'cover' }}
              />
            </figure>
          )}

          {/* Render Markdown Content */}
          <div className="blog-content">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>

          {/* Real Analytics & Engagement Section */}
          <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              
              {/* Like Button */}
              <button 
                onClick={handleLike}
                disabled={liked}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '99px',
                  border: liked ? 'none' : '2px solid #ef4444',
                  background: liked ? '#ef4444' : 'transparent',
                  color: liked ? '#ffffff' : '#ef4444',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: liked ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{liked ? '❤️ Liked' : '🤍 Like Article'}</span>
                <span style={{ background: liked ? 'rgba(255,255,255,0.2)' : '#fee2e2', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.85rem' }}>
                  {likeCount}
                </span>
              </button>

              {/* Views Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.95rem', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span>👁️ <strong>{viewCount}</strong> Total Reads</span>
                <span>•</span>
                <span>📤 <strong>{shareCount}</strong> Shares</span>
              </div>

            </div>

            {/* Social Share Buttons */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 1rem 0', fontWeight: 700, color: 'var(--charcoal)', fontSize: '0.95rem' }}>
                Found this article helpful? Share with friends:
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleShare('whatsapp')} style={{ background: '#25D366', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  📲 WhatsApp
                </button>
                <button onClick={() => handleShare('facebook')} style={{ background: '#1877F2', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  📘 Facebook
                </button>
                <button onClick={() => handleShare('twitter')} style={{ background: '#000000', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  𝕏 Twitter / X
                </button>
                <button onClick={() => handleShare('copy')} style={{ background: '#64748b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  📋 Copy Link
                </button>
              </div>
            </div>
          </div>

        </article>

        <Footer />

        <style>{`
          .blog-content {
            font-size: 1.15rem;
            line-height: 1.85;
            color: var(--onyx);
          }
          .blog-content p {
            margin-bottom: 1.6rem;
          }
          .blog-content h2, .blog-content h3 {
            font-family: var(--font-serif);
            margin: 2.5rem 0 1rem;
            color: var(--charcoal);
          }
          .blog-content a {
            color: var(--gold);
            text-decoration: underline;
          }
          .blog-content ul, .blog-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
          }
          .blog-content li {
            margin-bottom: 0.5rem;
          }
          .blog-content blockquote {
            border-left: 4px solid var(--gold);
            padding-left: 1rem;
            margin: 2rem 0;
            font-style: italic;
            color: var(--stone);
          }
        `}</style>
      </div>
    </>
  );
}

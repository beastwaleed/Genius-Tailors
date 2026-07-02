import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/api/blogs/${slug}`);
        setBlog(res.data);
      } catch (error) {
        console.error('Failed to load blog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading post...</p>
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
        {/* Open Graph Meta Tags for Social Sharing */}
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.summary} />
        {blog.featuredImage && <meta property="og:image" content={blog.featuredImage} />}
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ivory)' }}>
        <Navbar />
        
        {/* Semantic HTML: <article> */}
        <article className="container" style={{ flex: 1, paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '5rem', maxWidth: '800px', margin: '0 auto' }}>
          
          <Link to="/blogs" style={{ color: 'var(--stone)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
            ← Back to all posts
          </Link>

          <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
            {blog.tags && blog.tags.length > 0 && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {blog.tags.map(tag => (
                  <span key={tag} style={{ background: 'var(--ivory-border)', color: 'var(--onyx)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="text-heading-1" style={{ marginBottom: '1rem' }}>{blog.title}</h1>
            <time style={{ color: 'var(--stone)', fontSize: '0.95rem' }}>
              Published on {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </header>

          {blog.featuredImage && (
            <figure style={{ margin: '0 0 3rem 0' }}>
              <img 
                src={blog.featuredImage} 
                alt={blog.altText || blog.title} 
                style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-md)', maxHeight: '450px', objectFit: 'cover' }}
              />
            </figure>
          )}

          {/* Render Markdown Content */}
          <div className="blog-content">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>

        </article>

        <Footer />

        <style>{`
          .blog-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--onyx);
          }
          .blog-content p {
            margin-bottom: 1.5rem;
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

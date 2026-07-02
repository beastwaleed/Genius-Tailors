import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Only fetch published blogs for the public view
        const res = await api.get('/api/blogs?status=published');
        setBlogs(res.data.blogs || []);
      } catch (error) {
        console.error('Failed to load blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <>
      <Helmet>
        <title>Read the Latest from Genius Tailors | Blog</title>
        <meta name="description" content="Discover the latest trends in men's fashion, traditional tailoring, and styling tips from the master tailors at Genius Tailors, Pakistan." />
      </Helmet>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ivory)' }}>
        <Navbar />

        <section style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '5rem', flex: 1 }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="text-label" style={{ color: 'var(--onyx)' }}>Our Journal</span>
              <h1 className="text-heading-1" style={{ marginTop: '0.5rem' }}>Tailoring & Style Insights</h1>
              <p className="text-subtitle" style={{ maxWidth: '600px', margin: '1rem auto 0', color: 'var(--stone)' }}>
                Expert guides, styling tips, and the latest trends in traditional menswear.
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading articles...</div>
            ) : blogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--stone)' }}>
                No articles published yet. Check back soon!
              </div>
            ) : (
              <div className="blog-grid">
                {blogs.map(blog => (
                  <Link key={blog._id} to={`/blog/${blog.slug}`} className="blog-card luxury-card">
                    {blog.featuredImage && (
                      <div className="blog-card-img-wrap">
                        <img src={blog.featuredImage} alt={blog.altText || blog.title} className="blog-card-img" />
                      </div>
                    )}
                    <div className="blog-card-content">
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {blog.tags && blog.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="blog-tag">{tag}</span>
                        ))}
                      </div>
                      <h2 className="blog-title">{blog.title}</h2>
                      <p className="blog-summary">{blog.summary}</p>
                      <div className="blog-footer">
                        <span>Read Article →</span>
                        <time>{new Date(blog.createdAt).toLocaleDateString()}</time>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />

        <style>{`
          .blog-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2.5rem;
          }
          .blog-card {
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .blog-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
          }
          .blog-card-img-wrap {
            width: 100%;
            height: 220px;
            overflow: hidden;
          }
          .blog-card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
          }
          .blog-card:hover .blog-card-img {
            transform: scale(1.05);
          }
          .blog-card-content {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          .blog-tag {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--charcoal);
            background: var(--ivory-border);
            padding: 0.25rem 0.6rem;
            border-radius: 4px;
            font-weight: 600;
          }
          .blog-title {
            font-family: var(--font-serif);
            font-size: 1.35rem;
            color: var(--onyx);
            margin-bottom: 0.75rem;
            line-height: 1.4;
          }
          .blog-summary {
            color: var(--stone);
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
            flex: 1;
          }
          .blog-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid var(--ivory-border);
            padding-top: 1rem;
            font-size: 0.85rem;
            color: var(--stone-light);
            font-weight: 500;
          }
          .blog-footer span {
            color: var(--gold);
          }
        `}</style>
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import api from '../api';

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/portfolio')
      .then(res => {
        if (Array.isArray(res.data)) {
          const formatted = res.data.map(p => ({
            id: p._id,
            src: p.imageUrl,
            title: p.title,
            category: p.category
          }));
          setItems(formatted);
        }
      })
      .catch(err => {
        console.error('Failed to load portfolio API:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Portfolio | Premium Tailoring Gallery | Genius Tailors</title>
        <meta name="description" content="View the portfolio of Genius Tailors. Discover our finely stitched bespoke garments including Kameez Shalwar, Kurta Shalwar, and Waistcoats in Pakistan." />
      </Helmet>
      <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '4rem', flex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="text-label" style={{ color: 'var(--onyx)' }}>Our Craftsmanship</span>
            <h1 className="text-heading-1" style={{ marginTop: '0.5rem' }}>The Portfolio</h1>
            <p className="text-subtitle" style={{ maxWidth: '600px', margin: '1rem auto 0' }}>
              A gallery of our finest bespoke garments, crafted for gentlemen who appreciate the art of tailoring and exact precision.
            </p>
          </div>

          {items.length > 0 ? (
            <div className="portfolio-page-grid">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="portfolio-item">
                  <img src={item.src} alt={item.title} />
                  <div className="portfolio-item-overlay">
                    <span>{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--stone)' }}>
              <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-sans)' }}>
                {loading ? 'Loading portfolio gallery...' : 'No portfolio images uploaded yet.'}
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h3 className="text-heading-2" style={{ marginBottom: '1rem' }}>Impressed by our work?</h3>
            <Link to="/services" className="btn btn-primary btn-lg">Start Your Order Now</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .portfolio-page-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .portfolio-item {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          height: 480px;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .portfolio-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .portfolio-item:hover img {
          transform: scale(1.05);
        }

        .portfolio-item-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          padding: 2rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .portfolio-item:hover .portfolio-item-overlay {
          opacity: 1;
        }

        .portfolio-item-overlay span {
          color: white;
          font-family: var(--font-serif);
          font-size: 1.5rem;
          letter-spacing: 0.02em;
        }

        @media (max-width: 1024px) {
          .portfolio-page-grid { grid-template-columns: repeat(2, 1fr); }
          .portfolio-item { height: 400px; }
        }

        @media (max-width: 640px) {
          .portfolio-page-grid { grid-template-columns: 1fr; }
          .portfolio-item { height: 380px; }
          .portfolio-item-overlay { opacity: 1; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%); padding: 1.5rem; }
          .portfolio-item-overlay span { font-size: 1.25rem; }
        }
      `}</style>
      </div>
    </>
  );
}

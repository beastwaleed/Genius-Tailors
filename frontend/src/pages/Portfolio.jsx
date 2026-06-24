import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import img1 from '../assets/port_model_shalwar_1781781002030.png';
import img2 from '../assets/port_mannequin_waistcoat_1781781013926.png';
import img3 from '../assets/port_model_kurta_1781781028618.png';
import img4 from '../assets/port_mannequin_kurta_1781781041804.png';
import img5 from '../assets/port_detail_stitch_1781781054620.png';
import img6 from '../assets/port_model_classic_1781781070827.png';

// Since we have a limited set of images for the demo, we duplicate a few to fill out the grid nicely
const PORTFOLIO_IMAGES = [
  { id: 1, src: img1, title: 'Bespoke Kameez Shalwar' },
  { id: 2, src: img2, title: 'Premium Waistcoat Display' },
  { id: 3, src: img3, title: 'Evening Kurta Pajama' },
  { id: 4, src: img4, title: 'Classic Kurta Shalwar' },
  { id: 5, src: img5, title: 'Tailoring Details' },
  { id: 6, src: img6, title: 'Signature Cut' },
  { id: 7, src: img1, title: 'Traditional Details' },
  { id: 8, src: img3, title: 'Casual Refined' },
  { id: 9, src: img4, title: 'Event Wear' },
];

export default function Portfolio() {
  return (
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

          <div className="portfolio-page-grid">
            {PORTFOLIO_IMAGES.map((item, idx) => (
              <div key={idx} className="portfolio-item">
                <img src={item.src} alt={item.title} />
                <div className="portfolio-item-overlay">
                  <span>{item.title}</span>
                </div>
              </div>
            ))}
          </div>

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
  );
}

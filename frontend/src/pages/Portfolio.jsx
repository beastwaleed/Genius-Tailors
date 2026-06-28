import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

import ShalwarKameezFeaturedImage from '../assets/ShalwarKameezFeaturedImage.jpeg'
import ShalwarKameezGallery0 from '../assets/ShalwarKameezGallery0.jpeg';
import ShalwarKameezGallery1 from '../assets/ShalwarKameezGallery1.jpeg';
import ShalwarKameezGallery2 from '../assets/ShalwarKameezGallery2.jpeg';
import MainShalwarKameez from '../assets/MainShalwarKameez.jpeg'

import HeroKurtaPajama from '../assets/HeroKurtaPajama.jpeg'
import kurtaShalwarFeatured from '../assets/kurtaShalwarFeatured.jpeg'
import angularEdgeMain from '../assets/AngularEdgeMain.jpeg'
import angularEdge01 from '../assets/AngularEdge01.jpeg'
import angularEdge02 from '../assets/AngularEdge02.jpeg'

import WaistcoatFront from '../assets/waistcoatfront.jpeg'
import WaistcoatV from '../assets/V collar waistcoat.jpeg';
import WaistcoatRound from '../assets/round neck collar waistcoat.jpeg';
import WaistcoatSherwani from '../assets/sherwani collar waistcoat.jpeg';

import urbanCoreMain from '../assets/UrbanCoreMain.jpeg'
import urbanCore01 from '../assets/UrbanCore01.jpeg'
import urbanCore02 from '../assets/UrbanCore02.jpeg'
import royalSlateClassicMain from '../assets/RoyalSlateClassicMain.jpeg'
import royalSlateClassic01 from '../assets/RoyalSlateClassic01.jpeg'

const PORTFOLIO_IMAGES = [
  { id: 1, src: ShalwarKameezFeaturedImage, title: 'Classic Kameez Shalwar' },
  { id: 2, src: angularEdgeMain, title: 'Angular Edge Design' },
  { id: 3, src: urbanCoreMain, title: 'Urban Core Zardari Suit' },
  { id: 4, src: WaistcoatFront, title: 'Premium Waistcoat' },
  { id: 5, src: HeroKurtaPajama, title: 'Kurta Pajama Fit' },
  { id: 6, src: ShalwarKameezGallery0, title: 'Kameez Shalwar Detail' },
  { id: 7, src: ShalwarKameezGallery1, title: 'Precision Stitching' },
  { id: 8, src: ShalwarKameezGallery2, title: 'Fabric Quality' },
  { id: 9, src: MainShalwarKameez, title: 'Traditional Elegance' },
  { id: 10, src: angularEdge01, title: 'Angular Edge Cut' },
  { id: 11, src: angularEdge02, title: 'Modern Silhouette' },
  { id: 12, src: kurtaShalwarFeatured, title: 'Kurta Shalwar Style' },
  { id: 13, src: WaistcoatV, title: 'V-Collar Waistcoat' },
  { id: 14, src: WaistcoatRound, title: 'Round Neck Waistcoat' },
  { id: 15, src: WaistcoatSherwani, title: 'Sherwani Collar' },
  { id: 16, src: urbanCore01, title: 'Zardari Suit Cut' },
  { id: 17, src: urbanCore02, title: 'Signature Finish' },
  { id: 18, src: royalSlateClassicMain, title: 'Royal Slate Classic' },
  { id: 19, src: royalSlateClassic01, title: 'Premium Royal Fit' },
];

export default function Portfolio() {
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
    </>
  );
}

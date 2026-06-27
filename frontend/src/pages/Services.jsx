import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Garment images

// --- Hero images (user's own uploads) --- use fallback if missing
const tryImg = (heroImg, fallback) => {
  try { return heroImg; } catch { return fallback; }
};

import ShalwarKameezFeaturedImage from '../assets/ShalwarKameezFeaturedImage.jpeg'
import HeroKurtaPajama from '../assets/HeroKurtaPajama.jpeg'
import WaistcoatFront from '../assets/waistcoatfront.jpeg'
import zardariStyleMain from '../assets/ZardariStyleMain.jpeg'
import zardariStyle01 from '../assets/ZardariStyle01.jpeg'
import eliteAuraMain from '../assets/EliteAuraMain.jpeg'
import kurtaShalwarFeatured from '../assets/kurtaShalwarFeatured.jpeg'

import WaistcoatV from '../assets/V collar waistcoat.jpeg';
import WaistcoatRound from '../assets/round neck collar waistcoat.jpeg';
import WaistcoatSherwani from '../assets/sherwani collar waistcoat.jpeg';

// Close-up gallery images
import closeupCollar from '../assets/closeup_collar.png';
import closeupCuff from '../assets/closeup_cuff.png';
import closeupFabric from '../assets/closeup_fabric.png';
import closeupButtons from '../assets/closeup_buttons.png';

const gallery = [closeupCollar, closeupCuff, closeupFabric, closeupButtons];
const waistcoatGallery = [WaistcoatV, WaistcoatRound, WaistcoatSherwani];

import ShalwarKameezGallery0 from '../assets/ShalwarKameezGallery0.jpeg';
import ShalwarKameezGallery1 from '../assets/ShalwarKameezGallery1.jpeg';
import ShalwarKameezGallery2 from '../assets/ShalwarKameezGallery2.jpeg';
const shalwarKameezGallery = [ShalwarKameezGallery0, ShalwarKameezGallery1, ShalwarKameezGallery2];

import kurtaShalwar0 from '../assets/kurtaShalwar0.png';
import kurtaShalwar1 from '../assets/kurtaShalwar1.jpeg';
import kurtaShalwar2 from '../assets/kurtaShalwar2.jpeg';
const kurtaShalwarGallery = [kurtaShalwar0, kurtaShalwar1, kurtaShalwar2];

const ALL_SERVICES = [
  {
    id: 'kameez-shalwar',
    name: 'Kameez Shalwar',
    urdu: 'قمیض شلوار',
    tagline: 'The Timeless Pakistani Classic',
    desc: 'Our most-ordered garment. A perfectly fitted Kameez Shalwar is the foundation of every Pakistani wardrobe — comfortable for daily wear, sharp enough for formal events.',
    price: 'From Rs. 2,500',
    deliveryDays: '5–7 working days',
    img: ShalwarKameezFeaturedImage,
    badge: 'Most Popular',
    badgeColor: '#C9A96E',
    stars: 5,
    reviews: 184,
    category: 'Traditional',
    features: ['Custom collar styles', 'Choice of sleeve length', 'Front & pocket designs', 'Fitted or relaxed cut'],
    occasions: ['Daily wear', 'Office', 'Eid', 'Casual events'],
    images: shalwarKameezGallery,
  },
  {
    id: 'kurta-shalwar',
    name: 'Kurta Shalwar',
    urdu: 'کرتا شلوار',
    tagline: 'Relaxed, Refined, Everyday',
    desc: 'A shorter, lighter alternative. Our Kurta Shalwars are cut for comfort without sacrificing style — ideal for everyday wear and casual gatherings.',
    price: 'From Rs. 2,000',
    deliveryDays: '4–6 working days',
    img: kurtaShalwarFeatured,
    badge: 'Classic Choice',
    badgeColor: '#2E86C1',
    stars: 5,
    reviews: 96,
    category: 'Traditional',
    features: ['Mandarin or standard collar', 'Various hem lengths', 'Front design options', 'Light & breathable fabrics'],
    occasions: ['Daily wear', 'Casual outings', 'Family gatherings'],
    images: kurtaShalwarGallery,
  },
  {
    id: 'kurta-pajama',
    name: 'Kurta Pajama',
    urdu: 'کرتا پاجامہ',
    tagline: 'Evening Elegance',
    desc: 'An elegant ethnic option perfect for events, evenings, and festive wear. Tailored with precision to give you a sharp, distinguished look.',
    price: 'From Rs. 2,000',
    deliveryDays: '5–7 working days',
    img: HeroKurtaPajama,
    badge: 'Trending',
    badgeColor: '#27AE60',
    stars: 4,
    reviews: 112,
    category: 'Formal',
    features: ['Slim fit pajama options', 'Embroidered collar choices', 'Premium fabric selection', 'Button detailing'],
    occasions: ['Events', 'Evenings', 'Festive wear', 'Family Gatherings'],
    images: gallery,
  },
  {
    id: 'waistcoat',
    name: 'Waistcoat',
    urdu: 'واسکٹ',
    tagline: 'Sharp Layering for Any Look',
    desc: 'A well-cut waistcoat instantly elevates any outfit. Pair it with your Kameez Shalwar for a formal look or over a Kurta for a smart-casual ensemble.',
    price: 'From Rs. 2,000',
    deliveryDays: '4–6 working days',
    img: WaistcoatFront,
    badge: 'Best Companion',
    badgeColor: '#1A1A1A',
    stars: 5,
    reviews: 73,
    category: 'Formal',
    features: ['Single or double-breasted', 'Custom button design', 'Lining options', 'Pocket styles'],
    occasions: ['Formal events', 'Weddings', 'Office'],
    images: waistcoatGallery,
  },
  {
    id: 'kameez-shalwar-design',
    name: 'Kameez Shalwar Design',
    urdu: 'قمیض شلوار ڈیزائن',
    tagline: 'Custom Designed Masterpiece',
    desc: 'Take your Kameez Shalwar to the next level with our premium design options. Select from a range of exclusive patterns and cuts.',
    price: 'From Rs. 3,500',
    deliveryDays: '7–10 working days',
    img: eliteAuraMain,
    badge: 'Premium',
    badgeColor: '#8E44AD',
    stars: 5,
    reviews: 42,
    category: 'Designer',
    features: ['Exclusive design patterns', 'Premium stitching', 'Custom embroidery options', 'Perfect fit guarantee'],
    occasions: ['Weddings', 'Eid', 'Special Events'],
    images: shalwarKameezGallery,
  },
  {
    id: 'kurta-shalwar-design',
    name: 'Kurta Shalwar Design',
    urdu: 'کرتا شلوار ڈیزائن',
    tagline: 'Modern Designer Kurta',
    desc: 'A designer take on the classic Kurta Shalwar. Featuring unique cuts, elegant details, and a flawless finish for standing out.',
    price: 'From Rs. 3,000',
    deliveryDays: '7–10 working days',
    img: kurtaShalwarFeatured,
    badge: 'Trendy',
    badgeColor: '#E67E22',
    stars: 5,
    reviews: 38,
    category: 'Designer',
    features: ['Modern design cuts', 'Designer detailing', 'Breathable premium fabrics', 'Statement look'],
    occasions: ['Festivals', 'Parties', 'Evening events'],
    images: kurtaShalwarGallery,
  },
  {
    id: 'zardari-suit',
    name: 'Zardari Suit',
    urdu: 'زرداری سوٹ',
    tagline: 'Complete 3-Piece Suit',
    desc: 'The ultimate statement of power and elegance. A complete Kurta Shalwar and Waistcoat suit crafted from the exact same premium fabric.',
    price: 'From Rs. 5,000',
    deliveryDays: '8–12 working days',
    img: zardariStyleMain,
    badge: 'Signature',
    badgeColor: '#C0392B',
    stars: 5,
    reviews: 87,
    category: 'Formal',
    features: ['Matching fabric 3-piece', 'Perfectly coordinated look', 'Zardari style cut', 'Premium inner lining'],
    occasions: ['Weddings', 'Political events', 'High-profile gatherings'],
    images: [zardariStyleMain, zardariStyle01],
  }
];

const CATEGORIES = ['All', 'Traditional', 'Formal', 'Casual'];

export default function Services() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [servicesData, setServicesData] = useState(ALL_SERVICES);

  const scrollGrid = (direction, id) => {
    const el = document.getElementById(id);
    if (el) {
      const scrollAmount = el.clientWidth;
      el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    api.get('/api/services')
      .then(res => {
        const dbServices = res.data;
        const merged = ALL_SERVICES.map(staticSvc => {
          const dbSvc = dbServices.find(s => s.name.toLowerCase() === staticSvc.name.toLowerCase());
          if (dbSvc) {
            return {
              ...staticSvc,
              img: staticSvc.img,
              images: staticSvc.images,
              price: `From Rs. ${dbSvc.basePrice.toLocaleString()}`,
              desc: dbSvc.description || staticSvc.desc,
            };
          }
          return staticSvc;
        });
        setServicesData(merged);
      })
      .catch(err => console.error('Failed to fetch services config', err));
  }, []);

  const displayed = filter === 'All'
    ? servicesData
    : servicesData.filter(s => s.category === filter);

  const handleOpenModal = (svc) => {
    setSelected(svc);
    setActiveImage(svc.img);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      <Navbar />

      {/* ── Page Hero ── */}
      <section className="services-page-hero">
        <div className="container">
          <p className="text-label" style={{ marginBottom: '1rem' }}>ہماری خدمات — Our Services</p>
          <h1 className="text-heading-1">Everything We Stitch,<br /><em style={{ fontStyle: 'italic', color: 'var(--stone)' }}>Made for You</em></h1>
          <p className="text-subtitle" style={{ marginTop: '1rem', maxWidth: '520px' }}>
            Four signature garments. All handmade. All stitched to your exact body measurements.
            No guessing, no standard sizes — only a perfect fit.
          </p>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="section" style={{ background: 'var(--ivory-dark)' }}>
        <div className="container">
          <div className="services-carousel-wrapper" style={{ position: 'relative' }}>
            <button className="carousel-btn prev-btn" onClick={() => scrollGrid(-1, 'services-grid-page')} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div id="services-grid-page" className="sp-grid">
              {displayed.map(svc => (
                <div
                key={svc.id}
                className="sp-card"
                onClick={() => handleOpenModal(svc)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleOpenModal(svc)}
              >
                {/* Image */}
                <div className="sp-card-img-wrap">
                  <img src={svc.img} alt={svc.name} className="sp-card-img" />
                  <span className="svc-badge" style={{ background: svc.badgeColor }}>
                    {svc.badge}
                  </span>
                  <div className="sp-card-overlay">
                    <span className="sp-view-btn">View Details →</span>
                  </div>
                </div>

                {/* Body */}
                <div className="sp-card-body">
                  <div className="svc-card-title-row">
                    <h3 className="svc-card-name">{svc.name}</h3>
                    <span className="svc-card-urdu">{svc.urdu}</span>
                  </div>
                  <p className="sp-card-tagline">{svc.tagline}</p>
                  <div className="svc-stars-row">
                    <span className="svc-stars">{'★'.repeat(svc.stars)}{'☆'.repeat(5 - svc.stars)}</span>
                    <span className="svc-reviews">({svc.reviews} reviews)</span>
                  </div>
                  <div className="svc-card-footer">
                    <span className="svc-card-price">{svc.price}</span>
                    <Link
                      to={`/book?service=${encodeURIComponent(svc.name)}`}
                      className="svc-order-btn"
                      onClick={e => e.stopPropagation()}
                    >
                      Order Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            </div>
            <button className="carousel-btn next-btn" onClick={() => scrollGrid(1, 'services-grid-page')} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="sp-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <button className="sp-modal-close" onClick={() => setSelected(null)} aria-label="Close">✕</button>

            <div className="sp-modal-inner">
              {/* Left: image */}
              <div className="sp-modal-img-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={activeImage} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }} />
                  <span className="svc-badge" style={{ background: selected.badgeColor, position: 'absolute', top: 16, left: 16 }}>
                    {selected.badge}
                  </span>
                </div>
                
                {/* Image Gallery Row */}
                {selected.images && selected.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    <div 
                      onClick={() => setActiveImage(selected.img)}
                      style={{ 
                        width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                        border: activeImage === selected.img ? '2px solid var(--gold)' : '2px solid transparent'
                      }}
                    >
                      <img src={selected.img} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {selected.images.map((imgUrl, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        style={{ 
                          width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                          border: activeImage === imgUrl ? '2px solid var(--gold)' : '2px solid transparent'
                        }}
                      >
                        <img src={imgUrl} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: info */}
              <div className="sp-modal-info">
                <p className="text-label" style={{ marginBottom: '0.5rem' }}>{selected.category}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 className="text-heading-2">{selected.name}</h2>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: 'var(--stone)', direction: 'rtl' }}>{selected.urdu}</span>
                </div>

                <div className="svc-stars-row" style={{ marginTop: '0.5rem' }}>
                  <span className="svc-stars">{'★'.repeat(selected.stars)}{'☆'.repeat(5 - selected.stars)}</span>
                  <span className="svc-reviews">({selected.reviews} verified reviews)</span>
                </div>

                <p style={{ marginTop: '1rem', color: 'var(--stone)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
                  {selected.desc}
                </p>

                {/* Features */}
                <div className="sp-features">
                  <p className="text-label" style={{ marginBottom: '0.625rem' }}>What's Included</p>
                  <div className="sp-features-list">
                    {selected.features.map(f => (
                      <span key={f} className="sp-feature-chip">✓ {f}</span>
                    ))}
                  </div>
                </div>

                {/* Occasions */}
                <div className="sp-occasions">
                  <p className="text-label" style={{ marginBottom: '0.625rem' }}>Best For</p>
                  <div className="sp-features-list">
                    {selected.occasions.map(o => (
                      <span key={o} className="sp-occasion-chip">{o}</span>
                    ))}
                  </div>
                </div>

                {/* Delivery + Price */}
                <div className="sp-modal-meta">
                  <div className="sp-meta-item">
                    <span className="sp-meta-label">Starting Price</span>
                    <span className="sp-meta-value">{selected.price}</span>
                  </div>
                  <div className="sp-meta-divider" />
                  <div className="sp-meta-item">
                    <span className="sp-meta-label">Delivery Time</span>
                    <span className="sp-meta-value">{selected.deliveryDays}</span>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/book?service=${encodeURIComponent(selected.name)}`} className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                    Order This Garment
                  </Link>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--stone-light)', marginTop: '0.875rem', textAlign: 'center' }}>
                  ✓ 100% custom fit &nbsp;·&nbsp; ✓ No standard sizes &nbsp;·&nbsp; ✓ Delivery to your doorstep
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Why Choose Us ── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-header">
            <span className="text-label">Why Genius Tailors</span>
            <h2 className="text-heading-2">A Perfect Fit, Guaranteed</h2>
          </div>
          <div className="sp-why-grid">
            {[
              { icon: '📐', title: 'Exact Measurements', desc: 'Every garment is cut to your personal measurements — not generic S/M/L sizes.' },
              { icon: '✂️', title: 'Master Craftsmen', desc: 'Over 30 years of tailoring experience in Hyderabad, Sindh.' },
              { icon: '🚚', title: 'Doorstep Delivery', desc: 'We deliver across Hyderabad. You order, we stitch, we deliver.' },
              { icon: '🔄', title: 'Free Alterations', desc: 'If the fit isn\'t perfect, we fix it for free. Your satisfaction is our promise.' },
            ].map(item => (
              <div key={item.title} className="sp-why-card">
                <div className="sp-why-icon">{item.icon}</div>
                <h3 className="sp-why-title">{item.title}</h3>
                <p className="sp-why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="sp-cta-banner">
        <div className="container">
          <div className="sp-cta-inner">
            <div>
              <h2 className="text-heading-2" style={{ color: 'var(--ivory)' }}>Ready to Order?</h2>
              <p style={{ color: 'rgba(253,251,247,0.65)', marginTop: '0.5rem', fontSize: '1rem' }}>
                Create your free account and place your first order in minutes.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-gold btn-lg">Get Started — Free</Link>
              <Link to="/contact" className="btn btn-outline btn-lg" style={{ color: 'var(--ivory)', borderColor: 'rgba(253,251,247,0.3)' }}>
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Page CSS ── */}
      <style>{`
        /* Page Hero */
        .services-page-hero {
          padding-top: calc(var(--nav-height) + 4rem);
          padding-bottom: 3rem;
          background: var(--ivory);
        }

        /* Filter bar */
        .services-filter-bar {
          background: white;
          border-bottom: 1px solid var(--ivory-border);
          position: sticky;
          top: var(--nav-height);
          z-index: 50;
        }

        .services-filter-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 0.75rem 0;
          overflow-x: auto;
        }

        .filter-tab {
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--stone);
          background: transparent;
          border: 1.5px solid var(--ivory-border);
          cursor: pointer;
          white-space: nowrap;
          transition: all 200ms ease;
        }

        .filter-tab:hover { border-color: var(--onyx); color: var(--onyx); }

        .filter-tab-active {
          background: var(--onyx);
          color: var(--ivory);
          border-color: var(--onyx);
        }

        /* Services page grid */
        .sp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-lg);
        }

        /* Service page card */
        .sp-card {
          background: white;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          cursor: pointer;
          transition: transform 300ms ease, box-shadow 300ms ease;
        }

        .sp-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-xl);
        }

        .sp-card-img-wrap {
          position: relative;
          height: 420px;
          overflow: hidden;
          background: var(--ivory-dark);
        }

        .sp-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms ease;
        }

        .sp-card:hover .sp-card-img { transform: scale(1.05); }

        .sp-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(10,10,10,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .sp-card:hover .sp-card-overlay { opacity: 1; }

        .sp-view-btn {
          color: white;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          background: rgba(255,255,255,0.15);
          padding: 0.625rem 1.5rem;
          border-radius: var(--radius-full);
          border: 1.5px solid rgba(255,255,255,0.4);
          backdrop-filter: blur(4px);
        }

        .sp-card-body {
          padding: 1.25rem 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sp-card-tagline {
          font-size: 0.875rem;
          color: var(--stone);
          font-style: italic;
        }

        /* Modal */
        .sp-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10,10,10,0.6);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          backdrop-filter: blur(4px);
          animation: fadeIn 200ms ease;
        }

        .sp-modal {
          background: var(--ivory);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 900px;
          max-height: 92vh;
          overflow-y: auto;
          position: relative;
          box-shadow: var(--shadow-xl);
          animation: fadeInUp 300ms ease;
        }

        .sp-modal-close {
          position: absolute;
          top: 1rem; right: 1rem;
          z-index: 10;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--onyx);
          color: var(--ivory);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: background 200ms ease;
        }

        .sp-modal-close:hover { background: var(--charcoal); }

        .sp-modal-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .sp-modal-img-wrap {
          position: relative;
          min-height: 480px;
          background: var(--ivory-dark);
          border-radius: var(--radius-xl) 0 0 var(--radius-xl);
          overflow: hidden;
        }

        .sp-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .sp-modal-info {
          padding: 2.5rem 2rem 2rem;
          overflow-y: auto;
        }

        /* Features chips */
        .sp-features, .sp-occasions { margin-top: 1.25rem; }

        .sp-features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .sp-feature-chip {
          font-size: 0.8125rem;
          color: var(--charcoal);
          background: var(--ivory-dark);
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-full);
          padding: 0.3rem 0.75rem;
        }

        .sp-occasion-chip {
          font-size: 0.8125rem;
          color: var(--onyx);
          background: rgba(201,169,110,0.1);
          border: 1px solid rgba(201,169,110,0.3);
          border-radius: var(--radius-full);
          padding: 0.3rem 0.75rem;
          font-weight: 500;
        }

        /* Meta row */
        .sp-modal-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: var(--ivory-dark);
          border-radius: var(--radius-lg);
        }

        .sp-meta-item { display: flex; flex-direction: column; gap: 0.2rem; }
        .sp-meta-label { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--stone-light); font-weight: 600; }
        .sp-meta-value { font-family: var(--font-serif); font-size: 1.1rem; color: var(--onyx); }
        .sp-meta-divider { width: 1px; height: 40px; background: var(--ivory-border); }

        /* Why grid */
        .sp-why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-xl);
        }

        .sp-why-card {
          padding: var(--space-xl);
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-lg);
          text-align: center;
          background: var(--ivory);
          transition: box-shadow 250ms ease;
        }

        .sp-why-card:hover { box-shadow: var(--shadow-md); }

        .sp-why-icon { font-size: 2rem; margin-bottom: 0.75rem; }

        .sp-why-title {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--onyx);
          margin-bottom: 0.5rem;
        }

        .sp-why-desc {
          font-size: 0.875rem;
          color: var(--stone);
          line-height: 1.6;
        }

        /* Bottom CTA */
        .sp-cta-banner {
          background: var(--onyx);
          padding: var(--space-3xl) 0;
        }

        .sp-cta-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-xl);
          flex-wrap: wrap;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sp-grid { grid-template-columns: repeat(2, 1fr); }
          .sp-why-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        }

        @media (max-width: 640px) {
          .sp-grid { 
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 1rem;
            padding-bottom: 1rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .sp-grid::-webkit-scrollbar {
            display: none;
          }
          .sp-card {
            flex: 0 0 100%;
            scroll-snap-align: center;
          }
          .sp-why-grid { grid-template-columns: 1fr; }
          .sp-modal-inner { grid-template-columns: 1fr; }
          .sp-modal-img-wrap { min-height: 280px; border-radius: var(--radius-xl) var(--radius-xl) 0 0; }
          .sp-cta-inner { flex-direction: column; text-align: center; }
          .sp-modal-info { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
// Garment images

import ShalwarKameezFeaturedImage from '../assets/ShalwarKameezFeaturedImage.jpeg'
import HeroKurtaPajama from '../assets/HeroKurtaPajama.jpeg'
import kurtaShalwarFeatured from '../assets/kurtaShalwarFeatured.jpeg'
import WaistcoatFront from '../assets/waistcoatfront.jpeg'

import eliteAuraMain from '../assets/EliteAuraMain.jpeg'
import MainShalwarKameez from '../assets/MainShalwarKameez.jpeg'
import angularEdgeMain from '../assets/AngularEdgeMain.jpeg'

import ShalwarKameezGallery0 from '../assets/ShalwarKameezGallery0.jpeg';
import ShalwarKameezGallery1 from '../assets/ShalwarKameezGallery1.jpeg';
import ShalwarKameezGallery2 from '../assets/ShalwarKameezGallery2.jpeg';
import angularEdge01 from '../assets/AngularEdge01.jpeg'
import urbanCore02 from '../assets/UrbanCore02.jpeg'
import websiteHeroImg from '../assets/website-hero-image-upscaled.png';

import proc1 from '../assets/process_1.png';
import proc2 from '../assets/process_2.png';
import proc3 from '../assets/process_3.png';
import proc4 from '../assets/process_4.png';

import imgReviewShirt from '../assets/best shirt tailor in pakistan.png';
import imgReviewOnlineSK from '../assets/best online shalwar kameez tailor in pakistan.png';
import imgReviewSKOnline from '../assets/shalwar kameez online tailor in pakistan.png';

const WHATSAPP_REVIEWS = [
  { id: 1, img: imgReviewOnlineSK, title: 'Bespoke Kameez Shalwar Review', subtitle: 'Customer WhatsApp Feedback' },
  { id: 2, img: imgReviewShirt, title: 'Custom Shirt Tailoring Review', subtitle: 'Verified Client Feedback' },
  { id: 3, img: imgReviewSKOnline, title: 'Online Tailoring Experience', subtitle: 'Customer WhatsApp Feedback' }
];

const PORTFOLIO_IMAGES = [
  { id: 1, src: ShalwarKameezFeaturedImage, title: 'Bespoke Kameez Shalwar' },
  { id: 2, src: angularEdgeMain, title: 'Angular Edge Kurta' },
  { id: 3, src: MainShalwarKameez, title: 'Classic Finish' },
  { id: 4, src: WaistcoatFront, title: 'Premium Waistcoat' },
  { id: 5, src: ShalwarKameezGallery0, title: 'Tailoring Details' },
  { id: 6, src: urbanCore02, title: 'Zardari Suit Fit' },
];

import { ALL_SERVICES as SERVICES_PREVIEW } from './Services';

const PROCESS_STEPS = [
  { num: '01', title: 'Choose Your Garment', desc: 'Browse our catalog and select the style that speaks to you.', bgImg: proc1 },
  { num: '02', title: 'Enter Measurements', desc: 'Use saved profiles or enter fresh measurements for a perfect fit.', bgImg: proc2 },
  { num: '03', title: 'Customise the Details', desc: 'Pick collar, sleeve, front, and back styles down to the last stitch.', bgImg: proc3 },
  { num: '04', title: 'Track Your Order', desc: 'Follow every stage live — from cutting table to your door.', bgImg: proc4 },
];

const STATS = [
  { value: '500+', label: 'Happy Customers' },
  { value: '15+', label: 'Years of Craft' },
  { value: '4', label: 'Garment Types' },
  { value: '100%', label: 'Custom Fit' },
];

const TESTIMONIALS = [
  {
    name: 'Ahmed R.',
    time: '2 months ago',
    text: 'The measurement profiles feature is a game changer. I saved my office fit once, and now I just click order. Perfect fit every time.',
    stars: 5,
    avatarColor: '#4285F4'
  },
  {
    name: 'Bilal M.',
    time: '3 weeks ago',
    text: 'Got my Kurta Pajama stitched here. The layer preview helped me visualize the collar perfectly. Highly recommended for special events.',
    stars: 5,
    avatarColor: '#0F9D58'
  },
  {
    name: 'Usman T.',
    time: '1 month ago',
    text: 'The Eid priority system for Gold members saved me this year. Delivered 3 days before Eid while other tailors stopped taking orders.',
    stars: 5,
    avatarColor: '#F4B400'
  }
];



export default function Home() {
  const { isLoggedIn, isAdmin } = useAuth();
  const [activeSeason, setActiveSeason] = useState(null);
  const [activeCard, setActiveCard] = useState(0);
  const [showPromo, setShowPromo] = useState(false);
  const [realReviews, setRealReviews] = useState(null);
  const [viewingReviewImg, setViewingReviewImg] = useState(null);

  useEffect(() => {
    const fetchGmbReviews = async () => {
      try {
        const res = await api.get('/api/reviews');
        if (res.data && res.data.reviews) {
          setRealReviews(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch live GMB reviews:", error);
      }
    };
    fetchGmbReviews();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard(prev => (prev + 1) % GARMENTS.length);
    }, 3000); // Change card every 3 seconds
    return () => clearInterval(timer);
  }, []);

  const [isBannerVisible, setIsBannerVisible] = useState(() => {
    return !sessionStorage.getItem('gt_banner_dismissed');
  });
  const [servicesData, setServicesData] = useState(SERVICES_PREVIEW);
  const [portfolioItems, setPortfolioItems] = useState(PORTFOLIO_IMAGES);
  const [selected, setSelected] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    api.get('/api/portfolio')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const liveFeatured = res.data.filter(p => p.featuredOnHome !== false).map(p => ({
            id: p._id,
            src: p.imageUrl,
            title: p.title
          }));
          if (liveFeatured.length > 0) {
            setPortfolioItems([...liveFeatured, ...PORTFOLIO_IMAGES]);
          }
        }
      })
      .catch(() => { });
  }, []);

  const navigate = useNavigate();

  const handleOpenModal = (svc) => {
    navigate(`/services/${svc.id}`);
  };

  const scrollGrid = (direction, id) => {
    const el = document.getElementById(id);
    if (el) {
      const scrollAmount = el.clientWidth;
      el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!isLoggedIn && !sessionStorage.getItem('gt_promo_dismissed')) {
      const timer = setTimeout(() => setShowPromo(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const handlePromoClose = () => {
    sessionStorage.setItem('gt_promo_dismissed', 'true');
    setShowPromo(false);
  };



  const handleBannerClose = () => {
    sessionStorage.setItem('gt_banner_dismissed', 'true');
    setIsBannerVisible(false);
  };

  const GARMENTS = [
    { name: 'Kameez Shalwar', label: 'Traditional Classic', img: ShalwarKameezFeaturedImage },
    { name: 'Kurta Shalwar', label: 'Casual Refined', img: kurtaShalwarFeatured },
    { name: 'Kurta Pajama', label: 'Evening Elegance', img: HeroKurtaPajama },
    { name: 'Waistcoat', label: 'Perfect Companion', img: WaistcoatFront },
    { name: 'Kameez Shalwar Design', label: 'Premium Look', img: eliteAuraMain },
    { name: 'Kurta Shalwar Design', label: 'Modern Aesthetic', img: angularEdgeMain },
    { name: 'Zardari Waistcoat', label: '3-Piece Suit', img: WaistcoatFront },
  ];

  useEffect(() => {
    api.get('/api/season/active')
      .then(r => setActiveSeason(r.data?.season || null))
      .catch(() => { });

    api.get('/api/services')
      .then(res => {
        const dbServices = res.data;
        if (!Array.isArray(dbServices)) return;

        const merged = SERVICES_PREVIEW.map(staticSvc => {
          const dbSvc = dbServices.find(s => s.name && s.name.toLowerCase() === staticSvc.name.toLowerCase());
          if (dbSvc) {
            return {
              ...staticSvc,
              img: staticSvc.img,
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

  return (
    <>
      <Helmet>
        <title>Premium Online Tailor in Pakistan | Genius Tailors</title>
        <meta name="description" content="Shop premium men branded shalwar kameez online. Experience the best gents tailor in Hyderabad, Pakistan with our custom stitching. Book your fit today!" />
        <meta name="keywords" content="online tailor in pakistan, best gents tailor in hyderabad pakistan, men branded shalwar kameez online, kameez shalwar design, designer kurta for men pakistan, premium cotton kurta pajama" />
      </Helmet>
      <div className="home">
        <Navbar />

        {/* ── Season Banner ──────────────────────────────── */}
        {(activeSeason && isBannerVisible) && (
          <div className="season-banner" style={{ position: 'relative' }}>
            <span className="season-banner-icon">✦</span>
            <span>{activeSeason.announcement || `${activeSeason.name} — Special orders now open. Book early.`}</span>
            <span className="season-banner-icon">✦</span>
            <button
              onClick={handleBannerClose}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--gold)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0 0.5rem',
                lineHeight: 1
              }}
              aria-label="Close Announcement"
            >
              &times;
            </button>
          </div>
        )}

        {/* ── Full Width Hero Banner ──────────────────────── */}
        <section className="hero" style={{ minHeight: 'auto', paddingTop: (activeSeason && isBannerVisible) ? 'calc(var(--nav-height) + 44px)' : 'var(--nav-height)', paddingBottom: 0, paddingLeft: 0, paddingRight: 0, overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: '100%', maxHeight: '615px', overflow: 'hidden' }}>
            <Link to="/services" style={{ display: 'block', cursor: 'pointer' }}>
              <img
                src={websiteHeroImg}
                alt="Genius Tailors Bespoke Tailoring"
                style={{ width: '100%', height: '615px', display: 'block', objectFit: 'cover', objectPosition: 'top center' }}
              />
            </Link>
          </div>
        </section>

        {/* ── Order Flow (Process) ────────────────────────── */}
        <section className="section process-section" style={{ background: '#faf9f6' }}>
          <div className="container">
            <div className="section-header">
              <span className="text-label">How It Works</span>
              <h2 className="text-heading-2">Four Steps to the Perfect Fit</h2>
            </div>
            <div className="process-grid animate-children">
              {PROCESS_STEPS.map(step => (
                <div key={step.num} className="process-step animate-fade-in">
                  <div className="process-circle-wrapper">
                    <div className="process-circle">
                      <img src={step.bgImg} alt={step.title} className="process-circle-img" />
                      <div className="process-circle-overlay" />
                    </div>
                    <div className="process-num-badge">{step.num}</div>
                  </div>
                  <div className="process-info">
                    <h3 className="process-title">{step.title}</h3>
                    <p className="process-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services Preview ────────────────────────────── */}
        <section className="section services-section">
          <div className="container">
            <div className="section-header">
              <span className="text-label">ہماری خدمات — Our Services</span>
              <h2 className="text-heading-2">Choose What You Want to Stitch</h2>
              <p className="text-subtitle" style={{ maxWidth: '540px', margin: '0 auto' }}>
                Every garment is made fresh — just for you. Tap any card to place your order.
              </p>
            </div>
            <div className="services-carousel-wrapper" style={{ position: 'relative' }}>
              <button className="carousel-btn prev-btn" onClick={() => scrollGrid(-1, 'services-grid-home')} aria-label="Previous">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div id="services-grid-home" className="services-grid animate-children">
                {servicesData.map((svc) => (
                  <div
                    key={svc.name}
                    className="svc-card animate-fade-in"
                    onClick={() => navigate(`/services/${svc.id}`)}
                    style={{ cursor: 'pointer' }}
                  >

                    {/* Image */}
                    <div className="svc-card-img-wrap">
                      <img src={svc.img} alt={svc.name} className="svc-card-img" />
                      {/* Badge */}
                      <span
                        className="svc-badge"
                        style={{ background: svc.badgeColor }}
                      >
                        {svc.badge}
                      </span>
                      <div className="svc-card-overlay">
                        <span className="svc-view-btn">View Details →</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="svc-card-body">
                      {/* Name + Urdu on Separate Lines */}
                      <div className="svc-card-title-block">
                        <h3 className="svc-card-name">{svc.name}</h3>
                        <span className="svc-card-urdu">{svc.urdu}</span>
                      </div>

                      {/* Stars */}
                      <div className="svc-stars-row">
                        <span className="svc-stars">
                          {'★'.repeat(svc.stars)}{'☆'.repeat(5 - svc.stars)}
                        </span>
                        <span className="svc-reviews">({svc.reviews} reviews)</span>
                      </div>

                      {/* Description */}
                      <p className="svc-card-desc">{svc.desc}</p>

                      {/* Footer: Price on Line 1, Order Button on Line 2 */}
                      <div className="svc-card-footer">
                        <div className="svc-price-block">
                          <span className="svc-price-label">Starting Price</span>
                          <span className="svc-card-price">{svc.price}</span>
                        </div>
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
              <button className="carousel-btn next-btn" onClick={() => scrollGrid(1, 'services-grid-home')} aria-label="Next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </section>

        {/* ── Portfolio Preview ────────────────────────────── */}
        <section className="section portfolio-preview-section" style={{ background: 'white', overflow: 'hidden' }}>
          <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="text-label" style={{ color: 'var(--onyx)' }}>Our Craftsmanship</span>
            <h2 className="text-heading-2">Recent Work</h2>
            <p className="text-subtitle" style={{ maxWidth: '540px', margin: '0.5rem auto 0', color: 'var(--stone)' }}>
              A glimpse into the fine tailoring that defines Genius Tailors.
            </p>
          </div>

          <div className="portfolio-marquee">
            <div className="portfolio-track">
              {portfolioItems.map((item, idx) => (
                <div key={item.id || idx} className="portfolio-slide">
                  <img src={item.src} alt={item.title} />
                </div>
              ))}
            </div>
            <div className="portfolio-track" aria-hidden="true">
              {portfolioItems.map((item, idx) => (
                <div key={(item.id || idx) + '-copy'} className="portfolio-slide">
                  <img src={item.src} alt={item.title} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/portfolio" className="btn btn-outline btn-lg" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
              See All Work
            </Link>
          </div>
        </section>



        {/* ── Customer Reviews & Feedback ─────────────────────── */}
        <section className="section testimonials-section" style={{ background: '#f8f9fa' }}>
          <div className="container">
            <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '28px', height: '28px' }}><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /><path fill="none" d="M0 0h48v48H0z" /></svg>
                <h2 className="text-heading-2" style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600, color: '#202124', letterSpacing: '-0.5px' }}>Customer Reviews & Feedback</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#202124' }}>
                  {realReviews ? realReviews.rating : '5.0'}
                </span>
                <span style={{ color: '#fbbc04', fontSize: '1.25rem', letterSpacing: '2px' }}>★★★★★</span>
                <span style={{ color: '#5f6368', fontSize: '0.85rem' }}>
                  ({realReviews ? realReviews.user_ratings_total : '150+'}) verified reviews
                </span>
              </div>
              <a
                href="https://www.google.com/search?q=genius+tailors&rlz=1C1CHZN_enPK1227PK1227&oq=genius+tailors&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARAjGCcyBwgCEAAYgAQyBwgDEAAYgAQyCAgEEAAYFhgeMgYIBRBFGDwyBggGEEUYPDIGCAcQRRg80gEIMjUwMWowajeoAgCwAgA&sourceid=chrome&source=chrome.ob&ie=UTF-8#sv=CAESzQEKuQEStgEKd0FKaVQ0dEpnTlE2dlJzb3hLbm9CN1FLY0JVeDFmS1JtMEhuNERNVy15VU5NVWlzeU1fUmV6RFpzNDk2QWRrSEVVR0J3cGZzSjM3R1VjS0VCLVdVa1AxdG1mWmlfS2lMVVExbGFXaWNDVkt6Sks2a3k3dFNnVGtJEhdMc0tTYXNlME9lS2drZFVQNGFiWmtRSRoiQURzcjlmVEhaSzFtYXA5STBRTWVDS054d0huMGw0UUthQRIEODA1MRoBMyoAMAA4AUAAGAAg4c6vmApKAhAC"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ background: '#1a73e8', borderColor: '#1a73e8', borderRadius: '6px', padding: '0.65rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#ffffff', textDecoration: 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                View All Reviews
              </a>
            </div>

            {/* Review Screenshots Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
              {WHATSAPP_REVIEWS.map(r => (
                <div
                  key={r.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  className="review-img-card"
                  onClick={() => setViewingReviewImg(r.img)}
                >
                  <div style={{ width: '100%', background: '#075E54', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                    <span style={{ fontSize: '1.1rem' }}>💬</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{r.title}</div>
                      <div style={{ fontSize: '0.725rem', opacity: 0.85 }}>{r.subtitle}</div>
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f0f2f5', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={r.img}
                      alt={r.title}
                      style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── Loyalty CTA Section ─────────────────────────── */}
        <section className="section loyalty-cta-section">
          <div className="container">
            <div className="loyalty-card-wrapper">
              <div className="loyalty-cta-header">
                <span className="loyalty-badge">✦ EXCLUSIVE CLUB & REWARDS</span>
                <h2 className="text-heading-2 loyalty-title">
                  Unlock VIP Privileges & Instant Savings
                </h2>
                <p className="loyalty-subtitle">
                  Get <strong>50 Welcome Points</strong> immediately when you join. Earn 1 Point for every Rs. 100 spent and unlock lifetime tier discounts plus peak-season priority tailoring.
                </p>
              </div>

              <div className="loyalty-tiers-grid">
                {[
                  {
                    tier: 'Bronze',
                    badge: 'Starter',
                    pts: '0 – 499 pts',
                    perks: ['50 Bonus Signup Points', 'Saved Measurement Profiles', 'Order Status Notifications'],
                    accent: '#CD7F32'
                  },
                  {
                    tier: 'Silver',
                    badge: 'Popular',
                    pts: '500 – 1,499 pts',
                    perks: ['5% Off Every Order', 'Priority Stitching Queue', 'Free Home Fabric Pickup'],
                    accent: '#C0C0C0'
                  },
                  {
                    tier: 'Gold VIP',
                    badge: 'Best Value',
                    pts: '1,500+ pts',
                    perks: ['10% Off Lifetime Discount', 'Peak-Season Eid Priority', 'Free Express Delivery'],
                    accent: '#FFD700'
                  },
                ].map(t => (
                  <div key={t.tier} className={`tier-card tier-card-${t.tier.toLowerCase().replace(' ', '')}`}>
                    <div className="tier-card-header">
                      <span className="tier-pill" style={{ borderColor: t.accent, color: t.accent }}>{t.badge}</span>
                      <h3 className="tier-name" style={{ color: t.accent }}>{t.tier}</h3>
                      <div className="tier-pts">{t.pts}</div>
                    </div>
                    <ul className="tier-perks-list">
                      {t.perks.map((p, idx) => (
                        <li key={idx} className="tier-perk-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="loyalty-cta-actions">
                {isLoggedIn ? (
                  <>
                    <Link to="/loyalty" className="btn btn-gold btn-lg">
                      View My Rewards & Points
                    </Link>
                    <Link to="/services" className="btn btn-outline-light btn-lg">
                      Place Order to Earn Points
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-gold btn-lg">
                      Become a VIP
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg">
                      Sign In to Account
                    </Link>
                  </>
                )}
              </div>

              {/* Micro Perks Badges */}
              <div className="loyalty-micro-perks">
                <div className="micro-perk">
                  <span className="micro-icon">🎁</span>
                  <span><strong>50 Bonus Pts</strong> on signup</span>
                </div>
                <div className="micro-perk">
                  <span className="micro-icon">💸</span>
                  <span><strong>Rs. 1 Off</strong> per 10 Pts redeemed</span>
                </div>
                <div className="micro-perk">
                  <span className="micro-icon">⚡</span>
                  <span><strong>No Waiting</strong> during peak Eid season</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── Instagram Section ───────────────────────────── */}
        <section className="section instagram-section" style={{ background: 'var(--ivory)' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="text-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                Follow Us
              </span>
              <h2 className="text-heading-2">@geniustailors</h2>
              <p className="text-subtitle" style={{ maxWidth: '540px', margin: '0.5rem auto 1.5rem' }}>
                Join our community on Instagram for daily inspiration, behind-the-scenes tailoring, and exclusive drops.
              </p>
              <a href="https://www.instagram.com/geniustailors/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.75rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                View Instagram
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </div>

            <div className="ig-grid">
              {[ShalwarKameezFeaturedImage, HeroKurtaPajama, kurtaShalwarFeatured, WaistcoatFront].map((img, idx) => (
                <a key={idx} href="https://www.instagram.com/geniustailors/" target="_blank" rel="noopener noreferrer" className="ig-post">
                  <img src={img} alt="Instagram post" />
                  <div className="ig-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <style>{`
              .ig-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
              }
              .ig-post {
                position: relative;
                aspect-ratio: 1 / 1;
                border-radius: var(--radius-md);
                overflow: hidden;
                display: block;
              }
              .ig-post img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
              }
              .ig-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                opacity: 0;
                transition: opacity 0.3s ease;
              }
              .ig-post:hover img {
                transform: scale(1.05);
              }
              .ig-post:hover .ig-overlay {
                opacity: 1;
              }
              @media (max-width: 768px) {
                .ig-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
              }
            `}</style>
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
                  <p className="text-label" style={{ marginBottom: '0.5rem' }}>{selected.category || 'Garment'}</p>
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
                  {selected.features && (
                    <div className="sp-features">
                      <p className="text-label" style={{ marginBottom: '0.625rem' }}>What's Included</p>
                      <div className="sp-features-list">
                        {selected.features.map(f => (
                          <span key={f} className="sp-feature-chip">✓ {f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Occasions */}
                  {selected.occasions && (
                    <div className="sp-occasions">
                      <p className="text-label" style={{ marginBottom: '0.625rem' }}>Best For</p>
                      <div className="sp-features-list">
                        {selected.occasions.map(o => (
                          <span key={o} className="sp-occasion-chip">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery + Price */}
                  <div className="sp-modal-meta">
                    <div className="sp-meta-item">
                      <span className="sp-meta-label">Starting Price</span>
                      <span className="sp-meta-value">{selected.price}</span>
                    </div>
                    <div className="sp-meta-divider" />
                    <div className="sp-meta-item">
                      <span className="sp-meta-label">Delivery Time</span>
                      <span className="sp-meta-value">{selected.deliveryDays || '5-7 working days'}</span>
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

        {/* Lightbox Modal for Review Screenshots */}
        {viewingReviewImg && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            onClick={() => setViewingReviewImg(null)}
          >
            <div style={{ position: 'relative', maxWidth: '900px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setViewingReviewImg(null)}
                style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#ffffff', fontSize: '2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
              <img src={viewingReviewImg} alt="Customer WhatsApp Review Screenshot" style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
            </div>
          </div>
        )}

        <Footer />
      </div>

      {/* Promotional Modal */}
      {showPromo && (
        <div className="promo-modal-overlay">
          <div className="promo-modal animate-fade-in">
            <button className="promo-close" onClick={handlePromoClose}>✕</button>
            <div className="promo-badge">10% OFF</div>
            <h2>First Time Here?</h2>
            <p>Create an account today and get <strong>10% off</strong> your first custom-tailored garment order instantly.</p>
            <Link to="/register" className="btn btn-primary btn-lg promo-btn" onClick={handlePromoClose}>
              Claim Your Discount
            </Link>
            <Link to="/login" className="promo-login-link" onClick={handlePromoClose}>
              Already have an account? Sign in
            </Link>
          </div>
          <style>{`
            .promo-modal-overlay {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              padding: 1.5rem;
              backdrop-filter: blur(4px);
            }
            .promo-modal {
              background: #ffffff;
              padding: 3rem 2.5rem;
              border-radius: var(--radius-lg);
              max-width: 480px;
              width: 100%;
              text-align: center;
              position: relative;
              box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            .promo-close {
              position: absolute;
              top: 1.5rem;
              right: 1.5rem;
              background: none;
              border: none;
              font-size: 1.25rem;
              color: var(--stone);
              cursor: pointer;
              transition: color 0.2s;
            }
            .promo-close:hover { color: var(--onyx); }
            .promo-badge {
              display: inline-block;
              background: #C9A96E;
              color: #fff;
              font-weight: 700;
              font-size: 0.85rem;
              padding: 0.35rem 1rem;
              border-radius: 999px;
              margin-bottom: 1.5rem;
              letter-spacing: 1px;
            }
            .promo-modal h2 {
              font-family: var(--font-serif);
              font-size: 2.25rem;
              color: var(--onyx);
              margin-bottom: 1rem;
            }
            .promo-modal p {
              color: var(--stone);
              font-size: 1.05rem;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .promo-btn {
              display: flex;
              width: 100%;
              justify-content: center;
              margin-bottom: 1rem;
              font-size: 1.1rem;
              padding: 1.1rem;
            }
            .promo-login-link {
              display: block;
              color: var(--stone);
              text-decoration: none;
              font-size: 0.95rem;
              font-weight: 500;
              transition: color 0.2s;
            }
            .promo-login-link:hover { color: var(--onyx); text-decoration: underline; }
          `}</style>
        </div>
      )}

      <style>{`
            /* Modal CSS */
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
              box-shadow: var(--shadow-2xl);
            }
            .sp-modal-close {
              position: absolute;
              top: 1.25rem;
              right: 1.25rem;
              background: rgba(0,0,0,0.05);
              border: none;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 1.2rem;
              color: var(--charcoal);
              z-index: 10;
              transition: background 200ms ease;
            }
            .sp-modal-close:hover { background: rgba(0,0,0,0.1); }
            .sp-modal-inner {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0;
            }
            .sp-modal-img-wrap {
              padding: 1.5rem;
              background: var(--ivory-dark);
              border-radius: var(--radius-xl) 0 0 var(--radius-xl);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .sp-modal-info {
              padding: 2.5rem;
              display: flex;
              flex-direction: column;
            }
            .sp-features, .sp-occasions { margin-top: 1.5rem; }
            .sp-features-list {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
            }
            .sp-feature-chip, .sp-occasion-chip {
              font-size: 0.8125rem;
              padding: 0.35rem 0.875rem;
              border-radius: var(--radius-full);
              font-weight: 500;
            }
            .sp-feature-chip { background: rgba(39, 174, 96, 0.1); color: #1e8449; }
            .sp-occasion-chip { background: var(--ivory-border); color: var(--onyx); }
            .sp-modal-meta {
              display: flex;
              align-items: center;
              gap: 1.5rem;
              margin-top: 1.5rem;
              padding: 1.25rem;
              background: var(--ivory-dark);
              border-radius: var(--radius-lg);
            }
            .sp-meta-item {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
            }
            .sp-meta-label { font-size: 0.75rem; color: var(--stone); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
            .sp-meta-value { font-size: 1.1rem; color: var(--onyx); font-weight: 600; }
            .sp-meta-divider { width: 1px; height: 30px; background: var(--ivory-border); }

            /* Overlay CSS */
            .svc-card-overlay {
              position: absolute;
              inset: 0;
              background: rgba(10,10,10,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 300ms ease;
            }
            .svc-card:hover .svc-card-overlay { opacity: 1; }
            .svc-view-btn {
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
            @media (max-width: 640px) {
              .sp-modal-inner { grid-template-columns: 1fr; }
              .sp-modal-img-wrap { border-radius: var(--radius-xl) var(--radius-xl) 0 0; }
              .sp-modal-info { padding: 1.5rem; }
            }
          `}</style>
    </>
  );
}

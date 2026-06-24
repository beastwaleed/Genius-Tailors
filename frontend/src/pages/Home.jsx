import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// Garment images
import imgShalwar from '../assets/shalwar-kameez.png';
import imgSherwani from '../assets/sherwani.png';
import imgSuit from '../assets/suit.png';
import imgKurta from '../assets/kurta.png';
import imgShirt from '../assets/shirt.png';
import imgWaistcoat from '../assets/WaistcoatMain.jpeg';

import HeroKameezShalwar from '../assets/HeroKameezShalwar.jpeg'
import HeroKurtaPajama from '../assets/HeroKurtaPajama.jpeg'
import HeroKurtaShalwar from '../assets/HeroKurtaShalwar.jpeg'
import HeroWaistcoat from '../assets/HeroWaistcoat.jpeg'
import MainShalwarKameez from '../assets/MainShalwarKameez.jpeg'

import img1 from '../assets/portfolio_1.png';
import img2 from '../assets/portfolio_2.png';
import img3 from '../assets/portfolio_3.png';
import img4 from '../assets/portfolio_4.png';
import img5 from '../assets/portfolio_5.png';

import proc1 from '../assets/process_1.png';
import proc2 from '../assets/process_2.png';
import proc3 from '../assets/process_3.png';
import proc4 from '../assets/process_4.png';

const PORTFOLIO_IMAGES = [
  { id: 1, src: img1, title: 'Bespoke Brown Kurta' },
  { id: 2, src: img2, title: 'Classic Fit' },
  { id: 3, src: img3, title: 'Dark Blue Kameez Shalwar' },
  { id: 4, src: img4, title: 'White Formal Kurta' },
  { id: 5, src: img5, title: 'Signature Black Cut' },
  { id: 6, src: img1, title: 'Tailoring Details' },
];

const SERVICES_PREVIEW = [
  {
    name: 'Kameez Shalwar',
    urdu: 'قمیض شلوار',
    desc: 'Our most popular garment — the timeless Pakistani classic, stitched to your exact measurements.',
    price: 'From Rs. 2,500',
    img: HeroKameezShalwar,
    badge: 'Most Popular',
    badgeColor: '#C9A96E',
    stars: 5,
    reviews: 184,
  },
  {
    name: 'Kurta Shalwar',
    urdu: 'کرتا شلوار',
    desc: 'Relaxed, comfortable, and refined. Perfect for everyday and casual occasions.',
    price: 'From Rs. 2,000',
    img: HeroKurtaShalwar,
    badge: 'Classic Choice',
    badgeColor: '#2E86C1',
    stars: 5,
    reviews: 96,
  },
  {
    name: 'Kurta Pajama',
    urdu: 'کرتا پاجامہ',
    desc: 'An elegant ethnic option perfect for events, evenings, and festive wear.',
    price: 'From Rs. 2,000',
    img: HeroKurtaPajama,
    badge: 'Trending',
    badgeColor: '#27AE60',
    stars: 4,
    reviews: 112,
  },
  {
    name: 'Waistcoat',
    urdu: 'واسکٹ',
    desc: 'Sharp layering piece — pairs perfectly with Kameez Shalwar or Kurta.',
    price: 'From Rs. 2,000',
    img: HeroWaistcoat,
    badge: 'Best Companion',
    badgeColor: '#1A1A1A',
    stars: 5,
    reviews: 73,
  }
];

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
    role: 'Regular Customer',
    text: 'The measurement profiles feature is a game changer. I saved my office fit once, and now I just click order. Perfect fit every time.',
    stars: 5,
  },
  {
    name: 'Bilal M.',
    role: 'Event Goer',
    text: 'Got my Kurta Pajama stitched here. The layer preview helped me visualize the collar perfectly. Highly recommended for special events.',
    stars: 5,
  },
  {
    name: 'Usman T.',
    role: 'Gold Member',
    text: 'The Eid priority system for Gold members saved me this year. Delivered 3 days before Eid while other tailors stopped taking orders.',
    stars: 5,
  }
];

function MobileIntro({ services, onComplete }) {
  const [cards, setCards] = useState([...services].reverse());
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [swipedCards, setSwipedCards] = useState([]);

  const handleStart = (clientX, clientY) => {
    setStartX(clientX);
    setStartY(clientY);
    setIsDragging(true);
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    setDragX(clientX - startX);
    setDragY(clientY - startY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragX) > 70) {
      const topCard = cards[cards.length - 1];
      setSwipedCards([...swipedCards, { name: topCard.name, dir: dragX > 0 ? 1 : -1 }]);

      setTimeout(() => {
        const newCards = [...cards];
        newCards.pop();
        setCards(newCards);
        if (newCards.length === 0) {
          setTimeout(onComplete, 100);
        }
      }, 150);
    } else {
      setDragX(0);
      setDragY(0);
    }
  };

  const handleTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  if (cards.length === 0) return null;

  return (
    <div className="mobile-intro-overlay">
      <div className="mobile-intro-header">
        <h2 className="text-heading-2">Genius Tailors</h2>
        <p>Swipe to explore our signature garments</p>
      </div>
      <div className="mobile-intro-stack">
        {cards.map((svc, index) => {
          const isTop = index === cards.length - 1;
          const swiped = swipedCards.find(s => s.name === svc.name);

          let style = {};
          if (swiped) {
            style = {
              transform: `translate(${swiped.dir * 500}px, ${dragY}px) rotate(${swiped.dir * 45}deg)`,
              transition: 'transform 0.15s ease-out',
              zIndex: 20
            };
          } else if (isTop) {
            style = {
              transform: isDragging ? `translate(${dragX}px, ${dragY}px) rotate(${dragX * 0.05}deg)` : 'translate(0px, 0px) rotate(0deg)',
              transition: isDragging ? 'none' : 'transform 0.15s ease',
              zIndex: 10
            };
          } else {
            const offset = cards.length - 1 - index;
            style = {
              transform: `scale(${1 - offset * 0.05}) translateY(${offset * -20}px)`,
              transition: 'transform 0.3s ease',
              zIndex: index
            };
          }

          return (
            <div
              key={svc.name}
              className="mobile-intro-card"
              style={style}
              onTouchStart={isTop && !swiped ? handleTouchStart : undefined}
              onTouchMove={isTop && !swiped ? handleTouchMove : undefined}
              onTouchEnd={isTop && !swiped ? handleEnd : undefined}
              onMouseDown={isTop && !swiped ? handleMouseDown : undefined}
              onMouseMove={isTop && !swiped ? handleMouseMove : undefined}
              onMouseUp={isTop && !swiped ? handleMouseUp : undefined}
              onMouseLeave={isTop && !swiped ? handleMouseLeave : undefined}
            >
              <img src={svc.img} className="mobile-intro-card-img" alt={svc.name} />
              <div className="mobile-intro-card-body">
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--ivory)' }}>{svc.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem' }}>{svc.urdu}</p>
              </div>
            </div>
          )
        })}
      </div>
      <button 
        onClick={onComplete} 
        style={{
          position: 'absolute', 
          bottom: '40px', 
          background: 'var(--onyx)', 
          color: 'var(--ivory)', 
          border: 'none',
          padding: '0.75rem 2.5rem', 
          borderRadius: '999px', 
          zIndex: 100,
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
      >
        Skip Intro
      </button>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  const [activeSeason, setActiveSeason] = useState(null);
  const [activeCard, setActiveCard] = useState(0);
  const [showPromo, setShowPromo] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(() => {
    return !sessionStorage.getItem('gt_banner_dismissed');
  });
  const [showIntro, setShowIntro] = useState(() => {
    return window.innerWidth <= 768 && !sessionStorage.getItem('introSeen');
  });

  useEffect(() => {
    if (!isLoggedIn && !sessionStorage.getItem('gt_promo_dismissed') && !showIntro) {
      const timer = setTimeout(() => setShowPromo(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, showIntro]);

  const handlePromoClose = () => {
    sessionStorage.setItem('gt_promo_dismissed', 'true');
    setShowPromo(false);
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('introSeen', 'true');
    setShowIntro(false);
  };

  const handleBannerClose = () => {
    sessionStorage.setItem('gt_banner_dismissed', 'true');
    setIsBannerVisible(false);
  };

  const GARMENTS = [
    { name: 'Kameez Shalwar', label: 'Traditional Classic', img: imgShalwar },
    { name: 'Kurta Shalwar', label: 'Casual Refined', img: imgKurta },
    { name: 'Kurta Pajama', label: 'Evening Elegance', img: imgKurta },
    { name: 'Waistcoat', label: 'Perfect Companion', img: imgWaistcoat },
  ];

  useEffect(() => {
    api.get('/api/season/active')
      .then(r => setActiveSeason(r.data?.season || null))
      .catch(() => { });
  }, []);

  return (
    <>
      {showIntro ? (
        <MobileIntro services={SERVICES_PREVIEW} onComplete={handleIntroComplete} />
      ) : (
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

          {/* ── Hero ───────────────────────────────────────── */}
          <section className="hero" style={{ paddingTop: (activeSeason && isBannerVisible) ? 'calc(var(--nav-height) + 44px)' : 'var(--nav-height)' }}>
            <div className="container">
              <div className="hero-inner">
                <div className="hero-content animate-fade-in-up">
                  <p className="text-label" style={{ marginBottom: '1.25rem' }}>
                    Est. 1992 · Hyderabad, Pakistan
                  </p>
                  <h1 className="text-display hero-heading">
                    Custom Tailoring<br />
                    <em>Made easy, Online!</em>
                  </h1>
                  <p className="text-subtitle hero-subtitle">
                    Your digital tailor. Get Shalwar Kameez, Waistcoats, and Kurta Pajamas custom-made by Hyderabad's finest craftsmen, without ever leaving your home.
                  </p>
                  <div className="hero-actions">
                    <Link to="/services" className="btn btn-primary btn-lg">
                      Place Online Order
                    </Link>
                    <Link to="/register" className="btn btn-outline btn-lg">
                      Create Account
                    </Link>
                  </div>
                </div>

                <div className="hero-visual animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <div className="garment-stack">
                    {GARMENTS.map((g, i) => {
                      const isActive = i === activeCard;
                      const offset = i - activeCard; // negative = was before active
                      return (
                        <div
                          key={g.name}
                          className={`garment-card ${isActive ? 'garment-card-active' : ''}`}
                          style={{
                            zIndex: isActive ? 10 : -2 - Math.abs(offset),
                            transform: isActive
                              ? 'translate(0, 0) rotate(-2deg) scale(1.05)'
                              : `translate(${offset * 24}px, ${Math.abs(offset) * 8}px) rotate(${offset * 3}deg) scale(${1 - Math.abs(offset) * 0.008})`,
                          }}
                          onMouseEnter={() => setActiveCard(i)}
                        >
                          <img src={g.img} alt={g.name} className="garment-card-img" />
                          <div className="garment-card-label">
                            <span className="garment-card-sublabel">{g.label}</span>
                            <span className="garment-card-name">{g.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Dot indicators */}
                  <div className="garment-dots">
                    {GARMENTS.map((g, i) => (
                      <button
                        key={g.name}
                        className={`garment-dot ${i === activeCard ? 'garment-dot-active' : ''}`}
                        onClick={() => setActiveCard(i)}
                        aria-label={g.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative grain overlay */}
            <div className="hero-grain" />
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
                  <div key={step.num} className="process-step animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="process-step-bg" style={{ 
                      backgroundImage: `url(${step.bgImg})`,
                      position: 'absolute',
                      inset: 0,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: 0.15,
                      zIndex: 0
                    }} />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 100%)',
                      zIndex: 0
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div className="process-num text-label" style={{ marginBottom: 0 }}>{step.num}</div>
                      </div>
                      <h3 className="process-title">{step.title}</h3>
                      <p className="text-small process-desc" style={{ position: 'relative', zIndex: 1 }}>{step.desc}</p>
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
              <div className="services-grid animate-children">
                {SERVICES_PREVIEW.map((svc) => (
                  <Link to={`/book?service=${encodeURIComponent(svc.name)}`} key={svc.name} className="svc-card animate-fade-in">

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
                    </div>

                    {/* Body */}
                    <div className="svc-card-body">
                      {/* Name + Urdu */}
                      <div className="svc-card-title-row">
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

                      {/* Footer */}
                      <div className="svc-card-footer">
                        <span className="svc-card-price">{svc.price}</span>
                        <span className="svc-order-btn">Order Now →</span>
                      </div>
                    </div>

                  </Link>
                ))}
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
                {PORTFOLIO_IMAGES.map((item) => (
                  <div key={item.id} className="portfolio-slide">
                    <img src={item.src} alt={item.title} />
                  </div>
                ))}
              </div>
              <div className="portfolio-track" aria-hidden="true">
                {PORTFOLIO_IMAGES.map((item) => (
                  <div key={item.id + '-copy'} className="portfolio-slide">
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



          {/* ── Testimonials ────────────────────────────────── */}
          <section className="section testimonials-section">
            <div className="container">
              <div className="section-header">
                <span className="text-label">What They Say</span>
                <h2 className="text-heading-2">Trusted by Gentlemen</h2>
                <p className="text-subtitle" style={{ maxWidth: '540px', margin: '0 auto' }}>
                  From regular office wear to once-in-a-lifetime weddings, our customers trust us for the perfect fit.
                </p>
              </div>
              <div className="testi-grid animate-children">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="testi-card animate-fade-in">
                    <div className="svc-stars-row" style={{ marginBottom: '1rem' }}>
                      <span className="svc-stars">
                        {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
                      </span>
                    </div>
                    <p className="testi-text">"{t.text}"</p>
                    <div className="testi-author">
                      <h4 className="testi-name">{t.name}</h4>
                      <span className="testi-role">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>


          {/* ── Loyalty CTA ─────────────────────────────────── */}
          <section className="section loyalty-cta-section">
            <div className="container">
              <div className="loyalty-cta">
                <div className="loyalty-cta-content">
                  <span className="text-label" style={{ color: 'var(--onyx)' }}>Loyalty Programme</span>
                  <h2 className="text-heading-2" style={{ color: 'var(--onyx)', marginTop: '0.75rem' }}>
                    Earn Points on Every Order
                  </h2>
                  <p className="text-subtitle" style={{ color: 'rgba(39, 39, 39, 0.7)', marginTop: '0.75rem' }}>
                    Bronze → Silver → Gold membership. Redeem points for discounts. The more you order, the more you save.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <Link to="/register" className="btn btn-gold btn-lg">Join Now — It's Free</Link>
                    <Link to="/login" className="btn" style={{ background: 'transparent', color: 'var(--onyx)', border: '1.5px solid rgba(26, 26, 26, 0.3)', padding: '1rem 2.5rem' }}>
                      Sign In
                    </Link>
                  </div>
                </div>
                <div className="loyalty-tiers">
                  {[
                    { tier: 'Bronze', pts: '0 – 499 pts', perks: 'Standard delivery, order history' },
                    { tier: 'Silver', pts: '500 – 1499 pts', perks: '5% discount, priority support' },
                    { tier: 'Gold', pts: '1500+ pts', perks: 'Peak season priority, 10% discount' },
                  ].map(t => (
                    <div key={t.tier} className={`tier-card tier-${t.tier.toLowerCase()}`}>
                      <div className="tier-name">{t.tier}</div>
                      <div className="tier-pts">{t.pts}</div>
                      <div className="tier-perks">{t.perks}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {/* ── Instagram Section ───────────────────────────── */}
          <section className="section instagram-section" style={{ background: 'var(--ivory)' }}>
            <div className="container">
              <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <span className="text-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  Follow Us
                </span>
                <h2 className="text-heading-2">@geniustailors</h2>
                <p className="text-subtitle" style={{ maxWidth: '540px', margin: '0.5rem auto 1.5rem' }}>
                  Join our community on Instagram for daily inspiration, behind-the-scenes tailoring, and exclusive drops.
                </p>
                <a href="https://www.instagram.com/geniustailors/" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.75rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  View Instagram
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
              
              <div className="ig-grid">
                {[img1, img3, img4, img5].map((img, idx) => (
                  <a key={idx} href="https://www.instagram.com/geniustailors/" target="_blank" rel="noopener noreferrer" className="ig-post">
                    <img src={img} alt="Instagram post" />
                    <div className="ig-overlay">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
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

          <Footer />
        </div>
      )}

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
    </>
  );
}

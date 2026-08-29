import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';
import { ALL_SERVICES } from './Services';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find static service data by id
    const staticSvc = ALL_SERVICES.find(s => s.id === id || s.id === id.toLowerCase());

    if (!staticSvc) {
      setService(null);
      return;
    }

    // Set immediate static service data so page loads INSTANTLY (0ms delay)
    setService(staticSvc);
    setActiveImage(staticSvc.img);

    // Non-blocking background fetch for dynamic database price & description override
    api.get('/api/services')
      .then(res => {
        const dbServices = res.data;
        const dbSvc = dbServices.find(s => s.name.toLowerCase() === staticSvc.name.toLowerCase());
        
        if (dbSvc) {
          setService(prev => ({
            ...prev,
            price: `From Rs. ${dbSvc.basePrice.toLocaleString()}`,
            desc: dbSvc.description || prev.desc,
            customizations: dbSvc.customizations || null
          }));
        }
      })
      .catch(err => {
        console.error('Failed to sync DB service info:', err);
      });

    // Scroll smoothly to top when switching service route
    window.scrollTo(0, 0);
  }, [id]);

  if (!service) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <Helmet>
          <title>Service Not Found | Genius Tailors</title>
        </Helmet>
        <Navbar />
        <div style={{ padding: '140px 20px', textAlign: 'center' }}>
          <h1 className="text-heading-2" style={{ color: 'var(--onyx)', marginBottom: '1rem' }}>Garment Service Not Found</h1>
          <p style={{ color: 'var(--stone)', marginBottom: '2rem' }}>The requested tailoring service could not be found.</p>
          <Link to="/services" className="btn btn-primary btn-lg">Browse All Services</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter out current service for related products section
  const relatedServices = ALL_SERVICES.filter(s => s.id !== service.id).slice(0, 3);

  // Structured Data (Schema.org JSON-LD) for SEO
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": service.name,
    "image": [service.img, ...(service.images || [])],
    "description": service.desc,
    "sku": `GT-SVC-${service.id.toUpperCase()}`,
    "brand": {
      "@type": "Brand",
      "name": "Genius Tailors"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://geniustailors.com/services/${service.id}`,
      "priceCurrency": "PKR",
      "price": service.price.replace(/[^0-9]/g, '') || "1800",
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Genius Tailors"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": service.stars || "5",
      "reviewCount": service.reviews || "100"
    }
  };

  return (
    <>
      <Helmet>
        <title>Bespoke {service.name} Stitching Online | Genius Tailors Pakistan</title>
        <meta name="description" content={`Order custom-stitched ${service.name} (${service.urdu}) online in Pakistan. ${service.desc.substring(0, 140)}... Perfect fit guaranteed.`} />
        <meta name="keywords" content={`custom ${service.name.toLowerCase()} stitching pakistan, gents ${service.name.toLowerCase()} online, best online tailor pakistan, ${service.name.toLowerCase()} design`} />
        <link rel="canonical" href={`https://geniustailors.com/services/${service.id}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`Bespoke ${service.name} Stitching — Genius Tailors`} />
        <meta property="og:description" content={service.desc} />
        <meta property="og:image" content={service.img} />
        <meta property="og:url" content={`https://geniustailors.com/services/${service.id}`} />

        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
        <Navbar />

        {/* ── Breadcrumb Bar ── */}
        <div style={{ 
          paddingTop: 'calc(var(--nav-height) + 1.5rem)',
          paddingBottom: '1rem',
          background: 'var(--ivory-dark)',
          borderBottom: '1px solid var(--ivory-border)'
        }}>
          <div className="container">
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--stone)' }}>
              <Link to="/" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Home</Link>
              <span>/</span>
              <Link to="/services" style={{ color: 'var(--stone)', textDecoration: 'none' }}>Services</Link>
              <span>/</span>
              <span style={{ color: 'var(--onyx)', fontWeight: 600 }}>{service.name}</span>
            </nav>
          </div>
        </div>

        {/* ── Main Garment Showcase Section ── */}
        <section className="section" style={{ padding: '3rem 0 5rem' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3.5rem',
              alignItems: 'start'
            }} className="svc-detail-grid">
              
              {/* Left Column: Image Showcase */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '3/4',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  background: 'var(--ivory-dark)',
                  border: '1px solid var(--ivory-border)'
                }}>
                  <img 
                    src={activeImage || service.img} 
                    alt={`${service.name} Custom Stitching`} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'all 300ms ease'
                    }}
                  />
                </div>

                {/* Gallery Thumbnails */}
                {service.images && service.images.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.75rem', 
                    marginTop: '1.25rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem'
                  }}>
                    <div 
                      onClick={() => setActiveImage(service.img)}
                      style={{ 
                        width: '72px', 
                        height: '72px', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        cursor: 'pointer', 
                        flexShrink: 0,
                        border: (activeImage === service.img || !activeImage) ? '2.5px solid var(--gold)' : '2px solid var(--ivory-border)',
                        transition: 'border 200ms ease'
                      }}
                    >
                      <img src={service.img} alt={`${service.name} Main`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {service.images.map((imgUrl, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveImage(imgUrl)}
                        style={{ 
                          width: '72px', 
                          height: '72px', 
                          borderRadius: '10px', 
                          overflow: 'hidden', 
                          cursor: 'pointer', 
                          flexShrink: 0,
                          border: activeImage === imgUrl ? '2.5px solid var(--gold)' : '2px solid var(--ivory-border)',
                          transition: 'border 200ms ease'
                        }}
                      >
                        <img src={imgUrl} alt={`${service.name} detail view ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Guarantee Banner under images */}
                <div style={{
                  marginTop: '2rem',
                  padding: '1.25rem',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--ivory-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ fontSize: '2rem' }}>✂️</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--onyx)', fontFamily: 'var(--font-serif)' }}>Master Tailor Craftsmanship</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--stone)' }}>Every garment is individually cut and handcrafted by experienced tailors in Sindh.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Garment Information & CTAs */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="text-label">{service.category} Garment</span>
                  <span style={{
                    fontSize: '1.2rem',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--stone)',
                    direction: 'rtl'
                  }}>
                    {service.urdu}
                  </span>
                </div>

                <h1 className="text-heading-1" style={{ fontSize: '2.5rem', lineHeight: 1.2, color: 'var(--onyx)' }}>
                  Bespoke {service.name}
                </h1>
                
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.2rem',
                  color: 'var(--gold)',
                  fontStyle: 'italic',
                  marginTop: '0.25rem'
                }}>
                  "{service.tagline}"
                </p>

                {/* Rating Row - Stacked line by line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', marginTop: '1rem' }}>
                  <div style={{ color: '#F39C12', fontSize: '1rem', letterSpacing: '1.5px' }}>
                    {'★'.repeat(service.stars)}{'☆'.repeat(5 - service.stars)}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--onyx)' }}>5.0 Overall Rating</span>
                  <span style={{ color: 'var(--stone)', fontSize: '0.8rem' }}>({service.reviews} verified customer reviews)</span>
                </div>

                {/* Price & Delivery Highlight Card */}
                <div className="svc-price-highlight-card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '0.85rem 1.25rem',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--ivory-border)',
                  margin: '1.5rem 0',
                  boxShadow: 'var(--shadow-sm)',
                  flexWrap: 'wrap'
                }}>
                  <div className="svc-price-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--stone)', fontWeight: 600 }}>
                      Stitching Rate:
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--onyx)', fontWeight: 700 }}>
                      {service.price}
                    </span>
                  </div>

                  <div className="svc-price-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--stone)', fontWeight: 600 }}>
                      Stitching Time:
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--onyx)', fontWeight: 600 }}>
                      {service.deliveryDays}
                    </span>
                  </div>
                </div>

                {/* Story Description */}
                <div style={{ color: 'var(--stone)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '2rem' }}>
                  <p>{service.desc}</p>
                  <p style={{ marginTop: '0.75rem' }}>
                    Unlike off-the-rack standard sizes, our custom-tailored <strong>{service.name}</strong> is built strictly according to your body dimensions and personal fitting preferences. Choose your collar styles, sleeve cuffs, plackets, and pocket options to build a timeless wardrobe staple.
                  </p>
                </div>

                {/* What's Included / Options */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--onyx)', marginBottom: '0.75rem', fontWeight: 700 }}>
                    Tailoring Customizations Included
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {service.features.map(f => (
                      <span key={f} style={{
                        background: 'white',
                        border: '1px solid var(--ivory-border)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.4rem 0.9rem',
                        fontSize: '0.875rem',
                        color: 'var(--onyx)',
                        fontWeight: 500
                      }}>
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Best For / Occasions */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--onyx)', marginBottom: '0.75rem', fontWeight: 700 }}>
                    Recommended Occasions
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {service.occasions.map(o => (
                      <span key={o} style={{
                        background: 'rgba(201,169,110,0.12)',
                        border: '1px solid rgba(201,169,110,0.3)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.4rem 0.9rem',
                        fontSize: '0.875rem',
                        color: 'var(--onyx)',
                        fontWeight: 600
                      }}>
                        🏷️ {o}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="svc-cta-buttons" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <Link 
                    to={`/book?service=${encodeURIComponent(service.name)}`} 
                    className="btn btn-gold btn-lg" 
                    style={{ 
                      flex: 1, 
                      minWidth: '200px', 
                      justifyContent: 'center', 
                      fontSize: '0.95rem', 
                      padding: '0.85rem 1.25rem',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      lineHeight: 1.3
                    }}
                  >
                    Order {service.name} Now →
                  </Link>
                  <Link 
                    to="/contact" 
                    className="btn btn-outline btn-lg"
                    style={{ 
                      minWidth: '140px', 
                      justifyContent: 'center', 
                      fontSize: '0.95rem', 
                      padding: '0.85rem 1.25rem',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      lineHeight: 1.3
                    }}
                  >
                    Inquire Fitting
                  </Link>
                </div>

                {/* Trust Highlights */}
                <div className="svc-trust-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  marginTop: '2.5rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid var(--ivory-border)',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '1.25rem', display: 'block' }}>📐</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--onyx)', display: 'block', marginTop: '0.25rem' }}>Exact Measurements</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--stone)' }}>No generic standard sizing</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.25rem', display: 'block' }}>🚚</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--onyx)', display: 'block', marginTop: '0.25rem' }}>Doorstep Delivery</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--stone)' }}>Delivered straight to you</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '1.25rem', display: 'block' }}>🔄</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--onyx)', display: 'block', marginTop: '0.25rem' }}>Fit Guarantee</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--stone)' }}>Free alterations if needed</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ── SEO Deep-Dive Section ── */}
        <section className="section" style={{ background: 'white', padding: '4rem 0', borderTop: '1px solid var(--ivory-border)' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h2 className="text-heading-2" style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--onyx)' }}>
              Why Choose Genius Tailors for Your {service.name}?
            </h2>
            <div style={{ color: 'var(--stone)', lineHeight: 1.9, fontSize: '1.05rem' }}>
              <p style={{ marginBottom: '1.25rem' }}>
                At <strong>Genius Tailors</strong>, we take immense pride in crafting bespoke Pakistani menswear. When you order a custom <strong>{service.name}</strong>, our master tailors carefully review your measurement profile to ensure the armhole drop, chest taper, kameez length, and cuff width align with your exact physique.
              </p>
              <p style={{ marginBottom: '1.25rem' }}>
                We work with both customer-provided fabrics and our in-house luxury cotton, wash-and-wear, wool blend, and boski fabric inventory. Whether you prefer a soft Ban collar, classic straight collar, or detailed embroidery on the front placket, every single detail is executed with precision stitching.
              </p>
            </div>
          </div>
        </section>

        {/* ── Related Services Section ── */}
        <section className="section" style={{ background: '#111111', color: 'white', padding: '5rem 0' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="text-label" style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}>— SIGNATURE COLLECTION —</span>
              <h2 className="text-heading-2" style={{ color: 'white', fontSize: '2.4rem', marginTop: '0.5rem' }}>
                Explore Other Custom Garments
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '0.95rem' }}>
                Every garment is individually cut and handcrafted to your exact body measurements.
              </p>
            </div>
            
            <div className="related-svcs-grid">
              {relatedServices.map(rel => (
                <Link key={rel.id} to={`/services/${rel.id}`} className="rel-card-link">
                  <div className="rel-card">
                    <div className="rel-card-img-wrap">
                      <img src={rel.img} alt={rel.name} className="rel-card-img" />
                      
                      {/* Gradient Overlay */}
                      <div className="rel-card-gradient" />
                      
                      {/* Top Badges */}
                      <div className="rel-card-top-bar">
                        <span className="rel-badge-tag" style={{ background: rel.badgeColor || 'var(--gold)' }}>
                          {rel.badge}
                        </span>
                        <span className="rel-urdu-pill">{rel.urdu}</span>
                      </div>

                      {/* Floating bottom preview title */}
                      <div className="rel-card-img-footer">
                        <span className="rel-category">{rel.category}</span>
                        <h3 className="rel-title">{rel.name}</h3>
                      </div>
                    </div>

                    <div className="rel-card-body">
                      <p className="rel-tagline">"{rel.tagline}"</p>
                      
                      <div className="rel-rating-row">
                        <span style={{ color: '#F39C12', fontSize: '0.85rem' }}>{'★'.repeat(rel.stars)}</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>({rel.reviews} verified reviews)</span>
                      </div>

                      <div className="rel-footer">
                        <div className="rel-price-wrap">
                          <span className="rel-price-label">Starting</span>
                          <span className="rel-price-val">{rel.price}</span>
                        </div>
                        <span className="rel-action-btn">
                          View Details <span className="arrow-icon">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comprehensive SEO Tailoring Guide Section ── */}
        <section className="section" style={{ background: 'white', padding: '4.5rem 0', borderTop: '1px solid var(--ivory-border)' }}>
          <div className="container" style={{ maxWidth: '960px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="text-label" style={{ color: 'var(--gold)', letterSpacing: '0.12em' }}>— ONLINE BESPOKE TAILORING GUIDE —</span>
              <h2 className="text-heading-2" style={{ color: 'var(--onyx)', fontSize: '2rem', marginTop: '0.4rem' }}>
                Bespoke Gents Tailoring & Online Stitching in Pakistan
              </h2>
            </div>

            <div style={{ color: 'var(--stone)', lineHeight: 1.85, fontSize: '0.975rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <article style={{ background: 'var(--ivory)', padding: '1.75rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ivory-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--onyx)', marginBottom: '0.75rem' }}>
                  1. The Art of Custom {service.name} Handcrafting
                </h3>
                <p>
                  At <strong>Genius Tailors</strong>, every <strong>{service.name} ({service.urdu})</strong> is tailored individually with meticulous attention to detail. Unlike mass-produced off-the-rack clothing, custom tailoring ensures your garment contours naturally to your shoulders, chest, waistline, and leg fall. Our master tailors in Sindh combine decades of heritage craftsmanship with contemporary Pakistani sartorial cuts—ensuring zero collar puckering, crisp front plackets, and reinforced double-needle seam durability.
                </p>
              </article>

              <article style={{ background: 'var(--ivory)', padding: '1.75rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ivory-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--onyx)', marginBottom: '0.75rem' }}>
                  2. Premium Fabric Options & Style Personalization
                </h3>
                <p>
                  Whether you choose to send us your own unstitched suit fabric or select from our curated stock of <em>Egyptian Cotton, Latha, Wash & Wear, Pure Boski, and Tropical Wool blends</em>, we accommodate every personal preference. Customize your <strong>{service.name}</strong> with soft Ban collars, shirt collars, single or double buttons, rounded sleeve cuffs, and concealed pockets. Every measurement is stored permanently in your digital profile for seamless future re-ordering.
                </p>
              </article>

              <article style={{ background: 'var(--ivory)', padding: '1.75rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--ivory-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--onyx)', marginBottom: '0.75rem' }}>
                  3. Doorstep Pickup, Delivery & Perfect Fit Guarantee
                </h3>
                <p>
                  We bring Pakistan's premier gents tailoring experience directly to your doorstep. Schedule a sample suit pickup or submit your dimensions online—our logistics network covers Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Faisalabad, and nationwide delivery. Every order comes backed by our <strong>100% Fit Guarantee</strong>: if any alteration is required, our master tailors will alter it free of charge.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ── Luxury Related CSS ── */}
        <style>{`
          .related-svcs-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2.25rem;
          }

          .rel-card-link {
            text-decoration: none;
            color: inherit;
            display: block;
          }

          .rel-card {
            background: #1A1A1A;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            overflow: hidden;
            transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .rel-card:hover {
            transform: translateY(-8px);
            border-color: rgba(201, 169, 110, 0.4);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(201, 169, 110, 0.15);
          }

          .rel-card-img-wrap {
            position: relative;
            height: 340px;
            overflow: hidden;
            background: #0A0A0A;
          }

          .rel-card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 600ms cubic-bezier(0.165, 0.84, 0.44, 1);
          }

          .rel-card:hover .rel-card-img {
            transform: scale(1.08);
          }

          .rel-card-gradient {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(26,26,26,0.95) 100%);
            pointer-events: none;
          }

          .rel-card-top-bar {
            position: absolute;
            top: 16px;
            left: 16px;
            right: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 2;
          }

          .rel-badge-tag {
            color: white;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.35rem 0.8rem;
            border-radius: 20px;
            letter-spacing: 0.03em;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          }

          .rel-urdu-pill {
            color: rgba(255,255,255,0.95);
            background: rgba(0,0,0,0.55);
            backdrop-filter: blur(8px);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.95rem;
            border: 1px solid rgba(255,255,255,0.2);
          }

          .rel-card-img-footer {
            position: absolute;
            bottom: 16px;
            left: 20px;
            right: 20px;
            z-index: 2;
          }

          .rel-category {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--gold);
            font-weight: 600;
            display: block;
          }

          .rel-title {
            font-family: var(--font-serif);
            font-size: 1.35rem;
            color: white;
            margin: 0.2rem 0 0 0;
            line-height: 1.25;
          }

          .rel-card-body {
            padding: 1.25rem 1.5rem 1.5rem;
            display: flex;
            flex-direction: column;
            flex: 1;
            justify-content: space-between;
            gap: 1rem;
          }

          .rel-tagline {
            font-size: 0.875rem;
            color: rgba(255,255,255,0.65);
            font-style: italic;
            margin: 0;
            line-height: 1.5;
          }

          .rel-rating-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .rel-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin-top: 0.25rem;
          }

          .rel-price-wrap {
            display: flex;
            flex-direction: column;
          }

          .rel-price-label {
            font-size: 0.68rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(255,255,255,0.45);
          }

          .rel-price-val {
            font-family: var(--font-serif);
            font-size: 1.15rem;
            color: var(--gold);
            font-weight: 600;
          }

          .rel-action-btn {
            font-size: 0.85rem;
            font-weight: 600;
            color: white;
            background: rgba(255, 255, 255, 0.08);
            padding: 0.5rem 1rem;
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 250ms ease;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }

          .rel-card:hover .rel-action-btn {
            background: var(--gold);
            color: #111;
            border-color: var(--gold);
          }

          .rel-card:hover .arrow-icon {
            transform: translateX(4px);
          }

          .arrow-icon {
            transition: transform 200ms ease;
            display: inline-block;
          }

          /* Tag Track Styles */
          .customizations-tag-container {
            overflow: hidden;
            width: 100%;
          }

          .customizations-tag-track {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .custom-tag-chip {
            background: white;
            border: 1px solid var(--ivory-border);
            border-radius: var(--radius-full);
            padding: 0.4rem 0.9rem;
            font-size: 0.875rem;
            color: var(--onyx);
            font-weight: 500;
            white-space: nowrap;
          }

          .mobile-dup-chip {
            display: none;
          }

          @media (max-width: 992px) {
            .svc-detail-grid {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
            .svc-detail-grid > div:first-child {
              position: static !important;
            }
            .related-svcs-grid {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
          }

          @media (max-width: 640px) {
            .svc-detail-grid {
              gap: 1.5rem !important;
            }
            .text-heading-1 {
              font-size: 1.5rem !important;
              line-height: 1.25 !important;
            }
            .rel-card-img-wrap {
              height: 220px !important;
            }
            section.section {
              padding: 2rem 0 !important;
            }
            .btn-lg {
              font-size: 0.85rem !important;
              padding: 0.75rem 1rem !important;
            }
            .svc-cta-buttons {
              flex-direction: column !important;
              width: 100% !important;
              gap: 0.6rem !important;
            }
            .svc-cta-buttons a {
              width: 100% !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
            }
          }
        `}</style>

        <Footer />
      </div>
    </>
  );
}

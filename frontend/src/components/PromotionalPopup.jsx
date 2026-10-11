import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function PromotionalPopup() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const location = useLocation();
  const navigate = useNavigate();
  const trackedViewRef = useRef(false);
  const trackedClickRef = useRef(false);

  // Form State for CTA type === 'form'
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    trackedViewRef.current = false;
    trackedClickRef.current = false;

    // Fetch active popup from API
    api.get('/api/popups/active')
      .then(res => {
        if (res.data && res.data._id) {
          const activeData = res.data;

          // 1. Target Page Verification
          const currentPath = location.pathname;
          const target = activeData.targetPages || 'all';

          let pageMatches = false;
          if (target === 'all') pageMatches = true;
          else if (target === 'home' && currentPath === '/') pageMatches = true;
          else if (target === 'booking' && currentPath.startsWith('/booking')) pageMatches = true;
          else if (target === 'services' && currentPath.startsWith('/services')) pageMatches = true;
          else if (target === 'custom' && activeData.customPagePath && currentPath === activeData.customPagePath) pageMatches = true;

          if (!pageMatches) return;

          // 2. Check Session Dismissal
          if (activeData.showOncePerSession) {
            const dismissedKey = `gt_popup_dismissed_${activeData._id}`;
            if (sessionStorage.getItem(dismissedKey)) {
              return;
            }
          }

          setPopup(activeData);
        }
      })
      .catch(console.error);
  }, [location.pathname]);

  // 3. Smart Trigger Logic
  useEffect(() => {
    if (!popup) return;

    const trigger = popup.triggerType || 'time_delay';

    const triggerPopup = () => {
      setVisible(true);
      if (!trackedViewRef.current && popup._id) {
        trackedViewRef.current = true;
        api.post(`/api/popups/${popup._id}/track-view`).catch(console.error);
      }
    };

    if (trigger === 'immediate') {
      triggerPopup();
    } else if (trigger === 'time_delay') {
      const timer = setTimeout(triggerPopup, (popup.delaySeconds || 2) * 1000);
      return () => clearTimeout(timer);
    } else if (trigger === 'scroll_percentage') {
      const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight > 0) {
          const currentPct = (scrollTop / scrollHeight) * 100;
          const targetPct = popup.scrollPercentage || 30;
          if (currentPct >= targetPct) {
            triggerPopup();
            window.removeEventListener('scroll', handleScroll);
          }
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else if (trigger === 'exit_intent') {
      const handleMouseLeave = (e) => {
        if (e.clientY <= 10) {
          triggerPopup();
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [popup]);

  // Countdown timer ticker
  useEffect(() => {
    if (!popup || !popup.enableCountdown || !popup.countdownEndTime) return;

    const interval = setInterval(() => {
      const target = new Date(popup.countdownEndTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(target - now, 0);

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [popup]);

  const trackClickHit = () => {
    if (!trackedClickRef.current && popup && popup._id) {
      trackedClickRef.current = true;
      api.post(`/api/popups/${popup._id}/track-click`).catch(console.error);
    }
  };

  const handleClose = () => {
    setVisible(false);
    if (popup && popup.showOncePerSession) {
      sessionStorage.setItem(`gt_popup_dismissed_${popup._id}`, 'true');
    }
  };

  const handleCtaClick = () => {
    trackClickHit();
    if (popup.ctaType === 'link' && popup.ctaLink) {
      handleClose();
      if (popup.ctaLink.startsWith('http')) {
        window.location.href = popup.ctaLink;
      } else {
        navigate(popup.ctaLink);
      }
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    trackClickHit();
    setSubmittingLead(true);
    try {
      await api.post('/api/popups/submit-lead', {
        name: leadName,
        phone: leadPhone,
        popupTitle: popup.title
      });
      setLeadSubmitted(true);
      toast.success(popup.ctaSuccessMessage || 'Lead submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit lead. Please try again.');
    } finally {
      setSubmittingLead(false);
    }
  };

  if (!visible || !popup) return null;

  const template = popup.template || (popup.imagePlacement === 'left' || popup.imagePlacement === 'right' ? 'split-card' : 'hero-card');
  const placement = popup.imagePlacement || 'top';
  const hasImage = Boolean(popup.imageUrl);
  const isBottomSheet = template === 'bottom-banner';
  const isCircular = template === 'circular-badge';

  return (
    <div 
      className={`gt-popup-overlay ${isBottomSheet ? 'is-bottom-sheet' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`gt-popup-card gt-popup-card--${template} ${template === 'split-card' && placement === 'right' ? 'split-reverse' : ''}`}
        style={{
          backgroundColor: popup.backgroundColor || (template === 'luxury-dark' ? '#141414' : isCircular ? '#1e1b4b' : '#ffffff'),
          color: popup.descriptionColor || (template === 'luxury-dark' ? '#d4d4d8' : isCircular ? '#e0e7ff' : '#475569')
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="gt-popup-close-btn"
          aria-label="Close popup"
          title="Close Popup"
        >
          &times;
        </button>

        {/* Top / Side Image (Not shown for circular template unless specified, but if provided shown cleanly) */}
        {hasImage && !isCircular && (
          <div className="gt-popup-img-wrap">
            <img
              src={popup.imageUrl}
              alt={popup.title}
              className="gt-popup-img"
              loading="lazy"
            />
          </div>
        )}

        {/* Content Section */}
        <div className="gt-popup-body">
          {/* Badge */}
          {popup.badgeText && (
            <div style={{ textAlign: isCircular ? 'center' : 'inherit' }}>
              <span
                className="gt-popup-badge"
                style={{
                  backgroundColor: popup.badgeBgColor || (template === 'luxury-dark' ? '#C9A96E' : isCircular ? '#ec4899' : '#ef4444'),
                  color: popup.badgeTextColor || (template === 'luxury-dark' ? '#000000' : '#ffffff')
                }}
              >
                {popup.badgeText}
              </span>
            </div>
          )}

          {/* Title */}
          <h2
            className="gt-popup-title"
            style={{
              color: popup.titleColor || (template === 'luxury-dark' ? '#FDFBF7' : isCircular ? '#ffffff' : '#0f172a'),
              fontFamily: template === 'luxury-dark' ? 'var(--font-serif)' : 'inherit',
              textAlign: isCircular ? 'center' : 'inherit'
            }}
          >
            {popup.title}
          </h2>

          {/* Description */}
          {popup.description && (
            <p
              className="gt-popup-desc"
              style={{
                color: popup.descriptionColor || (template === 'luxury-dark' ? '#a1a1aa' : isCircular ? '#c7d2fe' : '#475569'),
                textAlign: isCircular ? 'center' : 'inherit'
              }}
            >
              {popup.description}
            </p>
          )}

          {/* Countdown Timer */}
          {popup.enableCountdown && (
            <div
              className="gt-popup-timer"
              style={{
                backgroundColor: popup.timerBgColor || (template === 'luxury-dark' ? 'rgba(201, 169, 110, 0.12)' : isCircular ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'),
                color: popup.timerTextColor || (template === 'luxury-dark' ? '#C9A96E' : isCircular ? '#ffffff' : '#0f172a'),
                border: template === 'luxury-dark' ? '1px solid rgba(201, 169, 110, 0.3)' : 'none'
              }}
            >
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, display: 'block', lineHeight: 1 }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>Hours</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>:</span>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, display: 'block', lineHeight: 1 }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>Mins</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>:</span>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, display: 'block', lineHeight: 1 }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>Secs</span>
              </div>
            </div>
          )}

          {/* CTA Form / Button */}
          {popup.ctaType === 'form' ? (
            leadSubmitted ? (
              <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '14px', borderRadius: '10px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ✓ {popup.ctaSuccessMessage || 'Thank you! We will get in touch shortly.'}
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="gt-popup-input"
                  style={{
                    backgroundColor: template === 'luxury-dark' ? '#1c1c1c' : isCircular ? 'rgba(255,255,255,0.1)' : '#ffffff',
                    color: template === 'luxury-dark' || isCircular ? '#ffffff' : '#0f172a',
                    borderColor: template === 'luxury-dark' ? '#333333' : isCircular ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
                  }}
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp Number *"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="gt-popup-input"
                  style={{
                    backgroundColor: template === 'luxury-dark' ? '#1c1c1c' : isCircular ? 'rgba(255,255,255,0.1)' : '#ffffff',
                    color: template === 'luxury-dark' || isCircular ? '#ffffff' : '#0f172a',
                    borderColor: template === 'luxury-dark' ? '#333333' : isCircular ? 'rgba(255,255,255,0.2)' : '#cbd5e1'
                  }}
                />
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="gt-popup-btn"
                  style={{
                    backgroundColor: popup.ctaBgColor || (template === 'luxury-dark' ? '#C9A96E' : isCircular ? '#ec4899' : '#0f172a'),
                    color: popup.ctaTextColor || (template === 'luxury-dark' ? '#000000' : '#ffffff')
                  }}
                >
                  {submittingLead ? 'Submitting...' : (popup.ctaText || 'Claim Offer Now')}
                </button>
              </form>
            )
          ) : (
            <button
              onClick={handleCtaClick}
              className="gt-popup-btn"
              style={{
                backgroundColor: popup.ctaBgColor || (template === 'luxury-dark' ? '#C9A96E' : isCircular ? '#ec4899' : '#0f172a'),
                color: popup.ctaTextColor || (template === 'luxury-dark' ? '#000000' : '#ffffff')
              }}
            >
              {popup.ctaText || 'Claim Offer'} →
            </button>
          )}

          {/* Subtle Trust Note */}
          <p style={{
            fontSize: '0.725rem',
            textAlign: 'center',
            margin: '0.75rem 0 0 0',
            opacity: 0.65,
            color: 'inherit'
          }}>
            🔒 Exclusive offer • No spam guarantee
          </p>
        </div>
      </div>
    </div>
  );
}

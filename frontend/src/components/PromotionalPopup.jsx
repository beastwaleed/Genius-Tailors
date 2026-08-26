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

  const placement = popup.imagePlacement || 'left';
  const hasImage = Boolean(popup.imageUrl);

  const isHorizontalSplit = hasImage && (placement === 'left' || placement === 'right');
  const isTopImage = hasImage && placement === 'top';
  const isBottomImage = hasImage && placement === 'bottom';

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: popup.backgroundColor || '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          maxWidth: isHorizontalSplit ? '780px' : '520px',
          width: '100%',
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: isHorizontalSplit ? (placement === 'left' ? 'row' : 'row-reverse') : (isBottomImage ? 'column-reverse' : 'column'),
          color: popup.descriptionColor || '#475569'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#ffffff',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}
          title="Close Popup"
        >
          &times;
        </button>

        {/* Image Section */}
        {hasImage && (
          <div
            style={{
              flex: isHorizontalSplit ? 1 : 'none',
              height: isHorizontalSplit ? 'auto' : (isTopImage || isBottomImage ? '220px' : 'auto'),
              minHeight: isHorizontalSplit ? '320px' : 'auto',
              position: 'relative',
              background: '#f8fafc',
              overflow: 'hidden'
            }}
          >
            <img
              src={popup.imageUrl}
              alt={popup.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}

        {/* Content Section */}
        <div
          style={{
            flex: isHorizontalSplit ? 1.2 : 1,
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflowY: 'auto'
          }}
        >
          {/* Badge */}
          {popup.badgeText && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span
                style={{
                  backgroundColor: popup.badgeBgColor || '#ef4444',
                  color: popup.badgeTextColor || '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  display: 'inline-block'
                }}
              >
                {popup.badgeText}
              </span>
            </div>
          )}

          {/* Title */}
          <h2
            style={{
              color: popup.titleColor || '#0f172a',
              fontSize: '1.6rem',
              fontWeight: '800',
              lineHeight: 1.25,
              margin: '0 0 0.75rem 0',
              fontFamily: 'var(--font-serif)'
            }}
          >
            {popup.title}
          </h2>

          {/* Description */}
          {popup.description && (
            <p
              style={{
                color: popup.descriptionColor || '#475569',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                margin: '0 0 1.25rem 0'
              }}
            >
              {popup.description}
            </p>
          )}

          {/* Countdown Timer */}
          {popup.enableCountdown && (
            <div
              style={{
                backgroundColor: popup.timerBgColor || '#f1f5f9',
                color: popup.timerTextColor || '#0f172a',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                textAlign: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block' }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8 }}>Hours</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>:</span>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8 }}>Mins</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>:</span>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8 }}>Secs</span>
              </div>
            </div>
          )}

          {/* CTA Section */}
          {popup.ctaType === 'form' ? (
            leadSubmitted ? (
              <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ✓ {popup.ctaSuccessMessage || 'Thank you! We will get in touch shortly.'}
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp Number *"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem' }}
                />
                <button
                  type="submit"
                  disabled={submittingLead}
                  style={{
                    backgroundColor: popup.ctaBgColor || '#0f172a',
                    color: popup.ctaTextColor || '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {submittingLead ? 'Submitting...' : (popup.ctaText || 'Submit')}
                </button>
              </form>
            )
          ) : (
            <button
              onClick={handleCtaClick}
              style={{
                backgroundColor: popup.ctaBgColor || '#0f172a',
                color: popup.ctaTextColor || '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'center',
                width: '100%',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s'
              }}
            >
              {popup.ctaText || 'Claim Offer'} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

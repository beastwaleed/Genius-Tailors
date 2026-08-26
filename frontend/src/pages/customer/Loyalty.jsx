import { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function Loyalty() {
  const { user, updateUser } = useAuth();
  const points = user?.loyaltyPoints || 0;
  const [uploading, setUploading] = useState(false);
  const [platform, setPlatform] = useState(null);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const { data } = await api.get('/api/profile');
        updateUser(data);
      } catch (err) {
        console.error('Failed to sync latest profile stats', err);
      }
    };
    fetchLatestProfile();
  }, []);

  const handleUploadScreenshot = async (e, selectedPlatform) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setPlatform(selectedPlatform);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Upload the image
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Submit the reward request
      await api.post('/api/rewards/social', {
        platform: selectedPlatform,
        screenshot: data.imageUrl
      });

      import('react-hot-toast').then(toast => {
        toast.default.success(`${selectedPlatform} screenshot submitted! Admin will approve your 5 points soon.`, { duration: 5000 });
      });
    } catch (err) {
      console.error(err);
      import('react-hot-toast').then(toast => {
        toast.default.error(err.response?.data?.message || 'Failed to submit screenshot.');
      });
    } finally {
      setUploading(false);
      setPlatform(null);
      e.target.value = ''; // reset file input
    }
  };
  
  
  // Calculate tier and progress
  let currentTier = 'Bronze';
  let nextTier = 'Silver';
  let pointsNeeded = 1000 - points;
  let progress = (points / 1000) * 100;

  if (points >= 3000) {
    currentTier = 'Gold';
    nextTier = 'Platinum';
    pointsNeeded = 10000 - points;
    progress = ((points - 3000) / 7000) * 100;
  } else if (points >= 1000) {
    currentTier = 'Silver';
    nextTier = 'Gold';
    pointsNeeded = 3000 - points;
    progress = ((points - 1000) / 2000) * 100;
  }

  return (
    <CustomerLayout title="Loyalty & Rewards">
      <div className="premium-dashboard">
        
        {/* Tier Card */}
        <div style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '16px', padding: '1.75rem 2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {currentTier} Member Tier
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Genius VIP Club</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-serif)', lineHeight: 1, color: '#FFFFFF' }}>{points}</span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Points</span>
            </div>
            
            <div style={{ maxWidth: '420px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: '#CBD5E1', marginBottom: '0.4rem' }}>
                <span>{pointsNeeded > 0 ? `${pointsNeeded} points to ${nextTier}` : 'Max Tier Reached!'}</span>
                <span style={{ fontWeight: 700 }}>{Math.min(100, Math.round(progress))}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #C9A96E 0%, #E8D5A3 100%)', borderRadius: '9999px', width: `${Math.min(100, progress)}%`, transition: 'width 500ms ease' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{ marginTop: '1.5rem' }}>
          <h2 className="premium-title" style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Your Tier Benefits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="premium-glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚚</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>Free Shipping</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>Enjoy complimentary delivery on all bespoke orders over Rs. 10,000.</p>
            </div>
            <div className="premium-glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✂️</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>Priority Tailoring</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>Your orders skip standard queue lines and go straight to our master tailors.</p>
            </div>
            <div className="premium-glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎁</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>VIP Gifts</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>Receive custom accessories and seasonal tailoring perks on your birthday.</p>
            </div>
          </div>
        </div>

        {/* Earn More Points */}
        <div style={{ marginTop: '1.5rem' }}>
          <h2 className="premium-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>Earn More Points</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1rem 0' }}>Follow us on social media and upload a screenshot to claim +5 points instantly upon approval.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div className="premium-glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>Instagram (+5 Points)</h4>
                <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0 0 1rem 0' }}>Follow @geniustailors on Instagram and upload proof.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href="https://instagram.com/geniustailors" target="_blank" rel="noreferrer" className="premium-link" style={{ padding: '0.45rem 0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none' }}>
                  Visit Profile ↗
                </a>
                <label className="btn btn-primary btn-sm" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '6px' }}>
                  {uploading && platform === 'Instagram' ? 'Uploading...' : 'Upload Screenshot'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUploadScreenshot(e, 'Instagram')} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="premium-glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>TikTok (+5 Points)</h4>
                <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0 0 1rem 0' }}>Follow @geniustailors on TikTok and upload proof.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href="https://www.tiktok.com/@geniustailors" target="_blank" rel="noreferrer" className="premium-link" style={{ padding: '0.45rem 0.75rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none' }}>
                  Visit Profile ↗
                </a>
                <label className="btn btn-primary btn-sm" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '6px' }}>
                  {uploading && platform === 'TikTok' ? 'Uploading...' : 'Upload Screenshot'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUploadScreenshot(e, 'TikTok')} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .loyalty-hero {
          background: var(--onyx);
          color: white;
          padding: 4rem 3rem;
          position: relative;
          overflow: hidden;
          border: none;
        }

        .loyalty-hero-content {
          position: relative;
          z-index: 2;
        }

        .tier-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: var(--gold);
          margin: 0 0 1.5rem 0;
          letter-spacing: 1px;
        }

        .points-display {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 3rem;
        }

        .points-value {
          font-family: var(--font-serif);
          font-size: 4rem;
          line-height: 1;
        }

        .points-label {
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.85rem;
        }

        .progress-container {
          max-width: 400px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.8);
          margin-bottom: 0.5rem;
        }

        .progress-bar-bg {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--gold);
          border-radius: 2px;
        }

        .loyalty-hero-bg {
          position: absolute;
          right: -20px;
          bottom: -40px;
          z-index: 1;
          pointer-events: none;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .benefit-card {
          padding: 2rem;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .benefit-card:hover {
          transform: translateY(-5px);
        }

        .benefit-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .benefit-card h4 {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          color: var(--onyx);
          margin-bottom: 0.5rem;
        }

        .benefit-card p {
          font-size: 0.85rem;
          color: var(--stone);
          line-height: 1.5;
        }

        .social-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .social-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .benefits-grid {
            grid-template-columns: 1fr;
          }
          .loyalty-hero {
            padding: 2rem;
          }
        }
      `}</style>
    </CustomerLayout>
  );
}

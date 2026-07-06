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
      <div className="luxury-workspace-inner" style={{ maxWidth: '800px' }}>
        
        <div className="luxury-card loyalty-hero">
          <div className="loyalty-hero-content">
            <h2 className="tier-title">{currentTier} Tier</h2>
            <div className="points-display">
              <span className="points-value">{points}</span>
              <span className="points-label">Total Points</span>
            </div>
            
            <div className="progress-container">
              <div className="progress-header">
                <span>{pointsNeeded > 0 ? `${pointsNeeded} points to ${nextTier}` : 'Max Tier Reached!'}</span>
                <span>{Math.min(100, Math.round(progress))}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }}></div>
              </div>
            </div>
          </div>
          <div className="loyalty-hero-bg">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
        </div>

        <div className="luxury-section" style={{ marginTop: '3rem' }}>
          <h2 className="luxury-section-title">Your Benefits</h2>
          <div className="benefits-grid">
            <div className="luxury-card benefit-card">
              <div className="benefit-icon">🚚</div>
              <h4>Free Shipping</h4>
              <p>Enjoy complimentary shipping on all orders over Rs. 10,000.</p>
            </div>
            <div className="luxury-card benefit-card">
              <div className="benefit-icon">✂️</div>
              <h4>Priority Tailoring</h4>
              <p>Your orders skip the queue and go straight to our master tailors.</p>
            </div>
            <div className="luxury-card benefit-card">
              <div className="benefit-icon">🎁</div>
              <h4>Birthday Gift</h4>
              <p>Receive an exclusive accessory tailored for you on your birthday.</p>
            </div>
          </div>
        </div>

        <div className="luxury-section" style={{ marginTop: '4rem' }}>
          <h2 className="luxury-section-title">Earn More Points</h2>
          <p style={{ color: 'var(--stone)', marginBottom: '2rem' }}>Follow us on social media and share a screenshot to earn 5 points instantly upon admin approval!</p>
          
          <div className="benefits-grid">
            <div className="luxury-card benefit-card social-card">
              <i className="fa-brands fa-instagram social-icon" style={{ color: '#E1306C' }}></i>
              <h4>Instagram</h4>
              <p>Follow @geniustailors</p>
              <a href="https://instagram.com/geniustailors" target="_blank" rel="noreferrer" className="luxury-btn-outline btn-sm" style={{ marginBottom: '1rem', display: 'inline-block' }}>Visit Profile</a>
              
              <label className="luxury-btn-primary btn-sm" style={{ cursor: 'pointer', display: 'block' }}>
                {uploading && platform === 'Instagram' ? 'Uploading...' : 'Upload Screenshot'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUploadScreenshot(e, 'Instagram')} disabled={uploading} />
              </label>
            </div>

            <div className="luxury-card benefit-card social-card">
              <i className="fa-brands fa-tiktok social-icon" style={{ color: '#000000' }}></i>
              <h4>TikTok</h4>
              <p>Follow @geniustailors</p>
              <a href="https://www.tiktok.com/@geniustailors" target="_blank" rel="noreferrer" className="luxury-btn-outline btn-sm" style={{ marginBottom: '1rem', display: 'inline-block' }}>Visit Profile</a>
              
              <label className="luxury-btn-primary btn-sm" style={{ cursor: 'pointer', display: 'block' }}>
                {uploading && platform === 'TikTok' ? 'Uploading...' : 'Upload Screenshot'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUploadScreenshot(e, 'TikTok')} disabled={uploading} />
              </label>
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

import { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pastReviews, setPastReviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/api/orders/myorders');
      setOrders(data);
      
      // Mock past reviews for now (until backend model is added)
      const storedReviews = JSON.parse(localStorage.getItem('gt_mock_reviews') || '[]');
      setPastReviews(storedReviews);

    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  // Find orders that are delivered but not yet reviewed
  const reviewedOrderIds = pastReviews.map(r => r.orderId);
  const pendingReviews = orders.filter(
    o => o.status === 'Delivered' && !reviewedOrderIds.includes(o._id)
  );

  const handleWriteReviewDirectly = async (order) => {
    // 1. Auto-generate text based on the garment
    const reviewText = `I recently got my ${order.serviceName} stitched by Genius Tailors and the fit, fabric, and stitching quality were absolutely perfect! Highly recommended.`;
    
    // 2. Copy to clipboard
    try {
      await navigator.clipboard.writeText(reviewText);
      toast.success('Review text copied! Please paste it on Google.', { duration: 5000, position: 'top-center' });
    } catch (err) {
      console.log('Clipboard copy failed', err);
    }
    
    // 3. Hit the backend to award 5 loyalty points
    try {
      await api.post('/api/rewards/review');
    } catch (error) {
      console.log('Reward error or already claimed');
    }

    // 4. Save as "Reviewed" locally so it disappears from the Pending list
    const newReview = {
      id: Date.now().toString(),
      orderId: order._id,
      serviceName: order.serviceName,
      rating: 5,
      text: reviewText,
      date: new Date().toISOString()
    };
    const updatedReviews = [newReview, ...pastReviews];
    setPastReviews(updatedReviews);
    localStorage.setItem('gt_mock_reviews', JSON.stringify(updatedReviews));

    // 5. Open Google Business Profile Link instantly
    setTimeout(() => {
      window.open('https://g.page/r/CbOAKdiLA07KEBM/review', '_blank');
    }, 800); // slight delay so they can read the toast message
  };

  return (
    <CustomerLayout title="My Reviews">
      <div className="luxury-workspace-inner">
        
        {loading ? (
          <p style={{ padding: '2rem 0', color: 'var(--stone)' }}>Loading reviews...</p>
        ) : (
          <>
            {/* Pending Reviews Section */}
            {pendingReviews.length > 0 && (
              <div className="luxury-section" style={{ marginBottom: '4rem' }}>
                <h2 className="luxury-section-title">Pending Reviews</h2>
                <p style={{ color: 'var(--stone)', marginBottom: '1.5rem' }}>Your feedback helps us maintain our bespoke quality.</p>
                
                <div className="reviews-grid">
                  {pendingReviews.map(order => (
                    <div key={order._id} className="luxury-card review-card pending-review">
                      <div>
                        <h3>{order.serviceName}</h3>
                        <span className="subtext">Delivered on {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button className="luxury-btn-primary btn-sm" onClick={() => handleWriteReviewDirectly(order)}>
                        Write Review on Google
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Reviews Section */}
            <div className="luxury-section">
              <h2 className="luxury-section-title">Past Reviews</h2>
              
              {pastReviews.length === 0 ? (
                <div className="luxury-card empty-reviews">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.3, marginBottom: '1.5rem' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <h3 style={{ color: 'var(--onyx)', fontWeight: 500, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>No Reviews Yet</h3>
                  <p style={{ color: 'var(--stone)', marginBottom: '2rem' }}>You haven't left any reviews for your past orders.</p>
                  <Link to="/my-orders" className="luxury-btn-primary">View Past Orders</Link>
                </div>
              ) : (
                <div className="reviews-grid">
                  {pastReviews.map(review => (
                    <div key={review.id} className="luxury-card review-card">
                      <div className="review-header">
                        <div>
                          <h3>{review.serviceName}</h3>
                          <span className="subtext">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <div className="stars-display">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={`star ${star <= review.rating ? 'filled' : ''}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="review-text">"{review.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* The Review Modal has been completely removed to make it a 1-click process */}

      <style>{`
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .review-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .pending-review {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          border-color: var(--onyx);
          background: #ffffff;
        }

        .review-card h3 {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--onyx);
          margin: 0 0 0.25rem 0;
        }

        .subtext {
          font-size: 0.85rem;
          color: var(--stone);
        }

        .btn-sm {
          padding: 0.6rem 1.25rem;
          font-size: 0.85rem;
        }

        .empty-reviews {
          padding: 5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .stars-display {
          display: flex;
          gap: 0.15rem;
        }

        .stars-display .star {
          color: var(--ivory-border);
          font-size: 1.1rem;
        }

        .stars-display .star.filled {
          color: var(--gold);
        }

        .review-text {
          color: var(--stone);
          font-size: 0.95rem;
          line-height: 1.6;
          font-style: italic;
          margin: 0;
        }

      `}</style>
    </CustomerLayout>
  );
}

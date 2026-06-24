import { useState, useEffect } from 'react';
import CustomerLayout from '../../components/CustomerLayout';
import { Link } from 'react-router-dom';
import api from '../../api';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pastReviews, setPastReviews] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleOpenReviewModal = (order) => {
    setSelectedOrder(order);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a star rating');
    if (!reviewText.trim()) return toast.error('Please write a review');

    setSubmitting(true);
    
    // Simulate API call to save review
    setTimeout(() => {
      const newReview = {
        id: Date.now().toString(),
        orderId: selectedOrder._id,
        serviceName: selectedOrder.serviceName,
        rating,
        text: reviewText,
        date: new Date().toISOString()
      };

      const updatedReviews = [newReview, ...pastReviews];
      setPastReviews(updatedReviews);
      localStorage.setItem('gt_mock_reviews', JSON.stringify(updatedReviews));

      toast.success('Thank you! Your review has been submitted.');
      setIsModalOpen(false);
      setSubmitting(false);
    }, 1000);
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
                      <button className="luxury-btn-primary btn-sm" onClick={() => handleOpenReviewModal(order)}>
                        Write Review
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

      {/* Review Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content luxury-card">
            <div className="modal-header">
              <h3>Review Your Order</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="modal-body">
              <div className="order-summary-box">
                <span className="summary-label">Garment</span>
                <span className="summary-value">{selectedOrder.serviceName}</span>
              </div>

              <div className="luxury-form-group" style={{ alignItems: 'center', margin: '2rem 0' }}>
                <label style={{ marginBottom: '1rem' }}>Overall Rating</label>
                <div className="interactive-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="luxury-form-group">
                <label>Your Feedback</label>
                <textarea 
                  rows="4"
                  placeholder="Tell us about the fit, fabric, and your overall experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="luxury-btn-primary btn-save" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: #fff;
          width: 100%;
          max-width: 550px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--ivory-border);
        }

        .modal-header h3 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          margin: 0;
          color: var(--onyx);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--stone);
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
        }

        .order-summary-box {
          background: var(--ivory);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-label {
          color: var(--stone);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .summary-value {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          color: var(--onyx);
        }

        .luxury-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .luxury-form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--stone);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .luxury-form-group textarea {
          padding: 1rem 1.25rem;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          background: var(--ivory);
          color: var(--onyx);
          transition: all 0.2s ease;
          font-family: var(--font-sans);
          resize: vertical;
        }

        .luxury-form-group textarea:focus {
          outline: none;
          border-color: var(--onyx);
          background: #ffffff;
        }

        .interactive-stars {
          display: flex;
          gap: 0.5rem;
        }

        .star-btn {
          background: none;
          border: none;
          font-size: 2.5rem;
          color: var(--ivory-border);
          cursor: pointer;
          transition: transform 0.2s, color 0.2s;
          padding: 0;
          line-height: 1;
        }

        .star-btn:hover {
          transform: scale(1.1);
        }

        .star-btn.active {
          color: var(--gold);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--ivory-border);
          margin-top: 2rem;
        }

        .btn-cancel {
          background: transparent;
          border: none;
          color: var(--stone);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .btn-cancel:hover {
          color: var(--onyx);
          text-decoration: underline;
        }

        .btn-save {
          padding: 1rem 3rem !important;
          font-size: 1.05rem !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </CustomerLayout>
  );
}

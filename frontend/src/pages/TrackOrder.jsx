import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';
import authBg from '../assets/port_detail_stitch_1781781054620.png';
import toast from 'react-hot-toast';

export default function TrackOrder() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return toast.error('Please enter a valid tracking ID');
    
    setLoading(true);
    setOrderInfo(null);
    try {
      const { data } = await api.get(`/api/orders/track/${trackingId.trim()}`);
      setOrderInfo(data);
    } catch (error) {
      toast.error('Order not found. Please check your Tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Approved': return 2;
      case 'Cutting': return 3;
      case 'Stitching': return 4;
      case 'Ready': return 5;
      case 'Delivered': return 6;
      case 'Cancelled': return -1;
      default: return 1;
    }
  };

  const currentStep = orderInfo ? getStatusStep(orderInfo.status) : 0;

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', background: 'var(--ivory)' }}>
          
          <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="text-heading-2" style={{ color: 'var(--onyx)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Track Your Order</h1>
            <p style={{ color: 'var(--stone)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Enter your Tracking ID below to see the real-time status of your tailored garment.
            </p>
          </div>

          <div className="luxury-card" style={{ width: '100%', maxWidth: '700px', padding: '3rem', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            
            <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', marginBottom: orderInfo ? '3rem' : '0' }}>
              <input 
                type="text" 
                placeholder="Enter Tracking ID (e.g. ORD-ABCD)" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                required
              />
              <button type="submit" className="luxury-btn-primary" disabled={loading} style={{ padding: '0 2rem' }}>
                {loading ? 'Searching...' : 'Track'}
              </button>
            </form>

            {orderInfo && (
              <div className="tracking-result fade-in" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--onyx)', margin: '0 0 0.5rem 0' }}>{orderInfo.serviceName}</h3>
                    <p style={{ color: 'var(--stone)', margin: 0 }}>Hello {orderInfo.customerName}! Here is the status of your order.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', background: orderInfo.status === 'Cancelled' ? '#fef2f2' : '#f0fdf4', color: orderInfo.status === 'Cancelled' ? '#ef4444' : '#16a34a', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600 }}>
                      {orderInfo.status}
                    </span>
                    {orderInfo.estimatedDelivery && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--stone)' }}>
                        Est. Delivery: {new Date(orderInfo.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {orderInfo.status !== 'Cancelled' && (
                  <div className="stepper-container">
                    <div className="stepper-track"></div>
                    <div className="stepper-progress" style={{ width: `${Math.min(100, ((currentStep - 1) / 5) * 100)}%` }}></div>
                    
                    <div className="stepper-steps">
                      {[
                        { step: 1, label: 'Pending', icon: '📝' },
                        { step: 2, label: 'Approved', icon: '✅' },
                        { step: 3, label: 'Cutting', icon: '✂️' },
                        { step: 4, label: 'Stitching', icon: '🪡' },
                        { step: 5, label: 'Ready', icon: '🌟' },
                        { step: 6, label: 'Delivered', icon: '📦' }
                      ].map((item) => (
                        <div key={item.step} className={`step-item ${currentStep >= item.step ? 'active' : ''}`}>
                          <div className="step-circle">
                            {item.icon}
                          </div>
                          <span className="step-label">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {orderInfo.trackingNumber && (
                  <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--onyx)' }}>Courier Tracking</h4>
                    <p style={{ margin: 0, color: 'var(--stone)', fontSize: '0.9rem' }}>
                      Your package has been handed over to the courier. Tracking Number: <strong style={{ color: 'var(--gold)' }}>{orderInfo.trackingNumber}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .stepper-container {
          position: relative;
          margin-top: 3rem;
          padding-bottom: 2rem;
        }

        .stepper-track {
          position: absolute;
          top: 24px;
          left: 5%;
          right: 5%;
          height: 4px;
          background: #e2e8f0;
          z-index: 1;
        }

        .stepper-progress {
          position: absolute;
          top: 24px;
          left: 5%;
          height: 4px;
          background: var(--gold);
          z-index: 2;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stepper-steps {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 3;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 80px;
        }

        .step-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 4px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #94a3b8;
          transition: all 0.3s ease;
          box-shadow: 0 0 0 2px #e2e8f0;
        }

        .step-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }

        .step-item.active .step-circle {
          background: var(--onyx);
          color: #fff;
          box-shadow: 0 0 0 2px var(--gold);
        }

        .step-item.active .step-label {
          color: var(--onyx);
        }

        @media (max-width: 768px) {
          .stepper-track, .stepper-progress {
            left: 24px;
            right: auto;
            top: 0;
            bottom: 0;
            width: 4px;
            height: 100%;
          }

          .stepper-progress {
            width: 4px !important;
            height: var(--progress-height, 0); /* Need js to properly verticalize this, so fallback gracefully */
          }
          
          /* Fallback for mobile: hide horizontal lines, just list vertically */
          .stepper-track { display: none; }
          .stepper-progress { display: none; }
          
          .stepper-steps {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .step-item {
            flex-direction: row;
            width: 100%;
            gap: 1rem;
          }
          
          .step-circle {
            margin-bottom: 0;
          }
          
          .step-label {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

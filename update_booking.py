import re

file_path = 'frontend/src/pages/customer/Booking.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
content = content.replace(
    'const [loading, setLoading] = useState(false);',
    'const [loading, setLoading] = useState(false);\n  const [paymentModalOpen, setPaymentModalOpen] = useState(false);\n  const [cardNumber, setCardNumber] = useState("");'
)

# 2. Add handlePlaceOrder replacement
place_order_replacement = """const handlePlaceOrder = async () => {
    if (!profileId) {
      toast.error('Please select a measurement profile.');
      return;
    }
    if (!deliveryCity || !deliveryAddress) {
      toast.error('Please provide complete delivery details for PostEx tracking.');
      return;
    }

    // Open Payment Modal instead of placing order immediately
    setPaymentModalOpen(true);
  };

  const executePostExPaymentAndOrder = async () => {
    if (cardNumber.length < 16) {
      toast.error('Please enter a valid 16-digit card number.');
      return;
    }

    setLoading(true);
    toast.loading('Processing PostEx Digital Payment...', { id: 'payment' });
    
    // Simulate API delay for digital payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const advanceAmount = Math.ceil(totalPrice / 2);

    toast.success('Payment Successful! Placing order...', { id: 'payment' });

    try {
      const payload = {
        serviceName: service.name,
        styleVariations,
        measurementSnapshot: measurements,
        totalPrice,
        pointsUsed: usePoints ? userPoints : 0,
        isRush,
        referenceImageUrl: referenceImage,
        customerNote,
        neededByDate,
        deliveryCity,
        deliveryAddress,
        advancePaid: advanceAmount,
        advancePaymentStatus: 'Paid'
      };

      const { data } = await api.post('/api/orders', payload);
      setPaymentModalOpen(false);
      navigate(`/my-orders/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order', { id: 'payment' });
    } finally {
      setLoading(false);
    }
  };"""

original_place_order = re.search(r'const handlePlaceOrder = async \(\) => \{.*?(?=  const getStatusProgress)', content, re.DOTALL).group(0)
content = content.replace(original_place_order, place_order_replacement + '\n\n')


# 3. Update the Summary UI
summary_ui_original = """<div className="receipt-divider"></div>
              <div className="receipt-row total">
                <span>Total Amount</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--stone)' }}>
              <strong>Payment Policy:</strong> Payment is collected in cash or via transfer upon fabric drop-off or final delivery.
            </div>

            <div className="wizard-actions split">
              <button className="btn btn-outline btn-lg" onClick={handleBack} disabled={loading}>← Edit Order</button>
              <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>"""

summary_ui_replacement = """<div className="receipt-divider"></div>
              <div className="receipt-row total" style={{ fontSize: '1.1rem' }}>
                <span>Total Amount</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="receipt-divider" style={{ borderStyle: 'dashed' }}></div>
              <div className="receipt-row" style={{ color: '#0f172a', fontWeight: 600 }}>
                <span>Advance Required (50%)</span>
                <span>Rs. {Math.ceil(totalPrice / 2).toLocaleString()}</span>
              </div>
              <div className="receipt-row" style={{ color: '#64748b', fontSize: '0.95rem' }}>
                <span>Cash on Delivery (Remaining)</span>
                <span>Rs. {(totalPrice - Math.ceil(totalPrice / 2)).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '0.9rem', color: '#0369a1' }}>
              <strong>Secure Digital Payment:</strong> A 50% advance payment is required to confirm your custom tailoring order. The remaining balance will be collected by PostEx upon delivery.
            </div>

            <div className="wizard-actions split">
              <button className="btn btn-outline btn-lg" onClick={handleBack} disabled={loading}>← Edit Order</button>
              <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading} style={{ background: '#0f172a', border: 'none' }}>
                {loading ? 'Processing...' : 'Pay Advance & Place Order'}
              </button>
            </div>

            {/* PostEx Mock Digital Payment Modal */}
            {paymentModalOpen && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div className="luxury-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', position: 'relative' }}>
                  <button onClick={() => setPaymentModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: '#f0f9ff', color: '#0284c7', marginBottom: '1rem' }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    </div>
                    <h3 style={{ margin: 0, color: '#0f172a', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Secure Checkout</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Powered by PostEx XPay</p>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Advance Amount</p>
                    <p style={{ margin: 0, color: '#0f172a', fontSize: '2rem', fontWeight: 'bold' }}>Rs. {Math.ceil(totalPrice / 2).toLocaleString()}</p>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 600 }}>Card Number</label>
                    <input 
                      type="text" 
                      placeholder="XXXX XXXX XXXX XXXX" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      style={{ width: '100%', padding: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', letterSpacing: '2px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 600 }}>Expiry</label>
                      <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 600 }}>CVC</label>
                      <input type="password" placeholder="•••" style={{ width: '100%', padding: '0.875rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                  </div>

                  <button 
                    onClick={executePostExPaymentAndOrder}
                    disabled={loading}
                    style={{ width: '100%', padding: '1rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                  >
                    {loading ? 'Processing...' : `Pay Rs. ${Math.ceil(totalPrice / 2).toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}"""

content = content.replace(summary_ui_original, summary_ui_replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Booking.jsx successfully.')

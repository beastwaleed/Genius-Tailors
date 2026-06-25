import re

file_path = 'frontend/src/pages/customer/OrderDetail.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
content = content.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [trackingHistory, setTrackingHistory] = useState([]);\n  const [trackingLoading, setTrackingLoading] = useState(true);'
)

# 2. Add fetch logic inside fetchOrder
fetch_logic = '''const { data } = await api.get(`/api/orders/${id}`);
      setOrder(data);
      if (data.trackingNumber) {
        api.get(`/api/orders/${id}/tracking`)
          .then(res => {
            setTrackingHistory(res.data.history || []);
            setTrackingLoading(false);
          })
          .catch(() => setTrackingLoading(false));
      } else {
        setTrackingLoading(false);
      }'''
content = content.replace(
    'const { data } = await api.get(`/api/orders/${id}`);\n      setOrder(data);',
    fetch_logic
)

# 3. Add UI below estimatedDelivery
ui_logic = '''{order.estimatedDelivery && (
              <p className="estimated-delivery">
                <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}
              </p>
            )}

            {/* PostEx Live Tracking Timeline */}
            {order.trackingNumber && (
              <div className="postex-tracking-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <h4 style={{ marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-serif)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  Live Courier Tracking
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Tracking #: <strong>{order.trackingNumber}</strong></p>
                
                {trackingLoading ? (
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Fetching live timeline...</p>
                ) : trackingHistory.length > 0 ? (
                  <div className="tracking-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {trackingHistory.map((event, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ minWidth: '12px', height: '12px', borderRadius: '50%', background: idx === 0 ? '#C9A96E' : '#e2e8f0', marginTop: '4px', boxShadow: idx === 0 ? '0 0 0 4px rgba(201, 169, 110, 0.2)' : 'none' }}></div>
                        <div>
                          <p style={{ fontSize: '0.95rem', fontWeight: idx === 0 ? '600' : '500', color: idx === 0 ? '#1e293b' : '#64748b', margin: 0 }}>
                            {event.transactionStatusMessage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>No tracking events recorded by courier yet.</p>
                )}
              </div>
            )}'''
content = content.replace(
    '{order.estimatedDelivery && (\n              <p className="estimated-delivery">\n                <strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}\n              </p>\n            )}',
    ui_logic
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated OrderDetail.jsx successfully.')

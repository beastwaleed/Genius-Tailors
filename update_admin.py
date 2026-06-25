import re

file_path = 'frontend/src/pages/admin/AdminOrderDetails.jsx'
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

# 3. Add UI below Measurements
ui_logic = '''{/* Measurements (If Available) */}
             {(order.measurementSnapshot?.measurements || order.measurementSnapshot || order.measurementsSnapshot) && Object.keys(order.measurementSnapshot?.measurements || order.measurementSnapshot || order.measurementsSnapshot).length > 0 && (
               <div className="premium-glass-card">
                 <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   📏 Measurements Snapshot
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   {Object.entries(order.measurementSnapshot?.measurements || order.measurementSnapshot || order.measurementsSnapshot).map(([key, val]) => {
                     if (typeof val === 'object' || val === null) return null;
                     if (['_id', 'customer', 'profileName', 'createdAt', 'updatedAt', '__v'].includes(key)) return null;
                     return (
                       <div key={key} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                         <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>{key}</div>
                         <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{val}"</div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

             {/* PostEx Live Tracking Timeline for Admin */}
             {order.trackingNumber && (
               <div className="premium-glass-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                 <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   🚚 PostEx Courier Tracking
                 </h3>
                 <div className="info-row" style={{ borderBottom: 'none', marginBottom: '1rem' }}>
                   <span className="info-label">Tracking Number</span>
                   <span className="info-value" style={{ fontFamily: 'monospace', color: '#3b82f6', fontSize: '1.1rem' }}>{order.trackingNumber}</span>
                 </div>
                 
                 <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                   {trackingLoading ? (
                     <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>Fetching live timeline from PostEx...</p>
                   ) : trackingHistory.length > 0 ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       {trackingHistory.map((event, idx) => (
                         <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                           <div style={{ minWidth: '10px', height: '10px', borderRadius: '50%', background: idx === 0 ? '#3b82f6' : '#cbd5e1', marginTop: '6px' }}></div>
                           <div>
                             <p style={{ fontSize: '0.95rem', fontWeight: idx === 0 ? '600' : '500', color: idx === 0 ? '#0f172a' : '#475569', margin: 0 }}>
                               {event.transactionStatusMessage}
                             </p>
                             <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Code: {event.transactionStatusMessageCode}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>No timeline events recorded yet.</p>
                   )}
                 </div>
               </div>
             )}'''

content = content.replace(
    '''{/* Measurements (If Available) */}
             {(order.measurementSnapshot?.measurements || order.measurementSnapshot || order.measurementsSnapshot) && Object.keys(order.measurementSnapshot?.measurements || order.measurementSnapshot || order.measurementsSnapshot).length > 0 && (
               <div className="premium-glass-card">
                 <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   📏 Measurements Snapshot
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   {Object.entries(order.measurementSnapshot?.measurements || order.measurementSnapshot || order.measurementsSnapshot).map(([key, val]) => {
                     if (typeof val === 'object' || val === null) return null;
                     if (['_id', 'customer', 'profileName', 'createdAt', 'updatedAt', '__v'].includes(key)) return null;
                     return (
                       <div key={key} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                         <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>{key}</div>
                         <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{val}"</div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}''',
    ui_logic
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated AdminOrderDetails.jsx successfully.')

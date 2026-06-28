import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/api/orders/${id}`);
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
      }
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const { data } = await api.put(`/api/orders/${id}/status`, { status: newStatus });
      setOrder(data);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Genius Tailors - Order Details', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Order: ${order.orderNumber || order._id}`, 14, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 36);
    doc.text(`Status: ${order.status}`, 14, 42);
    
    // Customer Info
    doc.setFontSize(14);
    doc.text('Customer Information', 14, 55);
    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Details']],
      body: [
        ['Name', order.customer?.name || 'Unknown'],
        ['Email', order.customer?.email || 'N/A'],
        ['Phone', order.customer?.phone || 'N/A'],
        ['Membership', order.customer?.membershipLevel || 'Standard']
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Service Specs
    doc.text('Service Specifications', 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Spec', 'Value']],
      body: [
        ['Service', order.serviceName],
        ['Priority', order.priorityStatus || (order.isRush ? 'Expedited (Rush)' : 'Standard')],
        ['Fabric', order.fabricSelection || 'Not Specified'],
        ['Estimated Delivery', order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'],
        ['Total Price', `Rs. ${order.totalPrice}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Measurements
    const ms = order.measurementSnapshot?.measurements || order.measurementSnapshot || order.measurementsSnapshot;
    let finalYForImage = doc.lastAutoTable.finalY + 20;

    if (ms && Object.keys(ms).length > 0) {
      doc.text('Measurements Snapshot', 14, doc.lastAutoTable.finalY + 15);
      
      const mBody = [];
      Object.entries(ms).forEach(([key, val]) => {
         if (typeof val !== 'object' && val !== null && !['_id', 'customer', 'profileName', 'createdAt', 'updatedAt', '__v'].includes(key)) {
            mBody.push([key, `${val}"`]);
         }
      });
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Measurement', 'Value']],
        body: mBody,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });
      finalYForImage = doc.lastAutoTable.finalY + 20;
    }

    if (order.fabricImageUrl) {
      try {
        const imgData = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg"));
          };
          img.onerror = reject;
          img.src = order.fabricImageUrl;
        });
        
        // Add new page if not enough space
        if (finalYForImage > 220) {
          doc.addPage();
          finalYForImage = 20;
        }

        doc.setFontSize(14);
        doc.text('Fabric Selected', 14, finalYForImage);
        doc.addImage(imgData, 'JPEG', 14, finalYForImage + 5, 50, 50);
      } catch (err) {
        console.warn('Failed to load fabric image for PDF', err);
      }
    }

    doc.save(`${order.orderNumber || order._id}.pdf`);
    toast.success('PDF Exported Successfully');
  };

  if (loading) {
    return (
      <AdminLayout title="Order Details">
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading order details...</div>
      </AdminLayout>
    );
  }

  if (!order) return null;

  return (
    <AdminLayout title={`${order.orderNumber || order._id}`}>
      <div className="premium-dashboard">
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <Link to="/admin/orders" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                &larr; Back to Orders
              </Link>
              <button 
                onClick={handleExportPDF}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Save as PDF
              </button>
            </div>
            <h2 className="premium-title" style={{ marginBottom: 0 }}>
              Order <span style={{ color: '#3b82f6', fontFamily: 'monospace' }}>...{order._id.slice(-6)}</span>
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             {order.priorityStatus === 'Expedited' && (
                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', background: '#fee2e2', padding: '0.5rem 1rem', borderRadius: '0.5rem', letterSpacing: '0.5px' }}>
                  🔥 EXPEDITED RUSH
                </span>
             )}
            <select 
              className="premium-input"
              style={{ fontWeight: 600, minWidth: '150px' }}
              value={order.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Cutting">Cutting</option>
              <option value="Stitching">Stitching</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="order-details-grid">
          
          {/* Left Column: Customer & Details */}
          <div className="order-left-col">
             {/* Customer Card */}
             <div className="premium-glass-card">
               <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 👤 Customer Information
               </h3>
               <div className="info-row">
                 <span className="info-label">Name</span>
                 <span className="info-value">{order.customer?.name || 'Unknown'}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Email</span>
                 <span className="info-value">{order.customer?.email || 'N/A'}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Membership</span>
                 <span className="info-value">{order.customer?.membershipLevel || 'Standard'}</span>
               </div>
             </div>

             {/* Order Specs */}
             <div className="premium-glass-card">
               <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 ✂️ Service Specs
               </h3>
               <div className="info-row">
                 <span className="info-label">Service</span>
                 <span className="info-value" style={{ fontWeight: 700, color: '#3b82f6' }}>{order.serviceName}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Placed On</span>
                 <span className="info-value">{new Date(order.createdAt).toLocaleString()}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Est. Delivery</span>
                 <span className="info-value">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}</span>
               </div>
               <div className="info-row">
                 <span className="info-label">Fabric</span>
                 <span className="info-value">{order.fabricSelection || 'Not Specified'}</span>
               </div>
               {order.fabricColor && (
                 <div className="info-row">
                   <span className="info-label">Color</span>
                   <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     {order.fabricImageUrl && (
                       <img src={order.fabricImageUrl} alt="Fabric" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                     )}
                     {order.fabricColor}
                   </span>
                 </div>
               )}
               <div className="info-row">
                 <span className="info-label">Delivery Type</span>
                 <span className="info-value">{order.deliveryOption === 'Delivery' ? 'Home Delivery' : 'Store Pickup'}</span>
               </div>
             </div>

             {/* Measurements (If Available) */}
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
             )}
          </div>

          {/* Right Column: Pricing & Payment */}
          <div className="order-right-col">
            <div className="premium-stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '2rem' }}>
               <h3 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                 Payment Summary
               </h3>
               
               <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                 <span style={{ color: '#cbd5e1' }}>Subtotal</span>
                 <span style={{ color: '#f8fafc', fontWeight: 500 }}>Rs. {order.totalPrice.toLocaleString()}</span>
               </div>
               
               {order.priorityStatus === 'Expedited' && (
                 <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                   <span style={{ color: '#ef4444' }}>Expedited Fee</span>
                   <span style={{ color: '#ef4444', fontWeight: 500 }}>Included</span>
                 </div>
               )}

               <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>

               <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                 <span style={{ color: '#cbd5e1', fontSize: '1.2rem', fontWeight: 600 }}>Total</span>
                 <span className="stat-value" style={{ fontSize: '2.5rem' }}>Rs. {order.totalPrice.toLocaleString()}</span>
               </div>

               {order.advancePaid > 0 && (
                 <>
                   <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <span style={{ color: '#34d399', fontSize: '0.9rem' }}>Advance Paid (Online)</span>
                     <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>- Rs. {order.advancePaid.toLocaleString()}</span>
                   </div>
                   <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                     <span style={{ color: '#f8fafc', fontWeight: 600 }}>To Collect (COD)</span>
                     <span style={{ color: '#f8fafc', fontWeight: 700 }}>Rs. {order.remainingBalance.toLocaleString()}</span>
                   </div>
                 </>
               )}

               <div style={{ marginTop: '2rem', width: '100%', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Payment Status</div>
                 <div style={{ fontSize: '1.1rem', fontWeight: 600, color: order.advancePaymentStatus === 'Paid' ? '#10b981' : '#f59e0b' }}>
                   {order.advancePaymentStatus === 'Paid' ? 'Advance Paid' : 'Pending'} via {order.advancePaid > 0 ? 'PostEx XPay' : 'Manual'}
                 </div>
               </div>
            </div>

            {/* Custom Notes */}
            {order.notes && (
              <div className="premium-glass-card" style={{ marginTop: '1.5rem', background: '#fffbeb', borderColor: '#fde68a' }}>
                 <h3 style={{ fontSize: '1.1rem', color: '#b45309', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   📝 Customer Notes
                 </h3>
                 <p style={{ color: '#92400e', fontSize: '0.95rem', lineHeight: 1.6 }}>
                   "{order.notes}"
                 </p>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .premium-dashboard { animation: fadeUp 0.6s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .premium-title { font-family: var(--font-serif); color: #0f172a; font-size: 1.75rem; letter-spacing: -0.02em; }

        .premium-input { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; color: #1e293b; background-color: white; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .premium-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .order-details-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
        @media (max-width: 1024px) { .order-details-grid { grid-template-columns: 1fr; } }

        .order-left-col { display: flex; flex-direction: column; gap: 1.5rem; }
        .order-right-col { display: flex; flex-direction: column; }

        .premium-glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 1.25rem; padding: 2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03); }

        .premium-stat-card { position: relative; background: linear-gradient(145deg, #0f172a, #1e293b); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1.25rem; display: flex; overflow: hidden; color: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); }
        .stat-value { background: linear-gradient(to right, #ffffff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 0; border-bottom: 1px solid #f1f5f9; }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .info-label { color: #64748b; font-size: 0.95rem; font-weight: 500; }
        .info-value { color: #1e293b; font-size: 0.95rem; font-weight: 600; text-align: right; }
      `}</style>
    </AdminLayout>
  );
}

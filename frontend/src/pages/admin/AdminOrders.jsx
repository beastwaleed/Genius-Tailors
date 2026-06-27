import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const navigate = useNavigate();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/api/orders/${id}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === id ? data : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDownloadLabels = async () => {
    if (selectedOrders.length === 0) return toast.error('Select at least one order to print labels for.');
    
    // Filter selected orders that actually have a tracking number synced
    const selectedTracking = orders
      .filter(o => selectedOrders.includes(o._id) && o.trackingNumber)
      .map(o => o.trackingNumber);

    if (selectedTracking.length === 0) return toast.error('None of the selected orders have a PostEx tracking number.');
    if (selectedTracking.length > 10) return toast.error('PostEx allows a maximum of 10 labels to be downloaded at once.');

    const toastId = toast.loading('Generating shipping labels from PostEx...');
    try {
      const res = await api.get('/api/admin/orders/labels', {
        params: { trackingNumbers: selectedTracking.join(',') },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Shipping_Labels_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Labels downloaded!', { id: toastId });
    } catch (err) {
      toast.error('Failed to download shipping labels. PostEx may be temporarily unavailable.', { id: toastId });
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.length === 0) return toast.error('Select orders first');
    if (!bulkStatus) return toast.error('Select a status to apply');

    const toastId = toast.loading(`Updating ${selectedOrders.length} orders...`);
    try {
      await Promise.all(selectedOrders.map(id => 
        api.put(`/api/orders/${id}/status`, { status: bulkStatus })
      ));
      
      toast.success(`Successfully updated ${selectedOrders.length} orders to ${bulkStatus}`, { id: toastId });
      setSelectedOrders([]);
      setBulkStatus('');
      fetchOrders(); // Refresh table to pull all populated data cleanly
    } catch (error) {
      toast.error('Failed to process some or all updates', { id: toastId });
    }
  };

  // Memoized filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = (order.orderNumber || order._id).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (order.customer?.tags && order.customer.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || 
                            (priorityFilter === 'Expedited' && order.priorityStatus === 'Expedited') ||
                            (priorityFilter === 'Standard' && order.priorityStatus !== 'Expedited');
      
      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && new Date(order.createdAt) >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && new Date(order.createdAt) <= end;
      }

      return matchSearch && matchStatus && matchPriority && matchDate;
    }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, searchTerm, statusFilter, priorityFilter, startDate, endDate]);

  const activeCount = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
  const expeditedCount = orders.filter(o => o.priorityStatus === 'Expedited' && o.status !== 'Delivered').length;

  const handleExportCSV = () => {
    const ordersToExport = selectedOrders.length > 0 ? filteredOrders.filter(o => selectedOrders.includes(o._id)) : filteredOrders;

    if (ordersToExport.length === 0) {
      toast.error('No orders to export');
      return;
    }

    const csvData = ordersToExport.map(o => ({
      'Order ID': o.orderNumber || o._id,
      'Customer Name': o.customer?.name || 'Unknown',
      'Customer Phone': o.customer?.phone || 'N/A',
      'Date': new Date(o.createdAt).toLocaleDateString(),
      'Service': o.serviceName,
      'Total Price (Rs)': o.totalPrice,
      'Status': o.status,
      'Priority': o.priorityStatus === 'Expedited' || o.isRush ? 'Rush' : 'Standard',
      'Season': o.season || 'N/A'
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported successfully');
  };

  return (
    <AdminLayout title="Manage Orders">
      {/* ── KPI Row ── */}
      <div className="premium-dashboard" style={{ marginBottom: '2rem' }}>
        <div className="admin-stats-grid">
          <div className="premium-stat-card">
             <div className="stat-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>📑</div>
             <div className="stat-info">
               <h4>Total Orders</h4>
               <p className="stat-value">{orders.length}</p>
             </div>
          </div>
          <div className="premium-stat-card">
             <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>🔄</div>
             <div className="stat-info">
               <h4>Active Processing</h4>
               <p className="stat-value">{activeCount}</p>
             </div>
          </div>
          <div className="premium-stat-card">
             <div className="stat-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>🔥</div>
             <div className="stat-info">
               <h4>Urgent (Expedited)</h4>
               <p className="stat-value">{expeditedCount}</p>
             </div>
          </div>
        </div>
      </div>

      {/* ── Controls Row ── */}
      <div className="premium-glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="filter-controls">
          <input 
            type="text" 
            placeholder="Search by ID, Customer Name, or Service..." 
            className="premium-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="select-group">
            <select className="premium-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Cutting">Cutting</option>
              <option value="Stitching">Stitching</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select className="premium-input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="Standard">Standard</option>
              <option value="Expedited">Expedited (Rush)</option>
            </select>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>From:</span>
              <input type="date" className="premium-input" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>To:</span>
              <input type="date" className="premium-input" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <button 
            className="premium-btn" 
            onClick={handleExportCSV}
            style={{ padding: '0.6rem 1.25rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#C9A96E', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export CSV {selectedOrders.length > 0 ? `(${selectedOrders.length})` : '(All)'}
          </button>
          
          <button 
            className="premium-btn" 
            onClick={handleDownloadLabels}
            disabled={selectedOrders.length === 0}
            style={{ 
              padding: '0.6rem 1.25rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: selectedOrders.length > 0 ? '#1e293b' : '#cbd5e1', 
              color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', 
              cursor: selectedOrders.length > 0 ? 'pointer' : 'not-allowed' 
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Print Labels {selectedOrders.length > 0 && `(${selectedOrders.length})`}
          </button>
        </div>

        {selectedOrders.length > 0 && (
          <div className="bulk-actions-container">
            <span style={{ fontWeight: 'bold', color: '#0369a1' }}>Bulk Actions:</span>
            <select className="premium-input bulk-select" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
              <option value="">Select new status...</option>
              <option value="Pending">Pending</option>
              <option value="Cutting">Cutting</option>
              <option value="Stitching">Stitching</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button 
              className="premium-btn bulk-btn" 
              onClick={handleBulkUpdate}
              disabled={!bulkStatus}
              style={{ background: bulkStatus ? '#0284c7' : '#94a3b8', cursor: bulkStatus ? 'pointer' : 'not-allowed' }}
            >
              Apply to {selectedOrders.length} Orders
            </button>
          </div>
        )}
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading database...</div>
      ) : (
        <div className="admin-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrders(filteredOrders.map(o => o._id));
                      else setSelectedOrders([]);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Order ID</th>
                <th>Customer & Date</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOrders([...selectedOrders, order._id]);
                          else setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontWeight: 600 }}>{order.orderNumber || `...${order._id.slice(-6)}`}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>
                       {order.customer?.name || 'Unknown'}
                       {order.customer?.tags && order.customer.tags.length > 0 && (
                         <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                           {order.customer.tags.map((tag, idx) => (
                             <span key={idx} style={{ fontSize: '0.65rem', color: '#0284c7', background: '#e0f2fe', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                               {tag}
                             </span>
                           ))}
                         </div>
                       )}
                       <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400, marginTop: '0.2rem' }}>
                         {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </div>
                    </td>
                    <td style={{ color: '#475569', fontWeight: 500 }}>{order.serviceName}</td>
                    <td style={{ fontWeight: 700, color: '#1e293b' }}>
                      Rs. {order.totalPrice.toLocaleString()}
                      {order.advancePaid > 0 && (
                        <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                          Paid: Rs. {order.advancePaid.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td>
                      {order.priorityStatus === 'Expedited' ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', background: '#fee2e2', padding: '0.35rem 0.65rem', borderRadius: '0.5rem', letterSpacing: '0.5px' }}>🔥 RUSH</span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem', background: '#f1f5f9', padding: '0.35rem 0.65rem', borderRadius: '0.5rem', fontWeight: 600, letterSpacing: '0.5px' }}>STANDARD</span>
                      )}
                    </td>
                    <td>
                      <select 
                        className={`status-badge status-${order.status.toLowerCase()}`}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Cutting">Cutting</option>
                        <option value="Stitching">Stitching</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button className="premium-btn-sm" onClick={() => navigate(`/admin/orders/${order._id}`)}>View Details</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: 'transparent' }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        /* Reuse Premium Dashboard classes */
        .premium-dashboard { animation: fadeUp 0.6s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
        
        .premium-stat-card {
          position: relative; background: linear-gradient(145deg, #0f172a, #1e293b); border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1.25rem; padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease; color: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
        .premium-stat-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4); border-color: rgba(255, 255, 255, 0.1); }
        .stat-icon { width: 3.5rem; height: 3.5rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: inset 0 2px 10px rgba(255, 255, 255, 0.1); }
        .stat-info h4 { margin: 0 0 0.25rem 0; font-size: 0.85rem; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { margin: 0; font-size: 1.75rem; font-weight: 800; background: linear-gradient(to right, #ffffff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .premium-glass-card {
          background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 1.25rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
        }

        /* Controls */
        .filter-controls {
          display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;
        }
        .search-input { flex: 1; min-width: 250px; }
        .select-group { display: flex; gap: 1rem; flex-wrap: wrap; }
        
        .premium-input {
          padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; color: #1e293b;
          background-color: white; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .premium-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .bulk-actions-container {
          display: flex; gap: 1rem; align-items: center; margin-top: 1rem; padding: 1rem; background: #e0f2fe; border-radius: 0.75rem; border: 1px solid #bae6fd;
        }
        .bulk-select { width: 200px; padding: 0.5rem; }
        .bulk-btn { padding: 0.5rem 1.25rem; color: white; border: none; border-radius: 6px; font-weight: bold; }

        @media (max-width: 768px) {
          .filter-controls { flex-direction: column; align-items: stretch; }
          .select-group { flex-direction: column; align-items: stretch; }
          .premium-btn { justify-content: center; }
          
          .bulk-actions-container {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .bulk-select { width: 100%; }
          .bulk-btn { width: 100%; text-align: center; }
        }

        /* Floating Table */
        .premium-table { width: 100%; min-width: 800px; border-collapse: separate; border-spacing: 0 0.75rem; font-size: 0.95rem; }
        .premium-table th { font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; border: none; padding: 1rem 1.5rem; text-align: left; }
        .premium-table tbody tr { background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .premium-table tbody tr:hover { transform: translateY(-2px) scale(1.005); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .premium-table td { padding: 1rem 1.5rem; border: none; background: transparent; vertical-align: middle; }
        .premium-table td:first-child { border-radius: 0.75rem 0 0 0.75rem; }
        .premium-table td:last-child { border-radius: 0 0.75rem 0.75rem 0; }

        .premium-btn-sm {
          background: rgba(59, 130, 246, 0.1); color: #2563eb; border: none; padding: 0.5rem 1rem; border-radius: 999px;
          font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease;
        }
        .premium-btn-sm:hover { background: #2563eb; color: white; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }

        .status-badge { padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-cutting { background: #dbeafe; color: #1d4ed8; }
        .status-stitching { background: #fce7f3; color: #be185d; }
        .status-ready { background: #e0e7ff; color: #4338ca; }
        .status-delivered { background: #d1fae5; color: #047857; }
        .status-cancelled { background: #fee2e2; color: #b91c1c; }
      `}</style>
    </AdminLayout>
  );
}

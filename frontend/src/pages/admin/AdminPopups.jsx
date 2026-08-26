import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminPopups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [previewTab, setPreviewTab] = useState('editor'); // 'editor' | 'preview'

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imagePlacement, setImagePlacement] = useState('left'); // left, right, top, bottom

  // Badge
  const [badgeText, setBadgeText] = useState('🔥 LIMITED TIME OFFER');
  const [badgeBgColor, setBadgeBgColor] = useState('#ef4444');
  const [badgeTextColor, setBadgeTextColor] = useState('#ffffff');

  // CTA
  const [ctaType, setCtaType] = useState('link'); // link, form
  const [ctaText, setCtaText] = useState('Claim 10% Discount Now');
  const [ctaLink, setCtaLink] = useState('/booking');
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState('Thank you! Our master tailor will contact you shortly.');

  // Colors
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [titleColor, setTitleColor] = useState('#0f172a');
  const [descriptionColor, setDescriptionColor] = useState('#475569');
  const [ctaBgColor, setCtaBgColor] = useState('#0f172a');
  const [ctaTextColor, setCtaTextColor] = useState('#ffffff');
  const [timerBgColor, setTimerBgColor] = useState('#f1f5f9');
  const [timerTextColor, setTimerTextColor] = useState('#0f172a');

  // Countdown Timer
  const [enableCountdown, setEnableCountdown] = useState(false);
  const [countdownEndTime, setCountdownEndTime] = useState('');

  // Target Pages & Triggers
  const [targetPages, setTargetPages] = useState('all'); // all, home, booking, services, custom
  const [customPagePath, setCustomPagePath] = useState('');
  const [triggerType, setTriggerType] = useState('time_delay'); // time_delay, scroll_percentage, exit_intent, immediate
  const [scrollPercentage, setScrollPercentage] = useState(30);

  // Rules
  const [isActive, setIsActive] = useState(true);
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [showOncePerSession, setShowOncePerSession] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/popups');
      setPopups(data);
    } catch (error) {
      toast.error('Failed to load popups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  // Compute Overall Analytics Summary
  const totalImpressions = popups.reduce((sum, p) => sum + (p.impressionsCount || 0), 0);
  const totalClicks = popups.reduce((sum, p) => sum + (p.clicksCount || 0), 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  const openAddModal = () => {
    setEditingPopup(null);
    setTitle('Exclusive Tailoring Discount!');
    setDescription('Book your custom suit or kameez shalwar today and get free home delivery across Pakistan.');
    setImageFile(null);
    setImageUrl('');
    setImagePreview('');
    setImagePlacement('left');

    setBadgeText('🔥 EID SPECIAL OFFER');
    setBadgeBgColor('#ef4444');
    setBadgeTextColor('#ffffff');

    setCtaType('link');
    setCtaText('Book Custom Suit Now');
    setCtaLink('/booking');
    setCtaSuccessMessage('Thank you! Our master tailor will contact you shortly.');

    setBackgroundColor('#ffffff');
    setTitleColor('#0f172a');
    setDescriptionColor('#475569');
    setCtaBgColor('#0f172a');
    setCtaTextColor('#ffffff');
    setTimerBgColor('#f1f5f9');
    setTimerTextColor('#0f172a');

    setEnableCountdown(false);
    setCountdownEndTime('');

    setTargetPages('all');
    setCustomPagePath('');
    setTriggerType('time_delay');
    setScrollPercentage(30);

    setIsActive(true);
    setDelaySeconds(2);
    setShowOncePerSession(true);

    setPreviewTab('editor');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPopup(p);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setImageFile(null);
    setImageUrl(p.imageUrl || '');
    setImagePreview(p.imageUrl || '');
    setImagePlacement(p.imagePlacement || 'left');

    setBadgeText(p.badgeText || '');
    setBadgeBgColor(p.badgeBgColor || '#ef4444');
    setBadgeTextColor(p.badgeTextColor || '#ffffff');

    setCtaType(p.ctaType || 'link');
    setCtaText(p.ctaText || '');
    setCtaLink(p.ctaLink || '/booking');
    setCtaSuccessMessage(p.ctaSuccessMessage || 'Thank you! Our master tailor will contact you shortly.');

    setBackgroundColor(p.backgroundColor || '#ffffff');
    setTitleColor(p.titleColor || '#0f172a');
    setDescriptionColor(p.descriptionColor || '#475569');
    setCtaBgColor(p.ctaBgColor || '#0f172a');
    setCtaTextColor(p.ctaTextColor || '#ffffff');
    setTimerBgColor(p.timerBgColor || '#f1f5f9');
    setTimerTextColor(p.timerTextColor || '#0f172a');

    setEnableCountdown(Boolean(p.enableCountdown));
    if (p.countdownEndTime) {
      const dt = new Date(p.countdownEndTime);
      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
      setCountdownEndTime(dt.toISOString().slice(0, 16));
    } else {
      setCountdownEndTime('');
    }

    setTargetPages(p.targetPages || 'all');
    setCustomPagePath(p.customPagePath || '');
    setTriggerType(p.triggerType || 'time_delay');
    setScrollPercentage(p.scrollPercentage || 30);

    setIsActive(Boolean(p.isActive));
    setDelaySeconds(p.delaySeconds || 2);
    setShowOncePerSession(p.showOncePerSession !== false);

    setPreviewTab('editor');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleActive = async (p) => {
    try {
      const newStatus = !p.isActive;
      await api.put(`/api/popups/${p._id}`, { isActive: newStatus });
      toast.success(newStatus ? 'Popup Activated!' : 'Popup Deactivated');
      fetchPopups();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this popup?')) return;
    try {
      await api.delete(`/api/popups/${id}`);
      toast.success('Popup deleted');
      setPopups(popups.filter(p => p._id !== id));
    } catch (error) {
      toast.error('Failed to delete popup');
    }
  };

  const handleResetAnalytics = async (id) => {
    if (!window.confirm('Reset view and click stats for this popup?')) return;
    try {
      const { data } = await api.post(`/api/popups/${id}/reset-analytics`);
      toast.success('Analytics stats reset');
      setPopups(popups.map(p => p._id === id ? data : p));
    } catch (error) {
      toast.error('Failed to reset analytics');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Popup title is required');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('imagePlacement', imagePlacement);
      formData.append('badgeText', badgeText);
      formData.append('badgeBgColor', badgeBgColor);
      formData.append('badgeTextColor', badgeTextColor);
      formData.append('ctaType', ctaType);
      formData.append('ctaText', ctaText);
      formData.append('ctaLink', ctaLink);
      formData.append('ctaSuccessMessage', ctaSuccessMessage);

      formData.append('backgroundColor', backgroundColor);
      formData.append('titleColor', titleColor);
      formData.append('descriptionColor', descriptionColor);
      formData.append('ctaBgColor', ctaBgColor);
      formData.append('ctaTextColor', ctaTextColor);
      formData.append('timerBgColor', timerBgColor);
      formData.append('timerTextColor', timerTextColor);

      formData.append('enableCountdown', enableCountdown);
      if (countdownEndTime) {
        formData.append('countdownEndTime', new Date(countdownEndTime).toISOString());
      }

      formData.append('targetPages', targetPages);
      formData.append('customPagePath', customPagePath);
      formData.append('triggerType', triggerType);
      formData.append('scrollPercentage', scrollPercentage);

      formData.append('isActive', isActive);
      formData.append('delaySeconds', delaySeconds);
      formData.append('showOncePerSession', showOncePerSession);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      if (editingPopup) {
        await api.put(`/api/popups/${editingPopup._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Popup updated successfully!');
      } else {
        await api.post('/api/popups', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('New popup created and activated!');
      }

      setModalOpen(false);
      fetchPopups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save popup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Popups & Targeting">
      <div style={{ padding: '1.5rem 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--onyx)', margin: 0 }}>Promotional Popups & Performance</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Control target pages, smart scroll/time/exit triggers, and monitor live customer hits & conversions!
            </p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.85rem', fontSize: '0.825rem', borderRadius: '6px' }}>
            <span>➕</span> Create New Popup
          </button>
        </div>

        {/* Analytics Performance Bar */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.25rem' }}>
          <div className="admin-stat-card">
            <span className="stat-label">Total Impressions</span>
            <span className="stat-val">{totalImpressions.toLocaleString()}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Total CTA Hits</span>
            <span className="stat-val" style={{ color: '#059669' }}>{totalClicks.toLocaleString()}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Avg CTR Rate</span>
            <span className="stat-val" style={{ color: '#2563eb' }}>{overallCtr}%</span>
          </div>
        </div>

        {/* List of Popups */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
            <p style={{ color: '#64748b' }}>Loading promotional popups...</p>
          </div>
        ) : popups.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📣</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--onyx)', marginBottom: '0.5rem' }}>No Active Popups</h3>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Create your first promotional popup with scroll triggers or page-specific targeting to boost customer conversions!
            </p>
            <button onClick={openAddModal} className="btn btn-primary">➕ Create First Popup</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {popups.map((p) => {
              const ctr = (p.impressionsCount || 0) > 0 ? (((p.clicksCount || 0) / (p.impressionsCount || 0)) * 100).toFixed(1) : '0.0';
              return (
                <div key={p._id} style={{ background: 'white', borderRadius: '14px', border: p.isActive ? '2px solid #10b981' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '1rem', background: p.isActive ? '#ecfdf5' : '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: p.isActive ? '#047857' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.isActive ? '#10b981' : '#94a3b8' }}></span>
                      {p.isActive ? 'ACTIVE ON WEBSITE' : 'INACTIVE'}
                    </span>
                    <button
                      onClick={() => toggleActive(p)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '20px', border: 'none', background: p.isActive ? '#10b981' : '#cbd5e1', color: 'white', cursor: 'pointer' }}
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Badge & Title */}
                    {p.badgeText && (
                      <span style={{ background: p.badgeBgColor || '#ef4444', color: p.badgeTextColor || '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', display: 'inline-block', width: 'fit-content', marginBottom: '0.5rem' }}>
                        {p.badgeText}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--onyx)', margin: '0 0 0.5rem 0' }}>{p.title}</h3>

                    {/* Analytics Performance Box */}
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                          👁️ Views: <strong>{(p.impressionsCount || 0).toLocaleString()}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 'bold' }}>
                          🎯 Hits: <strong>{(p.clicksCount || 0).toLocaleString()}</strong> ({ctr}% CTR)
                        </div>
                      </div>
                      <button
                        onClick={() => handleResetAnalytics(p._id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Reset View and Click Stats"
                      >
                        Reset Stats
                      </button>
                    </div>

                    {/* Targeting & Trigger Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '4px', color: '#1d4ed8', fontWeight: 'bold' }}>
                        🎯 Target: {p.targetPages === 'all' ? 'All Pages' : p.targetPages === 'home' ? 'Homepage Only' : p.targetPages === 'booking' ? 'Booking Page' : p.targetPages === 'services' ? 'Services Pages' : p.customPagePath || 'Custom'}
                      </span>
                      <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '4px', color: '#15803d', fontWeight: 'bold' }}>
                        ⚡ Trigger: {p.triggerType === 'scroll_percentage' ? `${p.scrollPercentage || 30}% Scroll` : p.triggerType === 'exit_intent' ? 'Exit Intent' : p.triggerType === 'immediate' ? 'Immediate' : `${p.delaySeconds || 2}s Delay`}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        style={{ flex: 1, padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--onyx)' }}
                      >
                        ✏️ Edit / Customize
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{ padding: '8px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add / Edit Popup */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setModalOpen(false)}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '950px', maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              {/* Modal Header with Tabs */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--onyx)' }}>
                    {editingPopup ? '✏️ Customize Popup & Rules' : '➕ Create New Promotional Popup'}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ background: '#cbd5e1', padding: '3px', borderRadius: '8px', display: 'flex' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('editor')}
                      style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', background: previewTab === 'editor' ? 'white' : 'transparent', color: previewTab === 'editor' ? 'var(--onyx)' : '#64748b' }}
                    >
                      ⚙️ Form Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('preview')}
                      style={{ padding: '6px 14px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', background: previewTab === 'preview' ? '#10b981' : 'transparent', color: previewTab === 'preview' ? 'white' : '#64748b' }}
                    >
                      👁️ Live Preview
                    </button>
                  </div>
                  <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', marginLeft: '0.5rem' }}>&times;</button>
                </div>
              </div>

              {/* Form Content / Live Preview */}
              {previewTab === 'preview' ? (
                /* LIVE PREVIEW MODE */
                <div style={{ padding: '3rem 1.5rem', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '450px' }}>
                  <div
                    style={{
                      position: 'relative',
                      backgroundColor: backgroundColor,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      maxWidth: (imagePlacement === 'left' || imagePlacement === 'right') && imagePreview ? '700px' : '480px',
                      width: '100%',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      flexDirection: (imagePlacement === 'left' || imagePlacement === 'right') ? (imagePlacement === 'left' ? 'row' : 'row-reverse') : (imagePlacement === 'bottom' ? 'column-reverse' : 'column')
                    }}
                  >
                    {imagePreview && (
                      <div style={{ flex: (imagePlacement === 'left' || imagePlacement === 'right') ? 1 : 'none', height: (imagePlacement === 'top' || imagePlacement === 'bottom') ? '180px' : 'auto', minHeight: (imagePlacement === 'left' || imagePlacement === 'right') ? '280px' : 'auto', background: '#f8fafc' }}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    <div style={{ flex: (imagePlacement === 'left' || imagePlacement === 'right') ? 1.2 : 1, padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {badgeText && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ background: badgeBgColor, color: badgeTextColor, fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                            {badgeText}
                          </span>
                        </div>
                      )}
                      <h2 style={{ color: titleColor, fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{title || 'Popup Title'}</h2>
                      {description && <p style={{ color: descriptionColor, fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: 1.4 }}>{description}</p>}

                      {enableCountdown && (
                        <div style={{ background: timerBgColor, color: timerTextColor, padding: '8px 12px', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          <div>02<div style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>HOURS</div></div>
                          <div>:</div>
                          <div>45<div style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>MINS</div></div>
                          <div>:</div>
                          <div>18<div style={{ fontSize: '0.65rem', fontWeight: 'normal' }}>SECS</div></div>
                        </div>
                      )}

                      {ctaType === 'form' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input type="text" disabled placeholder="Customer Name" style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                          <input type="tel" disabled placeholder="Phone Number *" style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                          <button type="button" style={{ background: ctaBgColor, color: ctaTextColor, border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {ctaText || 'Submit'}
                          </button>
                        </div>
                      ) : (
                        <button type="button" style={{ background: ctaBgColor, color: ctaTextColor, border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>
                          {ctaText || 'Claim Offer'} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* FORM EDITOR MODE */
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Left Column: Content, Image & Page/Trigger Rules */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--onyx)', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      1. Content, Media & Placement
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Title *</label>
                      <input type="text" required value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Description</label>
                      <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}></textarea>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Popup Image</label>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '0.5rem' }} />
                      <input type="url" placeholder="OR Enter Image URL" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); }} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Image Placement Option</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {['left', 'right', 'top', 'bottom'].map(pos => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setImagePlacement(pos)}
                            style={{
                              padding: '8px 4px',
                              border: imagePlacement === pos ? '2px solid #0f172a' : '1px solid #cbd5e1',
                              borderRadius: '6px',
                              background: imagePlacement === pos ? '#f1f5f9' : 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              textTransform: 'capitalize',
                              cursor: 'pointer'
                            }}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Page & Trigger Settings */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--onyx)', margin: '1.5rem 0 1rem 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      2. Page Targeting & Smart Triggers
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Target Website Pages</label>
                      <select value={targetPages} onChange={e => setTargetPages(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white' }}>
                        <option value="all">🌐 All Website Pages</option>
                        <option value="home">🏠 Homepage Only ( / )</option>
                        <option value="booking">✂️ Booking Page Only ( /booking )</option>
                        <option value="services">👔 Services Pages ( /services )</option>
                        <option value="custom">⚙️ Custom Page Path</option>
                      </select>
                      {targetPages === 'custom' && (
                        <input
                          type="text"
                          placeholder="e.g. /loyalty or /contact"
                          value={customPagePath}
                          onChange={e => setCustomPagePath(e.target.value)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '0.5rem', fontSize: '0.85rem' }}
                        />
                      )}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>When To Show Popup (Smart Trigger)</label>
                      <select value={triggerType} onChange={e => setTriggerType(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white' }}>
                        <option value="time_delay">⏱️ Time Delay (After X Seconds)</option>
                        <option value="scroll_percentage">📜 Page Scroll Percentage (e.g. 30% Down)</option>
                        <option value="exit_intent">🚪 Exit Intent (When Cursor Leaves Page)</option>
                        <option value="immediate">⚡ Immediate On Page Load</option>
                      </select>
                    </div>

                    {triggerType === 'time_delay' && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Delay Time (Seconds)</label>
                        <input type="number" min="0" value={delaySeconds} onChange={e => setDelaySeconds(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                      </div>
                    )}

                    {triggerType === 'scroll_percentage' && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Trigger Scroll Percentage ({scrollPercentage}%)</label>
                        <input type="range" min="10" max="90" step="5" value={scrollPercentage} onChange={e => setScrollPercentage(Number(e.target.value))} style={{ width: '100%' }} />
                      </div>
                    )}
                  </div>

                  {/* Right Column: CTA, Badge, Timer & Color Palette */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--onyx)', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      3. CTA Action, Badge & Color Palette
                    </h3>

                    {/* CTA Configuration */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>CTA Action Type</label>
                      <select value={ctaType} onChange={e => setCtaType(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '0.5rem', background: 'white' }}>
                        <option value="link">🔗 Button with URL Link</option>
                        <option value="form">📋 Quick Phone / Lead Form</option>
                      </select>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Button Text</label>
                          <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                        </div>
                        {ctaType === 'link' ? (
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Target URL</label>
                            <input type="text" value={ctaLink} onChange={e => setCtaLink(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                          </div>
                        ) : (
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Success Message</label>
                            <input type="text" value={ctaSuccessMessage} onChange={e => setCtaSuccessMessage(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge Settings */}
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Badge Text (e.g. Sale / Offer)</label>
                      <input type="text" value={badgeText} onChange={e => setBadgeText(e.target.value)} style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Badge BG:</span>
                          <input type="color" value={badgeBgColor} onChange={e => setBadgeBgColor(e.target.value)} style={{ width: '100%', height: '30px', border: 'none', cursor: 'pointer' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Badge Text:</span>
                          <input type="color" value={badgeTextColor} onChange={e => setBadgeTextColor(e.target.value)} style={{ width: '100%', height: '30px', border: 'none', cursor: 'pointer' }} />
                        </div>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', borderRadius: '8px', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enableCountdown ? '0.5rem' : 0 }}>
                        <strong style={{ fontSize: '0.85rem', color: '#92400e' }}>⏳ Enable Countdown Timer</strong>
                        <input type="checkbox" checked={enableCountdown} onChange={e => setEnableCountdown(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      </div>
                      {enableCountdown && (
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#92400e', display: 'block', marginBottom: '2px' }}>Timer Expiration Date & Time:</label>
                          <input type="datetime-local" value={countdownEndTime} onChange={e => setCountdownEndTime(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '0.85rem' }} />
                        </div>
                      )}
                    </div>

                    {/* Color Options Palette */}
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', color: 'var(--onyx)' }}>🎨 Complete Color Customization</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Popup BG:</span>
                          <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Title Color:</span>
                          <input type="color" value={titleColor} onChange={e => setTitleColor(e.target.value)} style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Desc Color:</span>
                          <input type="color" value={descriptionColor} onChange={e => setDescriptionColor(e.target.value)} style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Button BG:</span>
                          <input type="color" value={ctaBgColor} onChange={e => setCtaBgColor(e.target.value)} style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Button Text:</span>
                          <input type="color" value={ctaTextColor} onChange={e => setCtaTextColor(e.target.value)} style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Timer BG:</span>
                          <input type="color" value={timerBgColor} onChange={e => setTimerBgColor(e.target.value)} style={{ width: '100%', height: '28px', border: 'none', cursor: 'pointer' }} />
                        </div>
                      </div>
                    </div>

                    {/* Submit Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                        {submitting ? 'Saving...' : (editingPopup ? 'Update Popup' : 'Publish Popup')}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

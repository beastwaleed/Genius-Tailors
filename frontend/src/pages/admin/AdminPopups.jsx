import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export const PREBUILT_TEMPLATES = [
  {
    id: 'hero-card',
    name: 'Modern Hero Card',
    tagline: 'Hero banner on top with clean card body',
    icon: '📱',
    previewBadge: '🔥 LIMITED OFFER',
    previewTitle: 'Sign up now & Get 15% Off',
    previewDesc: 'Enter your phone/email to claim exclusive master tailoring discounts.',
    defaults: {
      template: 'hero-card',
      title: 'Sign up now & Get 15% Off!',
      description: 'Enter your phone or email to claim an exclusive 15% discount on custom suits & shalwar kameez.',
      badgeText: '🔥 LIMITED TIME OFFER',
      badgeBgColor: '#ef4444',
      badgeTextColor: '#ffffff',
      backgroundColor: '#ffffff',
      titleColor: '#0f172a',
      descriptionColor: '#475569',
      ctaBgColor: '#0f172a',
      ctaTextColor: '#ffffff',
      ctaText: 'Claim 15% Discount Now',
      ctaLink: '/booking',
      imagePlacement: 'top',
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id: 'circular-badge',
    name: 'Circular Offer Badge',
    tagline: 'High-urgency circular badge deal',
    icon: '🟣',
    previewBadge: '⚡ FLASH DEAL',
    previewTitle: "Don't Leave Without An Offer!",
    previewDesc: 'Claim your instant Rs. 1,000 tailoring voucher right now.',
    defaults: {
      template: 'circular-badge',
      title: "Don't leave without an exclusive offer from us!",
      description: 'Claim your instant Rs. 1,000 voucher on any custom tailored suit or shalwar kameez.',
      badgeText: '⚡ FLASH VOUCHER',
      badgeBgColor: '#ec4899',
      badgeTextColor: '#ffffff',
      backgroundColor: '#1e1b4b',
      titleColor: '#ffffff',
      descriptionColor: '#c7d2fe',
      ctaBgColor: '#ec4899',
      ctaTextColor: '#ffffff',
      ctaText: 'I Want To Hear & Save!',
      ctaLink: '/booking',
      imagePlacement: 'top',
      imageUrl: ''
    }
  },
  {
    id: 'luxury-dark',
    name: 'Royal Onyx & Gold',
    tagline: 'Luxury bespoke edition with gold trim',
    icon: '👑',
    previewBadge: '⚜️ BESPOKE PRIVILEGE',
    previewTitle: 'Master Tailored Royal Suit',
    previewDesc: 'Experience royal bespoke tailoring with English & Italian wools.',
    defaults: {
      template: 'luxury-dark',
      title: 'Master Tailored Royal Excellence',
      description: 'Experience royal bespoke tailoring with imported Italian & English fabrics. Reserve your private master session.',
      badgeText: '⚜️ BESPOKE PRIVILEGE',
      badgeBgColor: '#C9A96E',
      badgeTextColor: '#000000',
      backgroundColor: '#141414',
      titleColor: '#FDFBF7',
      descriptionColor: '#a1a1aa',
      ctaBgColor: '#C9A96E',
      ctaTextColor: '#000000',
      ctaText: 'Book VIP Fitting Session',
      ctaLink: '/booking',
      imagePlacement: 'top',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id: 'split-card',
    name: 'Editorial Split Banner',
    tagline: 'Desktop 2-column split / auto mobile stack',
    icon: '🖼️',
    previewBadge: '✨ SIGNATURE FIT',
    previewTitle: 'Handcrafted Kurta & Shalwar',
    previewDesc: 'Crisp collars, flawless stitches, and guaranteed perfect fit.',
    defaults: {
      template: 'split-card',
      title: 'Handcrafted Kurta & Shalwar Kameez',
      description: 'Crisp collars, flawless stitches, and guaranteed perfect fit. Delivery right to your doorstep.',
      badgeText: '✨ SIGNATURE FIT',
      badgeBgColor: '#2563eb',
      badgeTextColor: '#ffffff',
      backgroundColor: '#ffffff',
      titleColor: '#0f172a',
      descriptionColor: '#475569',
      ctaBgColor: '#1d4ed8',
      ctaTextColor: '#ffffff',
      ctaText: 'Explore Signature Styles',
      ctaLink: '/services',
      imagePlacement: 'left',
      imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id: 'bottom-banner',
    name: 'Floating Bottom Sheet',
    tagline: 'Non-intrusive mobile slide-up bar',
    icon: '⚡',
    previewBadge: '💬 QUICK BOOKING',
    previewTitle: 'Need Express Tailoring in 48h?',
    previewDesc: 'Urgent event? Chat directly with our master tailor.',
    defaults: {
      template: 'bottom-banner',
      title: 'Need Express Tailoring in 48 Hours?',
      description: 'Express stitching available for urgent events. Direct WhatsApp consultation with our master tailor.',
      badgeText: '⚡ EXPRESS SERVICE',
      badgeBgColor: '#10b981',
      badgeTextColor: '#ffffff',
      backgroundColor: '#0f172a',
      titleColor: '#ffffff',
      descriptionColor: '#94a3b8',
      ctaBgColor: '#10b981',
      ctaTextColor: '#ffffff',
      ctaText: 'WhatsApp Master Tailor Now',
      ctaLink: '/booking',
      imagePlacement: 'top',
      imageUrl: ''
    }
  }
];

export default function AdminPopups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [previewTab, setPreviewTab] = useState('editor'); // 'editor' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'
  const [hideMobileFrame, setHideMobileFrame] = useState(false);

  // Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState('hero-card');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imagePlacement, setImagePlacement] = useState('top'); // left, right, top, bottom

  // Badge
  const [badgeText, setBadgeText] = useState('🔥 LIMITED TIME OFFER');
  const [badgeBgColor, setBadgeBgColor] = useState('#ef4444');
  const [badgeTextColor, setBadgeTextColor] = useState('#ffffff');

  // CTA
  const [ctaType, setCtaType] = useState('link'); // link, form
  const [ctaText, setCtaText] = useState('Claim 15% Discount Now');
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

  const applyTemplateDefaults = (tmplId) => {
    const tmpl = PREBUILT_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;
    setSelectedTemplate(tmplId);
    const def = tmpl.defaults;
    setTitle(def.title);
    setDescription(def.description);
    setBadgeText(def.badgeText);
    setBadgeBgColor(def.badgeBgColor);
    setBadgeTextColor(def.badgeTextColor);
    setBackgroundColor(def.backgroundColor);
    setTitleColor(def.titleColor);
    setDescriptionColor(def.descriptionColor);
    setCtaBgColor(def.ctaBgColor);
    setCtaTextColor(def.ctaTextColor);
    setCtaText(def.ctaText);
    setCtaLink(def.ctaLink);
    setImagePlacement(def.imagePlacement);
    if (def.imageUrl) {
      setImageUrl(def.imageUrl);
      setImagePreview(def.imageUrl);
    } else {
      setImageUrl('');
      setImagePreview('');
    }
    toast.success(`Loaded "${tmpl.name}" design presets!`);
  };

  const openAddModal = (templateId = 'hero-card') => {
    setEditingPopup(null);
    const tmpl = PREBUILT_TEMPLATES.find(t => t.id === templateId) || PREBUILT_TEMPLATES[0];
    setSelectedTemplate(tmpl.id);
    const def = tmpl.defaults;

    setTitle(def.title);
    setDescription(def.description);
    setImageFile(null);
    setImageUrl(def.imageUrl || '');
    setImagePreview(def.imageUrl || '');
    setImagePlacement(def.imagePlacement || 'top');

    setBadgeText(def.badgeText);
    setBadgeBgColor(def.badgeBgColor);
    setBadgeTextColor(def.badgeTextColor);

    setCtaType('link');
    setCtaText(def.ctaText);
    setCtaLink(def.ctaLink);
    setCtaSuccessMessage('Thank you! Our master tailor will contact you shortly.');

    setBackgroundColor(def.backgroundColor);
    setTitleColor(def.titleColor);
    setDescriptionColor(def.descriptionColor);
    setCtaBgColor(def.ctaBgColor);
    setCtaTextColor(def.ctaTextColor);
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

    setPreviewDevice('mobile');
    setHideMobileFrame(false);
    setPreviewTab('editor');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPopup(p);
    const tmpl = p.template || (p.imagePlacement === 'left' || p.imagePlacement === 'right' ? 'split-card' : 'hero-card');
    setSelectedTemplate(tmpl);

    setTitle(p.title || '');
    setDescription(p.description || '');
    setImageFile(null);
    setImageUrl(p.imageUrl || '');
    setImagePreview(p.imageUrl || '');
    setImagePlacement(p.imagePlacement || 'top');

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

    setPreviewDevice('mobile');
    setHideMobileFrame(false);
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
      formData.append('template', selectedTemplate);
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

  const isCircular = selectedTemplate === 'circular-badge';
  const isBottomSheet = selectedTemplate === 'bottom-banner';
  const isLuxury = selectedTemplate === 'luxury-dark';

  return (
    <AdminLayout title="Popups & Targeting">
      <div style={{ padding: '1.5rem 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--onyx)', margin: 0 }}>Promotional Popups & Performance</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Create mobile & desktop-perfect popups from prebuilt templates. Monitor views, clicks, and conversion rates!
            </p>
          </div>
          <button onClick={() => openAddModal('hero-card')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.85rem', fontSize: '0.825rem', borderRadius: '6px' }}>
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

        {/* Prebuilt Templates Quick Launcher Banner */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--onyx)' }}>
                ✨ Prebuilt Mobile & Desktop Popup Templates
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Start instantly with tested, beautifully balanced designs that look stunning on any screen:
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {PREBUILT_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => openAddModal(tmpl.id)}
                style={{
                  textAlign: 'left',
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0f172a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{tmpl.icon}</span>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--onyx)' }}>{tmpl.name}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>{tmpl.tagline}</span>
                <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>Use Template →</span>
              </button>
            ))}
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
              Create your first promotional popup with mobile-optimized prebuilt templates to boost customer conversions!
            </p>
            <button onClick={() => openAddModal('hero-card')} className="btn btn-primary">➕ Create First Popup</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {popups.map((p) => {
              const ctr = (p.impressionsCount || 0) > 0 ? (((p.clicksCount || 0) / (p.impressionsCount || 0)) * 100).toFixed(1) : '0.0';
              const templateInfo = PREBUILT_TEMPLATES.find(t => t.id === p.template) || PREBUILT_TEMPLATES[0];

              return (
                <div key={p._id} style={{ background: 'white', borderRadius: '14px', border: p.isActive ? '2px solid #10b981' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '0.85rem 1rem', background: p.isActive ? '#ecfdf5' : '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    {/* Template & Badge */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: 'var(--onyx)', fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>
                        {templateInfo.icon} {templateInfo.name}
                      </span>
                      {p.badgeText && (
                        <span style={{ background: p.badgeBgColor || '#ef4444', color: p.badgeTextColor || '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>
                          {p.badgeText}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--onyx)', margin: '0 0 0.5rem 0' }}>{p.title}</h3>

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
                        Edit / Customize
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{ padding: '8px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}
                      >
                        Delete
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
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '1000px', maxHeight: '94vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              
              {/* Modal Header with Tabs */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--onyx)' }}>
                    {editingPopup ? 'Customize Popup & Design' : 'Create New Promotional Popup'}
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

              {/* LIVE PREVIEW MODE */}
              {previewTab === 'preview' ? (
                <div style={{ padding: '1.5rem', background: '#090d16', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '600px' }}>
                  {/* Device Switcher Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '780px', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '6px', background: '#1e293b', padding: '4px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        style={{
                          padding: '6px 14px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: previewDevice === 'mobile' ? '#3b82f6' : 'transparent',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        📱 Mobile View (375px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        style={{
                          padding: '6px 14px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: previewDevice === 'desktop' ? '#3b82f6' : 'transparent',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        💻 Desktop View
                      </button>
                    </div>

                    {previewDevice === 'mobile' && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={hideMobileFrame}
                          onChange={(e) => setHideMobileFrame(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        Hide Mobile Device Frame
                      </label>
                    )}
                  </div>

                  {/* Render Mockup Container */}
                  {previewDevice === 'mobile' ? (
                    hideMobileFrame ? (
                      /* Mobile View without frame */
                      <div style={{ width: '100%', maxWidth: '375px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div
                          className={`gt-popup-card gt-popup-card--${selectedTemplate}`}
                          style={{
                            backgroundColor: backgroundColor,
                            color: descriptionColor
                          }}
                        >
                          {/* Close Button */}
                          <button className="gt-popup-close-btn" type="button">&times;</button>

                          {/* Image */}
                          {imagePreview && !isCircular && (
                            <div className="gt-popup-img-wrap">
                              <img src={imagePreview} alt="Preview" className="gt-popup-img" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="gt-popup-body">
                            {badgeText && (
                              <div style={{ textAlign: isCircular ? 'center' : 'inherit' }}>
                                <span className="gt-popup-badge" style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}>
                                  {badgeText}
                                </span>
                              </div>
                            )}
                            <h2 className="gt-popup-title" style={{ color: titleColor, fontFamily: isLuxury ? 'var(--font-serif)' : 'inherit', textAlign: isCircular ? 'center' : 'inherit' }}>
                              {title || 'Popup Title'}
                            </h2>
                            {description && (
                              <p className="gt-popup-desc" style={{ color: descriptionColor, textAlign: isCircular ? 'center' : 'inherit' }}>
                                {description}
                              </p>
                            )}

                            {enableCountdown && (
                              <div className="gt-popup-timer" style={{ backgroundColor: timerBgColor, color: timerTextColor }}>
                                <div><span style={{ fontSize: '1.1rem', fontWeight: 800 }}>02</span><span style={{ fontSize: '0.65rem', display: 'block' }}>HOURS</span></div>
                                <span>:</span>
                                <div><span style={{ fontSize: '1.1rem', fontWeight: 800 }}>45</span><span style={{ fontSize: '0.65rem', display: 'block' }}>MINS</span></div>
                                <span>:</span>
                                <div><span style={{ fontSize: '1.1rem', fontWeight: 800 }}>18</span><span style={{ fontSize: '0.65rem', display: 'block' }}>SECS</span></div>
                              </div>
                            )}

                            {ctaType === 'form' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input type="text" disabled placeholder="Customer Name" className="gt-popup-input" />
                                <input type="tel" disabled placeholder="Phone / WhatsApp Number *" className="gt-popup-input" />
                                <button type="button" className="gt-popup-btn" style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}>
                                  {ctaText || 'Submit'}
                                </button>
                              </div>
                            ) : (
                              <button type="button" className="gt-popup-btn" style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}>
                                {ctaText || 'Claim Offer'} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Realistic Smartphone Frame Mockup */
                      <div
                        style={{
                          width: '340px',
                          height: '630px',
                          borderRadius: '44px',
                          border: '11px solid #1e293b',
                          background: '#020617',
                          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {/* Speaker & Camera Notch */}
                        <div style={{ width: '100px', height: '18px', background: '#1e293b', borderRadius: '0 0 14px 14px', margin: '0 auto', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#090d16', marginRight: '6px' }}></div>
                          <div style={{ width: '30px', height: '4px', borderRadius: '2px', background: '#334155' }}></div>
                        </div>

                        {/* Screen Content Simulator */}
                        <div
                          style={{
                            flex: 1,
                            overflowY: 'auto',
                            position: 'relative',
                            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                            display: 'flex',
                            alignItems: isBottomSheet ? 'flex-end' : 'center',
                            justifyContent: 'center',
                            padding: isBottomSheet ? 0 : '12px'
                          }}
                        >
                          <div
                            className={`gt-popup-card gt-popup-card--${selectedTemplate}`}
                            style={{
                              backgroundColor: backgroundColor,
                              color: descriptionColor
                            }}
                          >
                            {/* Close Button */}
                            <button className="gt-popup-close-btn" type="button">&times;</button>

                            {/* Image */}
                            {imagePreview && !isCircular && (
                              <div className="gt-popup-img-wrap">
                                <img src={imagePreview} alt="Preview" className="gt-popup-img" />
                              </div>
                            )}

                            {/* Content */}
                            <div className="gt-popup-body">
                              {badgeText && (
                                <div style={{ textAlign: isCircular ? 'center' : 'inherit' }}>
                                  <span className="gt-popup-badge" style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}>
                                    {badgeText}
                                  </span>
                                </div>
                              )}
                              <h2 className="gt-popup-title" style={{ color: titleColor, fontFamily: isLuxury ? 'var(--font-serif)' : 'inherit', textAlign: isCircular ? 'center' : 'inherit' }}>
                                {title || 'Popup Title'}
                              </h2>
                              {description && (
                                <p className="gt-popup-desc" style={{ color: descriptionColor, textAlign: isCircular ? 'center' : 'inherit' }}>
                                  {description}
                                </p>
                              )}

                              {enableCountdown && (
                                <div className="gt-popup-timer" style={{ backgroundColor: timerBgColor, color: timerTextColor }}>
                                  <div><span style={{ fontSize: '1.1rem', fontWeight: 800 }}>02</span><span style={{ fontSize: '0.65rem', display: 'block' }}>HOURS</span></div>
                                  <span>:</span>
                                  <div><span style={{ fontSize: '1.1rem', fontWeight: 800 }}>45</span><span style={{ fontSize: '0.65rem', display: 'block' }}>MINS</span></div>
                                  <span>:</span>
                                  <div><span style={{ fontSize: '1.1rem', fontWeight: 800 }}>18</span><span style={{ fontSize: '0.65rem', display: 'block' }}>SECS</span></div>
                                </div>
                              )}

                              {ctaType === 'form' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <input type="text" disabled placeholder="Customer Name" className="gt-popup-input" />
                                  <input type="tel" disabled placeholder="Phone / WhatsApp Number *" className="gt-popup-input" />
                                  <button type="button" className="gt-popup-btn" style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}>
                                    {ctaText || 'Submit'}
                                  </button>
                                </div>
                              ) : (
                                <button type="button" className="gt-popup-btn" style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}>
                                  {ctaText || 'Claim Offer'} →
                                </button>
                              )}

                              <p style={{ fontSize: '0.7rem', textAlign: 'center', margin: '0.65rem 0 0 0', opacity: 0.6, color: 'inherit' }}>
                                🔒 Exclusive offer • No spam guarantee
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Phone Home Bar */}
                        <div style={{ height: '16px', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '90px', height: '4px', background: '#475569', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Desktop View Simulator */
                    <div style={{ width: '100%', maxWidth: '820px', padding: '2rem', display: 'flex', alignItems: isBottomSheet ? 'flex-end' : 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div
                        className={`gt-popup-card gt-popup-card--${selectedTemplate} ${selectedTemplate === 'split-card' && imagePlacement === 'right' ? 'split-reverse' : ''}`}
                        style={{
                          backgroundColor: backgroundColor,
                          color: descriptionColor
                        }}
                      >
                        {/* Close Button */}
                        <button className="gt-popup-close-btn" type="button">&times;</button>

                        {/* Image */}
                        {imagePreview && !isCircular && (
                          <div className="gt-popup-img-wrap">
                            <img src={imagePreview} alt="Preview" className="gt-popup-img" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="gt-popup-body">
                          {badgeText && (
                            <div style={{ textAlign: isCircular ? 'center' : 'inherit' }}>
                              <span className="gt-popup-badge" style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}>
                                {badgeText}
                              </span>
                            </div>
                          )}
                          <h2 className="gt-popup-title" style={{ color: titleColor, fontFamily: isLuxury ? 'var(--font-serif)' : 'inherit', textAlign: isCircular ? 'center' : 'inherit' }}>
                            {title || 'Popup Title'}
                          </h2>
                          {description && (
                            <p className="gt-popup-desc" style={{ color: descriptionColor, textAlign: isCircular ? 'center' : 'inherit' }}>
                              {description}
                            </p>
                          )}

                          {enableCountdown && (
                            <div className="gt-popup-timer" style={{ backgroundColor: timerBgColor, color: timerTextColor }}>
                              <div><span style={{ fontSize: '1.25rem', fontWeight: 800 }}>02</span><span style={{ fontSize: '0.65rem', display: 'block' }}>HOURS</span></div>
                              <span>:</span>
                              <div><span style={{ fontSize: '1.25rem', fontWeight: 800 }}>45</span><span style={{ fontSize: '0.65rem', display: 'block' }}>MINS</span></div>
                              <span>:</span>
                              <div><span style={{ fontSize: '1.25rem', fontWeight: 800 }}>18</span><span style={{ fontSize: '0.65rem', display: 'block' }}>SECS</span></div>
                            </div>
                          )}

                          {ctaType === 'form' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input type="text" disabled placeholder="Customer Name" className="gt-popup-input" />
                              <input type="tel" disabled placeholder="Phone / WhatsApp Number *" className="gt-popup-input" />
                              <button type="button" className="gt-popup-btn" style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}>
                                {ctaText || 'Submit'}
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="gt-popup-btn" style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}>
                              {ctaText || 'Claim Offer'} →
                            </button>
                          )}

                          <p style={{ fontSize: '0.725rem', textAlign: 'center', margin: '0.75rem 0 0 0', opacity: 0.65, color: 'inherit' }}>
                            🔒 Exclusive offer • No spam guarantee
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* FORM EDITOR MODE */
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Step 1: Prebuilt Template Selection Gallery */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--onyx)' }}>
                          Step 1: Choose Prebuilt Template
                        </h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Select an optimized mobile/desktop layout:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyTemplateDefaults(selectedTemplate)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: 'var(--onyx)'
                        }}
                      >
                        ⚡ Re-apply Template Design Presets
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                      {PREBUILT_TEMPLATES.map((tmpl) => {
                        const isSelected = selectedTemplate === tmpl.id;
                        return (
                          <div
                            key={tmpl.id}
                            onClick={() => {
                              setSelectedTemplate(tmpl.id);
                              // Auto apply template image placement
                              setImagePlacement(tmpl.defaults.imagePlacement);
                            }}
                            style={{
                              border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                              background: isSelected ? '#ffffff' : '#f8fafc',
                              borderRadius: '10px',
                              padding: '10px',
                              cursor: 'pointer',
                              boxShadow: isSelected ? '0 4px 12px rgba(15,23,42,0.1)' : 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              position: 'relative'
                            }}
                          >
                            {isSelected && (
                              <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#0f172a', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>
                                ACTIVE
                              </span>
                            )}
                            <div style={{ fontSize: '1.4rem' }}>{tmpl.icon}</div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--onyx)' }}>{tmpl.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>{tmpl.tagline}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                applyTemplateDefaults(tmpl.id);
                              }}
                              style={{
                                marginTop: '6px',
                                padding: '4px 8px',
                                border: '1px solid #cbd5e1',
                                background: isSelected ? '#0f172a' : '#ffffff',
                                color: isSelected ? '#ffffff' : 'var(--onyx)',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Apply Defaults
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Content & Details Form */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Left Column: Content, Media & Triggers */}
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--onyx)', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                        Step 2: Content, Media & Layout
                      </h3>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Title *</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Description</label>
                        <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}></textarea>
                      </div>

                      {!isCircular && (
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Popup Image</label>
                          <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '0.5rem' }} />
                          <input type="url" placeholder="OR Enter Image URL" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); }} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }} />
                        </div>
                      )}

                      {selectedTemplate === 'split-card' && (
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Desktop Image Placement</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {['left', 'right'].map(pos => (
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
                                {pos === 'left' ? '⬅️ Image Left' : '➡️ Image Right'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Target Page & Trigger Settings */}
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--onyx)', margin: '1.5rem 0 1rem 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                        Step 3: Page Targeting & Smart Triggers
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

                    {/* Right Column: CTA, Badge, Timer & Colors */}
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--onyx)', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                        Step 4: CTA Action & Badge
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

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';
import toast from 'react-hot-toast';

export default function AdminRetargeting() {
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'history' | 'quick'

  // WHOM to Retarget State
  const [audienceType, setAudienceType] = useState('all'); // 'all' | 'tier' | 'tag' | 'inactive' | 'high_ltv' | 'specific'
  const [targetTier, setTargetTier] = useState('Bronze');
  const [targetTag, setTargetTag] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [audienceList, setAudienceList] = useState([]);
  const [audienceCount, setAudienceCount] = useState(0);
  const [loadingAudience, setLoadingAudience] = useState(false);

  // WHAT to Retarget State
  const [campaignName, setCampaignName] = useState('VIP Return Special');
  const [promoCode, setPromoCode] = useState('VIP15');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [expiryDays, setExpiryDays] = useState(7);
  const [ctaLink, setCtaLink] = useState('/booking');
  const [customMessage, setCustomMessage] = useState(
    'Salam {name}! We miss your custom style at Genius Tailors. Use code {code} for {discount} + Free Delivery on your next suit.'
  );

  // HOW to Retarget State (Channels)
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelPopup, setChannelPopup] = useState(false);
  const [launching, setLaunching] = useState(false);

  // Campaign History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // All users dropdown list for specific user picker
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const initData = async () => {
      let usersList = allUsers;
      if (usersList.length === 0) {
        try {
          const { data } = await api.get('/api/admin/users');
          usersList = data || [];
          setAllUsers(usersList);
        } catch (e) {
          console.error('Failed to load customers list', e);
        }
      }

      let activeUid = selectedUserId;
      if (audienceType === 'specific') {
        if (!activeUid && usersList.length > 0) {
          activeUid = usersList[0]._id;
          setSelectedUserId(activeUid);
        }
      }

      fetchAudiencePreview(activeUid);
      fetchHistory();
    };

    initData();
  }, [audienceType, targetTier, targetTag]);

  const fetchAudiencePreview = async (overrideUserId) => {
    setLoadingAudience(true);
    try {
      const activeUid = typeof overrideUserId === 'string' ? overrideUserId : (selectedUserId || (allUsers.length > 0 ? allUsers[0]._id : ''));
      const params = { audienceType };
      if (audienceType === 'tier') params.tier = targetTier;
      if (audienceType === 'tag') params.tag = targetTag;
      if (audienceType === 'specific') {
        if (!activeUid) {
          setAudienceCount(0);
          setAudienceList([]);
          setLoadingAudience(false);
          return;
        }
        params.userId = activeUid;
      }

      const { data } = await api.get('/api/admin/crm/retargeting/audience', { params });
      setAudienceCount(data.count || 0);
      setAudienceList(data.users || []);
    } catch (error) {
      console.error('Audience preview error:', error);
    } finally {
      setLoadingAudience(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/api/admin/crm/retargeting/history');
      setHistory(data || []);
    } catch (e) {
      console.error('Failed to fetch retargeting history', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }

    const channels = [];
    if (channelEmail) channels.push('email');
    if (channelWhatsapp) channels.push('whatsapp');
    if (channelPopup) channels.push('popup');

    if (channels.length === 0) {
      toast.error('Please select at least one retargeting channel');
      return;
    }

    const effectiveCount = audienceType === 'specific' ? (selectedUserId ? 1 : 0) : (audienceCount || audienceList.length);

    if (effectiveCount === 0 && !channelPopup) {
      toast.error('Selected target audience has 0 customers. Please select a valid customer or audience segment.');
      return;
    }

    if (!window.confirm(`Launch campaign "${campaignName}" targeting ${effectiveCount} customer(s) via ${channels.join(', ')}?`)) {
      return;
    }

    setLaunching(true);
    try {
      const activeUid = selectedUserId || (allUsers.length > 0 ? allUsers[0]._id : '');
      const payload = {
        name: campaignName,
        audienceType,
        tier: targetTier,
        tag: targetTag,
        userId: activeUid,
        promoCode,
        discountType,
        discountValue,
        expiryDays,
        ctaLink,
        customMessage,
        channels
      };

      const { data } = await api.post('/api/admin/crm/retargeting/launch', payload);
      toast.success(data.message || 'Campaign launched successfully!');
      fetchHistory();
      setActiveTab('history');
    } catch (error) {
      console.error('Launch campaign error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to launch campaign');
    } finally {
      setLaunching(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Delete this retargeting campaign log?')) return;
    try {
      await api.delete(`/api/admin/crm/retargeting/history/${id}`);
      toast.success('Campaign log deleted');
      setHistory(history.filter(h => h._id !== id));
    } catch (e) {
      toast.error('Failed to delete log');
    }
  };

  const generateWhatsAppLink = (user) => {
    if (!user.phone) return null;
    const cleanPhone = user.phone.replace(/[^0-9]/g, '');
    const discountText = discountType === 'Percentage' ? `${discountValue}% OFF` : `Rs. ${discountValue} OFF`;
    const message = customMessage
      .replace('{name}', user.name)
      .replace('{code}', promoCode.toUpperCase())
      .replace('{discount}', discountText)
      .replace('{link}', `https://geniustailors.com${ctaLink}`);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <AdminLayout title="Customer Retargeting Hub">
      <div className="retargeting-dashboard" style={{ color: '#f8fafc' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#C9A96E', textTransform: 'uppercase', fontWeight: 600 }}>
              Genius Tailors Growth Engine
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0', color: '#ffffff' }}>
              🎯 Customer Retargeting Hub
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Full control over <strong>WHOM</strong> to retarget, <strong>WHAT</strong> offer to send, and <strong>HOW</strong> to deliver.
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#0F172A', padding: '0.35rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setActiveTab('builder')}
              style={{
                padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'builder' ? 'linear-gradient(135deg, #C9A96E 0%, #B89555 100%)' : 'transparent',
                color: activeTab === 'builder' ? '#0F172A' : '#94a3b8', transition: '0.2s'
              }}
            >
              🚀 Campaign Builder
            </button>
            <button 
              onClick={() => setActiveTab('quick')}
              style={{
                padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'quick' ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' : 'transparent',
                color: activeTab === 'quick' ? '#ffffff' : '#94a3b8', transition: '0.2s'
              }}
            >
              💬 WhatsApp Broadcast List
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{
                padding: '0.55rem 1.1rem', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'history' ? '#334155' : 'transparent',
                color: activeTab === 'history' ? '#ffffff' : '#94a3b8', transition: '0.2s'
              }}
            >
              Past Campaigns ({history.length})
            </button>
          </div>
        </div>

        {/* ── TAB 1: CAMPAIGN BUILDER (WHOM, WHAT, HOW) ── */}
        {activeTab === 'builder' && (
          <form onSubmit={handleLaunchCampaign} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="builder-grid">
            
            {/* LEFT COLUMN: WHOM & WHAT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* 1. WHOM TO RETARGET (AUDIENCE) */}
              <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#C9A96E', color: '#0F172A', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>1</span>
                    WHOM to Retarget (Audience Rules)
                  </h3>
                  <span style={{ background: '#0F172A', color: '#10B981', border: '1px solid #10B981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {loadingAudience ? 'Calculating...' : `Audience: ${audienceType === 'specific' ? (selectedUserId ? 1 : 0) : audienceCount} Customer${(audienceType === 'specific' ? (selectedUserId ? 1 : 0) : audienceCount) !== 1 ? 's' : ''}`}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Target Audience Segment</label>
                    <select 
                      value={audienceType} 
                      onChange={e => setAudienceType(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                    >
                      <option value="all">All Registered Customers</option>
                      <option value="tier">By Membership Tier (Bronze, Silver, Gold)</option>
                      <option value="tag">By Customer Tag (e.g. VIP, Prefers Shalwar)</option>
                      <option value="inactive">Inactive Customers (No orders in 30+ days)</option>
                      <option value="high_ltv">High-Value VIP Customers (LTV &gt; Rs. 5,000)</option>
                      <option value="specific">Single Specific Customer</option>
                    </select>
                  </div>

                  {/* Sub-Filters */}
                  {audienceType === 'tier' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Select Tier</label>
                      <select 
                        value={targetTier} 
                        onChange={e => setTargetTier(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                      >
                        <option value="Bronze">Bronze Tier Members</option>
                        <option value="Silver">Silver Tier Members</option>
                        <option value="Gold">Gold Tier Members</option>
                      </select>
                    </div>
                  )}

                  {audienceType === 'tag' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Tag Keyword</label>
                      <input 
                        type="text" 
                        placeholder="e.g. VIP or Prefers Shalwar" 
                        value={targetTag} 
                        onChange={e => setTargetTag(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  )}

                  {audienceType === 'specific' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Select Specific Customer</label>
                      <select 
                        value={selectedUserId} 
                        onChange={e => {
                          const newUid = e.target.value;
                          setSelectedUserId(newUid);
                          fetchAudiencePreview(newUid);
                        }}
                        style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                      >
                        <option value="">Select customer from database...</option>
                        {allUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.name} ({u.email || u.phone})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Audience Preview List Chips */}
                  {audienceList.length > 0 && (
                    <div style={{ background: '#0F172A', padding: '0.85rem', borderRadius: '8px', maxHeight: '120px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '0.4rem' }}>Matching Recipients Preview:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {audienceList.slice(0, 10).map(u => (
                          <span key={u._id} style={{ background: '#334155', color: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {u.name}
                          </span>
                        ))}
                        {audienceList.length > 10 && (
                          <span style={{ color: '#94A3B8', fontSize: '0.75rem', padding: '0.2rem' }}>+{audienceList.length - 10} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. WHAT TO RETARGET (OFFER BUILDER) */}
              <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#C9A96E', color: '#0F172A', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>2</span>
                  WHAT to Retarget (Campaign Offer & Text)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Campaign Name</label>
                    <input 
                      type="text" 
                      value={campaignName} 
                      onChange={e => setCampaignName(e.target.value)}
                      placeholder="e.g. Eid Return Special"
                      style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Promo Code</label>
                      <input 
                        type="text" 
                        value={promoCode} 
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#F59E0B', fontWeight: 700, outline: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Discount Type & Value</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select 
                          value={discountType} 
                          onChange={e => setDiscountType(e.target.value)}
                          style={{ padding: '0.65rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.85rem' }}
                        >
                          <option value="Percentage">% OFF</option>
                          <option value="Fixed">PKR (Rs.)</option>
                        </select>
                        <input 
                          type="number" 
                          value={discountValue} 
                          onChange={e => setDiscountValue(e.target.value)}
                          style={{ width: '100%', padding: '0.65rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Expiry (Days)</label>
                      <input 
                        type="number" 
                        value={expiryDays} 
                        onChange={e => setExpiryDays(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>CTA Destination URL</label>
                      <input 
                        type="text" 
                        value={ctaLink} 
                        onChange={e => setCtaLink(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 1rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>Personalized Message Template</label>
                    <textarea 
                      value={customMessage} 
                      onChange={e => setCustomMessage(e.target.value)}
                      rows={4}
                      style={{ width: '100%', padding: '0.85rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF', outline: 'none', fontSize: '0.85rem', lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '0.3rem' }}>
                      Available Variables: <code>{'{name}'}</code>, <code>{'{code}'}</code>, <code>{'{discount}'}</code>, <code>{'{link}'}</code>
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: HOW TO RETARGET & LAUNCH */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* 3. HOW TO RETARGET (CHANNELS) */}
              <div style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#C9A96E', color: '#0F172A', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>3</span>
                  HOW to Retarget (Execution Channels)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  
                  {/* Channel: Email */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#0F172A', border: channelEmail ? '1px solid #3B82F6' : '1px solid #334155', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}>
                    <input 
                      type="checkbox" 
                      checked={channelEmail} 
                      onChange={e => setChannelEmail(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: '#3B82F6' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>Automated Email Campaign</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>Sends formatted HTML promo email to customer's registered inbox.</div>
                    </div>
                  </label>

                  {/* Channel: WhatsApp */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#0F172A', border: channelWhatsapp ? '1px solid #25D366' : '1px solid #334155', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}>
                    <input 
                      type="checkbox" 
                      checked={channelWhatsapp} 
                      onChange={e => setChannelWhatsapp(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>WhatsApp Direct API Broadcast</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>Sends automated WhatsApp message to customer's mobile number.</div>
                    </div>
                  </label>

                  {/* Channel: In-App Popup Banner */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#0F172A', border: channelPopup ? '1px solid #F59E0B' : '1px solid #334155', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}>
                    <input 
                      type="checkbox" 
                      checked={channelPopup} 
                      onChange={e => setChannelPopup(e.target.checked)} 
                      style={{ width: '18px', height: '18px', accentColor: '#F59E0B' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>Live In-App Promotional Popup Banner</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>Creates an active promo modal banner for returning visitors on the website.</div>
                    </div>
                  </label>

                </div>

                {/* Launch Button */}
                <button 
                  type="submit"
                  disabled={launching}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #C9A96E 0%, #B89555 100%)', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 8px 20px rgba(201, 169, 110, 0.25)', transition: 'transform 0.2s'
                  }}
                >
                  {launching ? 'Launching Campaign...' : `🚀 Launch Retargeting Campaign (${audienceCount} Targets)`}
                </button>
              </div>

              {/* LIVE CAMPAIGN PREVIEW CARD */}
              <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', border: '1px solid #C9A96E', borderRadius: '16px', padding: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  📱 Message Output Preview
                </span>
                <div style={{ background: '#ffffff', color: '#0F172A', padding: '1.25rem', borderRadius: '12px', marginTop: '0.75rem', fontSize: '0.9rem', lineHeight: 1.6, borderLeft: '4px solid #C9A96E' }}>
                  {customMessage
                    .replace('{name}', 'Ahmed Khan')
                    .replace('{code}', promoCode.toUpperCase())
                    .replace('{discount}', discountType === 'Percentage' ? `${discountValue}% OFF` : `Rs. ${discountValue} OFF`)
                    .replace('{link}', `https://geniustailors.com${ctaLink}`)}
                </div>
              </div>

            </div>

          </form>
        )}

        {/* ── TAB 2: MANUAL WHATSAPP BROADCAST LIST ── */}
        {activeTab === 'quick' && (
          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#F8FAFC' }}>
              💬 One-Click WhatsApp Chat Generator
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              If API servers or rate limits prevent automated dispatch, use these pre-formatted direct WhatsApp Web/App links to send offers instantly from your phone or desktop.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {audienceList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No target customers found matching audience rules.</div>
              ) : (
                audienceList.map(user => {
                  const waUrl = generateWhatsAppLink(user);
                  return (
                    <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{user.phone || 'No Phone'} • {user.membershipLevel || 'Bronze'} Member</div>
                      </div>
                      {waUrl ? (
                        <a 
                          href={waUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ background: '#25D366', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          💬 Send WhatsApp Message
                        </a>
                      ) : (
                        <span style={{ color: '#EF4444', fontSize: '0.8rem', fontStyle: 'italic' }}>No Phone Number</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: PAST CAMPAIGNS HISTORY ── */}
        {activeTab === 'history' && (
          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: '#F8FAFC' }}>
              📊 Past Retargeting Campaigns Log
            </h3>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading history...</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>No retargeting campaigns launched yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 0' }}>Campaign Name</th>
                    <th style={{ padding: '0.75rem 0' }}>Target Audience</th>
                    <th style={{ padding: '0.75rem 0' }}>Promo Code</th>
                    <th style={{ padding: '0.75rem 0' }}>Reach</th>
                    <th style={{ padding: '0.75rem 0' }}>Channels Delivered</th>
                    <th style={{ padding: '0.75rem 0' }}>Date</th>
                    <th style={{ padding: '0.75rem 0' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 700, color: '#F8FAFC' }}>{c.name}</td>
                      <td style={{ padding: '1rem 0', color: '#CBD5E1', textTransform: 'capitalize' }}>{c.targetAudience}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ background: '#334155', color: '#F59E0B', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                          {c.promoCode}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0', fontWeight: 700, color: '#10B981' }}>{c.totalTargeted} Customers</td>
                      <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: '#94A3B8' }}>
                        {c.emailsSent > 0 && <div>✉️ Emails: {c.emailsSent}</div>}
                        {c.whatsappSent > 0 && <div>💬 WhatsApp: {c.whatsappSent}</div>}
                        {c.popupCreated && <div>🔔 Popup Active</div>}
                      </td>
                      <td style={{ padding: '1rem 0', color: '#64748B', fontSize: '0.85rem' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <button 
                          onClick={() => handleDeleteHistory(c._id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, fontSize: '1.1rem' }}
                          title="Delete Campaign Record"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
      <style>{`
        @media (max-width: 900px) {
          .builder-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

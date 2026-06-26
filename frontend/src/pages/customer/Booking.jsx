import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../api';
import toast from 'react-hot-toast';

import imgBanCollar from '../../assets/styles/ban_collar.jpg';
import imgShirtCollar from '../../assets/styles/shirt_collar.jpg';
import imgRoundNeck from '../../assets/styles/round_neck.png';

import imgOpenSleeves from '../../assets/styles/round_cuff.jpg';
import imgRoundSleeves from '../../assets/roundSleeves.jpeg';
import imgSingleCuff from '../../assets/styles/single_cuff.jpg';
import imgDoubleCuff from '../../assets/styles/double_cuff.jpg';

import imgSidePockets from '../../assets/styles/side_pockets.jpg';
import imgFrontSidePockets from '../../assets/styles/front_side_pockets.jpg';

import imgStandardShalwar from '../../assets/styles/standard_shalwar.png';
import imgStraightTrouser from '../../assets/styles/straight_trouser.png';
import imgNarrowPant from '../../assets/styles/narrow_pant.png';

import imgShalwarNoPocket from '../../assets/styles/shalwar_no_pocket.jpg';
import imgShalwarOnePocket from '../../assets/styles/shalwar_one_pocket.jpg';
import imgShalwarNoDesign from '../../assets/styles/shalwar_no_design.jpg';
import imgShalwarZigzag from '../../assets/styles/shalwar_zigzag.jpg';

import imgFabricOwn from '../../assets/fabrics/fabric_own.png';
import imgFabricCotton from '../../assets/fabrics/fabric_cotton.png';
import imgFabricWashWear from '../../assets/fabrics/fabric_wash_wear.png';
import imgFabricEgyptian from '../../assets/fabrics/fabric_egyptian.png';
import imgFabricSilk from '../../assets/fabrics/fabric_silk.png';

const SERVICES_PRICES = {
  'Kameez Shalwar': 2500,
  'Kurta Shalwar': 2000,
  'Kurta Pajama': 2000,
  'Waistcoat': 2000
};

const STYLE_CONFIGS = {
  'Kameez Shalwar': {
    collarTypes: [
      { name: 'Ban Collar', img: imgBanCollar, subs: ['0.9 inch', '0.75 inch', '1 inch', '1.25 inch'] },
      { name: 'Shirt Collar', img: imgShirtCollar, subs: ['2 inch notch', '2.25 inch notch', 'Arrow Collar'] }
    ],
    cuffs: [
      { name: 'Round Cuff', img: imgOpenSleeves, price: 0 },
      { name: 'Square Cuff', img: imgSingleCuff, price: 0 },
      { name: 'Double Cuff', img: imgDoubleCuff, price: 100 }
    ],
    pockets: [
      { name: '2 Side Pockets', img: imgSidePockets },
      { name: '1 Front and 2 Sides', img: imgFrontSidePockets }
    ],
    bottomPockets: [
      { name: 'No Pocket', img: imgShalwarNoPocket, price: 0 },
      { name: '1 Pocket', img: imgShalwarOnePocket, price: 100 }
    ],
    bottomDesigns: [
      { name: 'No Design', img: imgShalwarNoDesign, price: 0 },
      { name: 'Zigzag Stitch', img: imgShalwarZigzag, price: 200 }
    ]
  },
  'Kurta Shalwar': {
    collarTypes: [
      { name: 'Ban Collar', img: imgBanCollar, subs: ['0.9 inch', '0.75 inch', '1 inch', '1.25 inch'] }
    ],
    cuffs: [
      { name: 'Round Sleeves', img: imgRoundSleeves, price: 0 },
      { name: 'Square Cuff', img: imgSingleCuff, price: 0 }
    ],
    pockets: [
      { name: '2 Side Pockets', img: imgSidePockets },
      { name: '1 Front and 2 Sides', img: imgFrontSidePockets }
    ],
    bottomPockets: [
      { name: 'No Pocket', img: imgShalwarNoPocket, price: 0 },
      { name: '1 Pocket', img: imgShalwarOnePocket, price: 100 }
    ],
    bottomDesigns: [
      { name: 'No Design', img: imgShalwarNoDesign, price: 0 },
      { name: 'Zigzag Stitch', img: imgShalwarZigzag, price: 200 }
    ]
  },
  'Kurta Pajama': {
    collarTypes: [
      { name: 'Ban Collar', img: imgBanCollar, subs: ['0.9 inch', '0.75 inch', '1 inch', '1.25 inch'] }
    ],
    cuffs: [
      { name: 'Round Sleeves', img: imgRoundSleeves, price: 0 },
      { name: 'Square Cuff', img: imgSingleCuff, price: 0 }
    ],
    pockets: [
      { name: '2 Side Pockets', img: imgSidePockets }
    ],
    bottomPockets: [
      { name: 'No Pocket', img: imgShalwarNoPocket, price: 0 },
      { name: '1 Pocket', img: imgShalwarOnePocket, price: 100 }
    ],
    bottomDesigns: [
      { name: 'No Design', img: imgShalwarNoDesign, price: 0 },
      { name: 'Zigzag Stitch', img: imgShalwarZigzag, price: 200 }
    ]
  }
};

const FABRIC_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Navy Blue', hex: '#0f172a' },
  { name: 'Off-White', hex: '#f8fafc' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Charcoal Grey', hex: '#334155' },
  { name: 'Olive Green', hex: '#3f6212' },
  { name: 'Maroon', hex: '#7f1d1d' },
];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialService = searchParams.get('service') || 'Kameez Shalwar';
  
  const [step, setStep] = useState(1);
  const [serviceName, setServiceName] = useState(initialService);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [abandonedCartId, setAbandonedCartId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  useEffect(() => {
    setSelectedProfileId('');
  }, [serviceName]);
  
  // Customization State
  const [styleVariations, setStyleVariations] = useState({
    collar: 'Ban Collar',
    collarSub: '0.9 inch',
    cuff: 'Round Cuff',
    pockets: '2 Side Pockets',
    bottomPocket: 'No Pocket',
    bottomDesign: 'No Design'
  });

  // When service changes, reset variations to the new service's defaults
  useEffect(() => {
    const config = STYLE_CONFIGS[serviceName] || STYLE_CONFIGS['Kameez Shalwar'];
    setStyleVariations({
      collar: config.collarTypes[0].name,
      collarSub: config.collarTypes[0].subs[0],
      cuff: config.cuffs[0].name,
      pockets: config.pockets[0].name,
      bottomPocket: config.bottomPockets[0].name,
      bottomDesign: config.bottomDesigns[0].name
    });
  }, [serviceName]);
  
  const [dbFabrics, setDbFabrics] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const fabricList = [
    { name: 'Provide my own fabric', price: 0, desc: 'Drop off your unstitched fabric to our physical store within 3 days.', img: imgFabricOwn },
    ...dbFabrics
  ];

  const [selectedFabric, setSelectedFabric] = useState(fabricList[0]);
  const [selectedColor, setSelectedColor] = useState('');
  const [isRush, setIsRush] = useState(false);
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  
  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  const [operationalCities, setOperationalCities] = useState([]);
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, ordRes, userRes, citiesRes] = await Promise.all([
          api.get('/api/measurements').catch(() => ({ data: [] })),
          api.get('/api/orders/myorders').catch(() => ({ data: [] })),
          api.get('/api/profile').catch(() => ({ data: {} })),
          api.get('/api/shipping/cities').catch(() => ({ data: [] }))
        ]);
        if (profRes.data) setProfiles(profRes.data);
        if (ordRes.data && ordRes.data.length === 0) setHasDiscount(true);
        if (userRes.data) {
          if (userRes.data.loyaltyPoints) setUserPoints(userRes.data.loyaltyPoints);
          setUserInfo(userRes.data);
        }
        if (citiesRes.data) setOperationalCities(citiesRes.data);
        
        try {
          const fabRes = await api.get('/api/fabrics');
          setDbFabrics(fabRes.data);
        } catch (fabErr) {
          console.error('Warning: Could not fetch fabrics from database', fabErr);
        }

        try {
          const srvRes = await api.get('/api/services');
          setDbServices(srvRes.data);
        } catch (srvErr) {
          console.error('Warning: Could not fetch services from database', srvErr);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  const config = STYLE_CONFIGS[serviceName] || STYLE_CONFIGS['Kameez Shalwar'];
  
  // Calculate Extra Styling Charges
  let styleExtras = 0;
  const selectedCuff = config.cuffs.find(c => c.name === styleVariations.cuff);
  if (selectedCuff && selectedCuff.price) styleExtras += selectedCuff.price;
  
  const selectedBP = config.bottomPockets.find(b => b.name === styleVariations.bottomPocket);
  if (selectedBP && selectedBP.price) styleExtras += selectedBP.price;

  const selectedBD = config.bottomDesigns.find(b => b.name === styleVariations.bottomDesign);
  if (selectedBD && selectedBD.price) styleExtras += selectedBD.price;

  let basePrice = SERVICES_PRICES[serviceName] || 2500;
  if (dbServices && dbServices.length > 0) {
    const activeService = dbServices.find(s => 
      s.name && serviceName && s.name.toLowerCase().trim() === serviceName.toLowerCase().trim()
    );
    if (activeService && activeService.basePrice) {
      basePrice = activeService.basePrice;
    }
  }

  const discountAmount = hasDiscount ? (basePrice * 0.1) : 0;
  const subTotal = basePrice + styleExtras - discountAmount + (isRush ? 1000 : 0) + selectedFabric.price;
  const pointsDiscount = usePoints ? Math.min(userPoints, subTotal) : 0;
  const totalPrice = subTotal - pointsDiscount;

  // Track Checkout Drop-offs
  useEffect(() => {
    if (!userInfo) return;
    
    const stepNames = ['Measurement Profile', 'Fabric Selection', 'Styling Options', 'Final Summary & Checkout'];
    const currentStepName = stepNames[step - 1] || 'Checkout';
    const completed = stepNames.slice(0, step - 1);

    api.post('/api/abandoned-carts', {
      sessionId: abandonedCartId,
      customerId: userInfo._id,
      customerEmail: userInfo.email,
      customerPhone: userInfo.phone,
      customerName: userInfo.name,
      serviceName,
      totalPrice,
      dropoffStep: currentStepName,
      completedSteps: completed
    }).then(res => {
      if (!abandonedCartId && res.data._id) {
        setAbandonedCartId(res.data._id);
      }
    }).catch(err => console.error('Silent tracking error'));
    
  }, [step, serviceName, totalPrice, userInfo]);

  // Alert Admin when user reaches the final step (highest drop-off risk)
  useEffect(() => {
    if (step === 4 && abandonedCartId) {
      api.post(`/api/abandoned-carts/${abandonedCartId}/notify-admin`).catch(() => {});
    }
  }, [step, abandonedCartId]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const renderProfileIcon = (measurements) => {
    const keys = Object.keys(measurements || {});
    const isWaistcoat = keys.includes('Shoulders') && !keys.includes('Bottom (Pancha)');

    if (isWaistcoat) {
      // Waistcoat / Vest icon
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 22V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
          <path d="M4 12h16" />
          <path d="M9 6v2" />
          <path d="M15 6v2" />
        </svg>
      );
    }
    
    // Default / Shalwar Kameez (Shirt icon)
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
      </svg>
    );
  };

  const handlePlaceOrder = async () => {
    if (!selectedProfileId) return toast.error('Please select a measurement profile');
    if (selectedFabric.name !== 'Provide my own fabric' && !selectedColor) {
      return toast.error('Please select a fabric color');
    }
    
    const profile = profiles.find(p => p._id === selectedProfileId);
    if (!profile) return toast.error('Invalid profile selected');
    if (!deliveryCity) return toast.error('Please select a delivery city');
    if (!deliveryAddress || deliveryAddress.trim().length < 5) return toast.error('Please provide a complete delivery address');

    // Stop here and open the Payment Modal first
    setPaymentModalOpen(true);
  };

  const executePostExPaymentAndOrder = async () => {
    if (cardNumber.length < 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Processing secure PostEx payment...');
    
    // Simulate secure gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const advanceAmount = Math.ceil(totalPrice / 2);
    toast.success('Payment Successful! Confirming order...', { id: toastId });

    try {
      const profile = profiles.find(p => p._id === selectedProfileId);
      const payload = {
        serviceName,
        styleVariations,
        fabricSelection: selectedFabric.name,
        fabricColor: selectedColor,
        measurementSnapshot: {
          profileName: profile.profileName,
          measurements: profile.measurements || {}
        },
        totalPrice,
        pointsUsed: usePoints ? pointsDiscount : 0,
        deliveryCity,
        deliveryAddress,
        isRush,
        customerNote,
        advancePaid: advanceAmount,
        advancePaymentStatus: 'Paid'
      };

      const { data } = await api.post('/api/orders', payload);
      
      // If we were tracking this checkout session, mark it as recovered
      if (abandonedCartId) {
        api.put(`/api/abandoned-carts/${abandonedCartId}/recover`, { status: 'Recovered' }).catch(() => {});
      }

      setPaymentModalOpen(false);
      toast.success('Order placed successfully! 🎉');
      navigate(`/my-orders/${data._id || ''}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const keysStr = Object.keys(p.measurements || {}).join(' ').toLowerCase();
    
    // Check if it's a generic profile from older versions (has 'shoulders' but no specific garment name)
    const isOldGeneric = keysStr.includes('shoulders') && !keysStr.includes('kameez') && !keysStr.includes('kurta');
    const hasOldBottom = keysStr.includes('bottom (pancha)');
    
    if (serviceName === 'Waistcoat') {
      return keysStr.includes('waistcoat') || (isOldGeneric && !hasOldBottom);
    }
    
    if (serviceName === 'Kameez Shalwar') {
      return keysStr.includes('kameez') || keysStr.includes('shalwar') || hasOldBottom || isOldGeneric;
    }
    
    if (serviceName === 'Kurta Shalwar') {
      return keysStr.includes('kurta') || keysStr.includes('shalwar') || hasOldBottom || isOldGeneric;
    }
    
    if (serviceName === 'Kurta Pajama') {
      return keysStr.includes('kurta') || keysStr.includes('pajama') || hasOldBottom || isOldGeneric;
    }

    return true; // Fallback
  });

  return (
    <CustomerLayout title="Place New Order">
      <div className="booking-wizard">
        
        {/* Progress Bar */}
        <div className="wizard-progress">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Fit</div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Style</div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Details</div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Checkout</div>
        </div>

        {/* Step 1: Garment and Profile */}
        {step === 1 && (
          <div className="wizard-step luxury-card">
            <h2 className="step-title">What are we stitching for you?</h2>
            
            <div className="luxury-form-group">
              <label>Garment Service</label>
              <select value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="luxury-select">
                {Object.keys(SERVICES_PRICES).map(s => {
                  let displayPrice = SERVICES_PRICES[s];
                  if (dbServices && dbServices.length > 0) {
                    const activeSrv = dbServices.find(db => 
                      db.name && s && db.name.toLowerCase().trim() === s.toLowerCase().trim()
                    );
                    if (activeSrv && activeSrv.basePrice) {
                      displayPrice = activeSrv.basePrice;
                    }
                  }
                  return (
                    <option key={s} value={s}>{s} (Base: Rs. {displayPrice})</option>
                  );
                })}
              </select>
            </div>

            <h2 className="step-title" style={{ marginTop: '2rem' }}>Select Measurement Profile</h2>
            {filteredProfiles.length > 0 ? (
              <div className="minimal-profiles-list">
                {filteredProfiles.map(p => (
                  <label 
                    key={p._id} 
                    className={`minimal-profile-item ${selectedProfileId === p._id ? 'selected' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="measurementProfile" 
                      checked={selectedProfileId === p._id} 
                      onChange={() => setSelectedProfileId(p._id)} 
                    />
                    <div className="mp-icon-wrap">
                      {renderProfileIcon(p.measurements)}
                    </div>
                    <div className="mp-info">
                      <span className="mp-name">{p.profileName}</span>
                      <span className="mp-meta">{Object.keys(p.measurements || {}).length} saved measurements</span>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#faf9f6', borderRadius: '8px' }}>
                <p style={{ color: 'var(--stone)' }}>You do not have any saved profiles for {serviceName}.</p>
                <Link to="/measurements" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Create Profile</Link>
              </div>
            )}

            <div className="wizard-actions">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleNext} 
                disabled={!selectedProfileId}
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Customization (Visual Style Picks) */}
        {step === 2 && (
          <div className="wizard-step luxury-card">
            <h2 className="step-title">Customize Your Style</h2>
            <p style={{ color: 'var(--stone)', marginBottom: '2rem' }}>Select the specific tailoring details for your {serviceName}.</p>

            {/* Collar Options */}
            <div className="style-section">
              <h3>Collar Style</h3>
              <div className="style-grid" style={{ marginBottom: '1rem' }}>
                {config.collarTypes.map(opt => (
                  <div key={opt.name} className={`style-card ${styleVariations.collar === opt.name ? 'selected' : ''}`} 
                    onClick={() => setStyleVariations({...styleVariations, collar: opt.name, collarSub: opt.subs[0]})}
                  >
                    <img src={opt.img} alt={opt.name} className="style-img" />
                    <span>{opt.name}</span>
                  </div>
                ))}
              </div>
              
              {/* Collar Sub-option Dropdown */}
              {config.collarTypes.find(c => c.name === styleVariations.collar) && (
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--onyx)', marginBottom: '0.5rem' }}>
                    Select specific {styleVariations.collar} size/style:
                  </label>
                  <select 
                    value={styleVariations.collarSub} 
                    onChange={e => setStyleVariations({...styleVariations, collarSub: e.target.value})}
                    className="luxury-select"
                  >
                    {config.collarTypes.find(c => c.name === styleVariations.collar).subs.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Cuff Options */}
            <div className="style-section">
              <h3>Sleeve Cuffs</h3>
              <div className="style-grid">
                {config.cuffs.map(opt => (
                  <div key={opt.name} className={`style-card ${styleVariations.cuff === opt.name ? 'selected' : ''}`} 
                    onClick={() => setStyleVariations({...styleVariations, cuff: opt.name})}
                  >
                    <img src={opt.img} alt={opt.name} className="style-img" />
                    <span>{opt.name} {opt.price > 0 ? `(+Rs.${opt.price})` : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pockets */}
            <div className="style-section">
              <h3>{serviceName.includes('Kameez') ? 'Kameez Pockets' : serviceName.includes('Kurta') ? 'Kurta Pockets' : 'Shirt Pockets'}</h3>
              <div className="style-grid">
                {config.pockets.map(opt => (
                  <div key={opt.name} className={`style-card ${styleVariations.pockets === opt.name ? 'selected' : ''}`} 
                    onClick={() => setStyleVariations({...styleVariations, pockets: opt.name})}
                  >
                    <img src={opt.img} alt={opt.name} className="style-img" />
                    <span>{opt.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottoms Options (Pockets and Design) */}
            <div className="style-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ border: '1px solid var(--ivory-border)', padding: '1.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                <h3 style={{ marginTop: 0 }}>Bottom Pockets</h3>
                <div className="style-grid">
                  {config.bottomPockets.map(opt => (
                    <div key={opt.name} className={`style-card ${styleVariations.bottomPocket === opt.name ? 'selected' : ''}`} 
                      onClick={() => setStyleVariations({...styleVariations, bottomPocket: opt.name})}
                    >
                      <img src={opt.img} alt={opt.name} className="style-img" />
                      <span>{opt.name} {opt.price > 0 ? `(+Rs.${opt.price})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ border: '1px solid var(--ivory-border)', padding: '1.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                <h3 style={{ marginTop: 0 }}>Bottom Design</h3>
                <div className="style-grid">
                  {config.bottomDesigns.map(opt => (
                    <div key={opt.name} className={`style-card ${styleVariations.bottomDesign === opt.name ? 'selected' : ''}`} 
                      onClick={() => setStyleVariations({...styleVariations, bottomDesign: opt.name})}
                    >
                      <img src={opt.img} alt={opt.name} className="style-img" />
                      <span>{opt.name} {opt.price > 0 ? `(+Rs.${opt.price})` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="wizard-actions split">
              <button className="btn btn-outline btn-lg" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={handleNext}>Proceed to Details →</button>
            </div>
          </div>
        )}

        {/* Step 3: Details & Priority */}
        {step === 3 && (
          <div className="wizard-step luxury-card">
            <h2 className="step-title">Fabric & Order Preferences</h2>
            
            <div className="style-section" style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Fabric Selection</h3>
              <div className="fabric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {fabricList.map(opt => (
                  <div 
                    key={opt._id || opt.name} 
                    className={`fabric-card ${selectedFabric.name === opt.name ? 'selected' : ''}`}
                    onClick={() => { setSelectedFabric(opt); setSelectedColor(''); }}
                    style={{ 
                      border: selectedFabric.name === opt.name ? '2px solid var(--onyx)' : '1px solid #e2e8f0', 
                      borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                      boxShadow: selectedFabric.name === opt.name ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <div className="fabric-img-wrapper" style={{ height: '140px', overflow: 'hidden', background: '#f1f5f9' }}>
                      <img src={opt.imageUrl || opt.img} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="fabric-info" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--onyx)' }}>{opt.name}</h4>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: opt.price === 0 ? 'var(--stone)' : 'var(--primary)' }}>
                          {opt.price === 0 ? 'Free' : `+Rs. ${opt.price}`}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--stone)', fontSize: '0.85rem', lineHeight: 1.4 }}>{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedFabric.name !== 'Provide my own fabric' && (
                <div className="color-selection fade-in" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Select Fabric Color</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {(selectedFabric.colors && selectedFabric.colors.length > 0 ? selectedFabric.colors : FABRIC_COLORS).map(color => (
                      <label 
                        key={color.name} 
                        className="color-label"
                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <input type="radio" name="color" checked={selectedColor === color.name} onChange={() => setSelectedColor(color.name)} style={{ display: 'none' }} />
                        <div 
                          className="color-swatch" 
                          style={{ 
                            width: '45px', height: '45px', borderRadius: '50%', backgroundColor: color.hex, 
                            border: color.hex === '#ffffff' || color.hex === '#f8fafc' ? '1px solid #cbd5e1' : 'none',
                            boxShadow: selectedColor === color.name ? '0 0 0 3px white, 0 0 0 5px var(--onyx)' : '0 2px 5px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s',
                            transform: selectedColor === color.name ? 'scale(1.1)' : 'scale(1)'
                          }}
                        ></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: selectedColor === color.name ? '600' : '500', color: selectedColor === color.name ? 'var(--onyx)' : 'var(--stone)' }}>{color.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="luxury-form-group" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Shipping Details (via PostEx)</h3>
              
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--stone)' }}>City <span style={{color: 'red'}}>*</span></label>
              <select 
                className="luxury-input" 
                style={{ marginBottom: '1rem', width: '100%', appearance: 'auto' }}
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
              >
                <option value="">Select your city...</option>
                {operationalCities.map((city, idx) => (
                  <option key={idx} value={city.operationalCityName}>{city.operationalCityName}</option>
                ))}
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--stone)' }}>Complete Delivery Address <span style={{color: 'red'}}>*</span></label>
              <textarea 
                className="luxury-textarea" 
                rows="2"
                placeholder="House #, Street, Block, Area..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              ></textarea>
            </div>

            <div className="luxury-form-group">
              <label>Additional Design Notes (Optional)</label>
              <textarea 
                rows="4" 
                placeholder="e.g. Please make the collar extra stiff, or keep the fit slightly loose."
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="luxury-textarea"
              ></textarea>
            </div>

            <div className="priority-section">
              <h3 style={{ marginBottom: '1rem' }}>Delivery Speed</h3>
              <label className={`priority-card ${!isRush ? 'selected' : ''}`}>
                <input type="radio" name="rush" checked={!isRush} onChange={() => setIsRush(false)} />
                <div className="priority-info">
                  <h4>Standard Delivery</h4>
                  <p>5-7 working days. Included in base price.</p>
                </div>
              </label>

              <label className={`priority-card rush-card ${isRush ? 'selected' : ''}`}>
                <input type="radio" name="rush" checked={isRush} onChange={() => setIsRush(true)} />
                <div className="priority-info">
                  <h4>Expedited Rush ⚡</h4>
                  <p>2-3 working days. +Rs. 1,000 extra charge.</p>
                </div>
              </label>
            </div>

            <div className="wizard-actions split">
              <button className="btn btn-outline btn-lg" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={handleNext}>Proceed to Summary →</button>
            </div>
          </div>
        )}

        {/* Step 4: Summary & Place Order */}
        {step === 4 && (
          <div className="wizard-step luxury-card">
            <h2 className="step-title">Order Summary</h2>
            
            <div className="receipt-box">
              <div className="receipt-row">
                <span>{serviceName} (Base Stitching)</span>
                <span>Rs. {basePrice.toLocaleString()}</span>
              </div>
              <div className="receipt-row">
                <span>Fabric: {selectedFabric.name} {selectedColor ? `(${selectedColor})` : ''}</span>
                <span>{selectedFabric.price === 0 ? 'Customer Provided' : `Rs. ${selectedFabric.price.toLocaleString()}`}</span>
              </div>
              <div className="receipt-row">
                <span>Measurement Profile</span>
                <span>{profiles.find(p => p._id === selectedProfileId)?.profileName}</span>
              </div>
              
              <div className="receipt-divider"></div>
              <div style={{ padding: '0.5rem 0', color: 'var(--stone)' }}>
                <strong style={{ color: 'var(--onyx)', display: 'block', marginBottom: '0.5rem' }}>Style Preferences:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Collar: {styleVariations.collar} ({styleVariations.collarSub})</span>
                  <span>Cuffs: {styleVariations.cuff}</span>
                  <span>{serviceName.includes('Kameez') ? 'Kameez Pockets' : serviceName.includes('Kurta') ? 'Kurta Pockets' : 'Shirt Pockets'}: {styleVariations.pockets}</span>
                  <span>Bottom Pocket: {styleVariations.bottomPocket}</span>
                  <span>Bottom Design: {styleVariations.bottomDesign}</span>
                </div>
              </div>
              <div className="receipt-divider"></div>
              {styleExtras > 0 && (
                <div className="receipt-row" style={{ color: 'var(--gold)', fontWeight: 500 }}>
                  <span>Extra Styling Charges</span>
                  <span>+ Rs. {styleExtras.toLocaleString()}</span>
                </div>
              )}
              <div className="receipt-divider"></div>
              {hasDiscount && (
                <div className="receipt-row" style={{ color: '#16a34a', fontWeight: 500 }}>
                  <span>First Order Promo (10% Off)</span>
                  <span>- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              {isRush && (
                <div className="receipt-row rush-row">
                  <span>Expedited Rush Fee</span>
                  <span>Rs. 1,000</span>
                </div>
              )}
              {userPoints > 0 && (
                <div className="receipt-row" style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--stone)', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                    Use Loyalty Points ({userPoints} available = -Rs. {userPoints.toLocaleString()})
                  </label>
                </div>
              )}
              {usePoints && (
                <div className="receipt-row" style={{ color: '#16a34a', fontWeight: 500 }}>
                  <span>Loyalty Points Redeemed</span>
                  <span>- Rs. {pointsDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="receipt-divider"></div>
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
            )}
          </div>
        )}

      </div>

      <style>{`
        .booking-wizard {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .wizard-progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--ivory-border);
        }

        .step {
          font-weight: 500;
          color: var(--stone-light);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .step.active {
          color: var(--onyx);
          font-weight: 600;
        }

        .step-divider {
          flex: 1;
          height: 2px;
          background: var(--ivory-border);
          margin: 0 1rem;
        }

        .step-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--onyx);
        }

        .luxury-select, .luxury-textarea {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          background: var(--ivory);
          color: var(--onyx);
          font-family: var(--font-sans);
          outline: none;
        }

        .luxury-select:focus, .luxury-textarea:focus {
          border-color: var(--onyx);
          background: #ffffff;
        }

        .minimal-profiles-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .minimal-profile-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .minimal-profile-item:hover {
          border-color: var(--stone-light);
        }

        .minimal-profile-item.selected {
          border-color: var(--onyx);
          background: #faf9f6;
        }

        .minimal-profile-item input[type="radio"] {
          margin: 0;
          transform: scale(1.1);
          accent-color: var(--onyx);
        }

        .mp-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 8px;
          color: var(--stone);
          margin-left: 0.5rem;
        }

        .minimal-profile-item.selected .mp-icon-wrap {
          background: #e2e8f0;
          color: var(--onyx);
        }

        .mp-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .mp-name {
          font-weight: 500;
          font-size: 1.05rem;
          color: var(--onyx);
        }

        .mp-meta {
          font-size: 0.85rem;
          color: var(--stone);
        }

        .priority-section {
          margin-top: 2rem;
        }

        .priority-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          border: 2px solid var(--ivory-border);
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .priority-card input[type="radio"] {
          margin-top: 0.25rem;
          transform: scale(1.2);
        }

        .priority-card.selected {
          border-color: var(--onyx);
          background: #faf9f6;
        }

        .priority-card.rush-card.selected {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .priority-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
        }

        .priority-info p {
          margin: 0;
          color: var(--stone);
          font-size: 0.9rem;
        }

        /* Customization Styles */
        .style-section {
          margin-bottom: 2rem;
        }

        .style-section h3 {
          font-size: 1.1rem;
          color: var(--onyx);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .style-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .style-card {
          border: 2px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          display: flex;
          flex-direction: column;
        }

        .style-card:hover {
          border-color: var(--stone-light);
        }

        .style-card.selected {
          border-color: var(--onyx);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .style-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          object-position: center center;
          border-bottom: 1px solid var(--ivory-border);
        }

        .style-card span {
          padding: 0.75rem;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--onyx);
        }

        /* Receipt Box */
        .receipt-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          color: var(--onyx);
        }

        .rush-row {
          color: #ef4444;
        }

        .receipt-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 1rem 0;
        }

        .receipt-row.total {
          font-weight: 700;
          font-size: 1.25rem;
        }

        .wizard-actions {
          margin-top: 2.5rem;
          display: flex;
          justify-content: flex-end;
        }

        .wizard-actions.split {
          justify-content: space-between;
        }
      `}</style>
    </CustomerLayout>
  );
}

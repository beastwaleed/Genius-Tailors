import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import api from '../../api';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { SERVICE_FIELDS } from './Measurements';

import imgBanCollar from '../../assets/styles/ban_collar.jpg';
import imgShirtCollar from '../../assets/styles/shirt_collar.jpg';
import imgRoundNeck from '../../assets/styles/round_neck.png';
import jazzcashPaymentInfo from '../../assets/JazzcashPaymentInfo.jpeg';

import imgWaistcoatRound from '../../assets/round neck collar waistcoat.jpeg';
import imgWaistcoatV from '../../assets/V collar waistcoat.jpeg';
import imgWaistcoatSherwani from '../../assets/sherwani collar waistcoat.jpeg';

import imgOpenSleeves from '../../assets/styles/round_cuff.jpg';
import imgRoundSleeves from '../../assets/roundSleeves.jpeg';
import imgSingleCuff from '../../assets/styles/single_cuff.jpg';
import imgDoubleCuff from '../../assets/styles/double_cuff.jpg';

import roundCuffSK from '../../assets/roundCuffSK.jpeg';
import doubleCuffSK from '../../assets/doubleCuffSK.jpeg';
import shirtCollarSK from '../../assets/shirtCollarSK.jpeg';

import imgSidePockets from '../../assets/styles/side_pockets.jpg';
import imgFrontSidePockets from '../../assets/styles/front_side_pockets.jpg';

import imgStandardShalwar from '../../assets/styles/standard_shalwar.png';
import imgStraightTrouser from '../../assets/styles/straight_trouser.png';
import imgNarrowPant from '../../assets/styles/narrow_pant.png';

import imgShalwarNoPocket from '../../assets/styles/shalwar_no_pocket.jpg';
import imgShalwarOnePocket from '../../assets/styles/shalwar_one_pocket.jpg';
import imgShalwarNoDesign from '../../assets/styles/shalwar_no_design.jpg';
import imgShalwarZigzag from '../../assets/styles/shalwar_zigzag.jpg';

import imgFabricOwn from '../../assets/fabrics/courier_fabric.png';
import imgFabricCotton from '../../assets/fabrics/fabric_cotton.png';
import imgFabricWashWear from '../../assets/fabrics/fabric_wash_wear.png';
import imgFabricEgyptian from '../../assets/fabrics/fabric_egyptian.png';
import imgFabricSilk from '../../assets/fabrics/fabric_silk.png';

import xStitchMain from '../../assets/XStitchMain.jpeg';
import xStitch01 from '../../assets/XStitch01.jpeg';
import xStitch02 from '../../assets/XStitch02.jpeg';

import eliteAuraMain from '../../assets/EliteAuraMain.jpeg';
import eliteAura01 from '../../assets/EliteAura01.jpeg';
import eliteAura02 from '../../assets/EliteAura02.jpeg';
import eliteAura03 from '../../assets/EliteAura03.jpeg';

import tripleEdgeStitchMain from '../../assets/TripleEdgeStitchMain.jpeg';
import tripleEdgeStitch01 from '../../assets/TripleEdgeStitch01.jpg';
import tripleEdgeStitch02 from '../../assets/TripleEdgeStitch02.jpeg';


import royalSlateClassicMain from '../../assets/RoyalSlateClassicMain.jpeg';
import royalSlateClassic01 from '../../assets/RoyalSlateClassic01.jpeg';

import urbanCoreMain from '../../assets/UrbanCoreMain.jpeg';
import urbanCore01 from '../../assets/UrbanCore01.jpeg';
import urbanCore02 from '../../assets/UrbanCore02.jpeg';

import royalHeritageMain from '../../assets/RoyalHeritageMain.jpeg';
import royalHeritage01 from '../../assets/RoyalHeritage01.jpeg';
import royalHeritage02 from '../../assets/RoyalHeritage02.jpeg';

import deltaFitMain from '../../assets/DeltaFitMain.jpeg';
import deltaFit01 from '../../assets/DeltaFit01.jpeg';
import deltaFit02 from '../../assets/DeltaFit02.jpeg';

import angularEdgeMain from '../../assets/AngularEdgeMain.jpeg';
import angularEdge01 from '../../assets/AngularEdge01.jpeg';
import angularEdge02 from '../../assets/AngularEdge02.jpeg';

const SERVICES_PRICES = {
  'Kameez Shalwar': 1800,
  'Kurta Shalwar': 1800,
  'Kurta Pajama': 2000,
  'Waistcoat': 3500,
  'Kameez Shalwar Design': 2200,
  'Kurta Shalwar Design': 2200,
  'Zardari Suit': 5300,
  'Shirt': 1200
};

const STYLE_CONFIGS = {
  'Kameez Shalwar': {
    collarTypes: [
      { name: 'Ban Collar', img: imgBanCollar, subs: ['0.9 inch', '0.75 inch', '1 inch', '1.25 inch'] },
      { name: 'Shirt Collar', img: shirtCollarSK, subs: ['2 inch', '2.25 inch', '2.5 inch', 'arrow collar(1.75 inch)'] }
    ],
    cuffs: [
      { name: 'Round Cuff', img: roundCuffSK, price: 0 },
      { name: 'Square Cuff', img: imgSingleCuff, price: 0 },
      { name: 'Double Cuff', img: doubleCuffSK, price: 0 }
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
  },
  'Waistcoat': {
    collarTypes: [
      { name: 'Sherwani Collar', img: imgWaistcoatSherwani, subs: [] },
      { name: 'V Collar', img: imgWaistcoatV, subs: [] },
      { name: 'Round Neck Collar', img: imgWaistcoatRound, subs: [] }
    ],
    cuffs: [],
    pockets: [],
    bottomPockets: [],
    bottomDesigns: []
  },
  'Kameez Shalwar Design': {
    designs: [
      { name: "'X-Stitch' Classic", img: xStitchMain, price: 2200, gallery: [xStitchMain, xStitch01, xStitch02] },
      { name: 'Elite Aura Premium', img: eliteAuraMain, price: 2500, gallery: [eliteAuraMain, eliteAura01, eliteAura02, eliteAura03] },
      { name: 'Triple Edge Stitch', img: tripleEdgeStitchMain, price: 2500, gallery: [tripleEdgeStitchMain, tripleEdgeStitch01, tripleEdgeStitch02] }
    ]
  },
  'Kurta Shalwar Design': {
    designs: [
      { name: 'Royal Heritage', img: royalHeritageMain, price: 2500, gallery: [royalHeritageMain, royalHeritage01, royalHeritage02] },
      { name: 'Delta Fit', img: deltaFitMain, price: 2200, gallery: [deltaFitMain, deltaFit01, deltaFit02] },
      { name: 'Angular Edge', img: angularEdgeMain, price: 2500, gallery: [angularEdgeMain, angularEdge01, angularEdge02] }
    ]
  },
  'Zardari Suit': {
    designs: [
      { name: 'Royal Slate Classic', img: royalSlateClassicMain, price: 5500, gallery: [royalSlateClassicMain, royalSlateClassic01] },
      { name: 'Urban Core', img: urbanCoreMain, price: 5300, gallery: [urbanCoreMain, urbanCore01, urbanCore02] }
    ]
  },
  'Shirt': {
    collarTypes: [
      { name: 'Normal Style', img: shirtCollarSK, subs: ['2.5 inch'] },
      { name: 'Arrow Collar', img: shirtCollarSK, subs: ['2.5 notch'] }
    ],
    cuffs: [
      { name: 'Square Cuff', img: imgSingleCuff, price: 0 },
      { name: 'Double Cuff', img: doubleCuffSK, price: 0 }
    ],
    pockets: [
      { name: '1 Pocket', img: imgFrontSidePockets },
      { name: 'No Pocket', img: imgSidePockets }
    ],
    bottomPockets: [],
    bottomDesigns: [
      { name: 'Round Bottom', img: imgShalwarNoDesign, price: 0 },
      { name: 'Square with Side Chalk', img: imgShalwarNoDesign, price: 0 }
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
  
  // Scroll to top whenever step changes
  useEffect(() => {
    const workspace = document.querySelector('.luxury-workspace');
    if (workspace) {
      workspace.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [step]);

  const [serviceName, setServiceName] = useState(initialService);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [abandonedCartId, setAbandonedCartId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const orderPlacedRef = useRef(false);
  const [garmentsList, setGarmentsList] = useState([]);

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
    bottomDesign: 'No Design',
    design: ''
  });

  // When service changes, reset variations to the new service's defaults
  useEffect(() => {
    const config = STYLE_CONFIGS[serviceName] || STYLE_CONFIGS['Kameez Shalwar'];
    setStyleVariations({
      collar: config.collarTypes?.length > 0 ? config.collarTypes[0].name : '',
      collarSub: config.collarTypes?.length > 0 && config.collarTypes[0].subs?.length > 0 ? config.collarTypes[0].subs[0] : '',
      cuff: config.cuffs?.length > 0 ? config.cuffs[0].name : '',
      pockets: config.pockets?.length > 0 ? config.pockets[0].name : '',
      bottomPocket: config.bottomPockets?.length > 0 ? config.bottomPockets[0].name : '',
      bottomDesign: config.bottomDesigns?.length > 0 ? config.bottomDesigns[0].name : '',
      design: ''
    });
  }, [serviceName]);

  const [dbFabrics, setDbFabrics] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const filteredDbFabrics = dbFabrics.filter(f => !f.allowedServices || f.allowedServices.length === 0 || f.allowedServices.includes(serviceName));
  const fabricList = [
    { name: 'Provide my own fabric', price: 0, desc: 'Send your unstitched fabric to us through a courier service within 3 days.', img: imgFabricOwn },
    ...filteredDbFabrics
  ];

  const [selectedFabric, setSelectedFabric] = useState(fabricList[0]);
  const [viewingFabric, setViewingFabric] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [isRush, setIsRush] = useState(false);
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [bankTransferModalOpen, setBankTransferModalOpen] = useState(false);
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer');

  const [selectedDesignModal, setSelectedDesignModal] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [operationalCities, setOperationalCities] = useState([]);
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Inline Measurement State
  const [inlineMeasurementModalOpen, setInlineMeasurementModalOpen] = useState(false);
  const [inlineMeasurements, setInlineMeasurements] = useState({});
  const [inlineProfileName, setInlineProfileName] = useState('');
  const [savingInlineProfile, setSavingInlineProfile] = useState(false);
  const [inlineServiceKey, setInlineServiceKey] = useState('Kameez Shalwar');

  const getMeasurementServiceKey = (srv) => {
    if (!srv) return 'Kameez Shalwar';
    if (srv.includes('Kameez Shalwar')) return 'Kameez Shalwar';
    if (srv.includes('Kurta Shalwar')) return 'Kurta Shalwar';
    if (srv.includes('Kurta Pajama')) return 'Kurta Pajama';
    if (srv.includes('Waistcoat')) return 'Waistcoat';
    if (srv.includes('Shirt')) return 'Shirt';
    return 'Kameez Shalwar';
  };

  const handleOpenInlineMeasurement = () => {
    const mappedKey = getMeasurementServiceKey(serviceName);
    setInlineServiceKey(mappedKey);
    const config = SERVICE_FIELDS[mappedKey] || SERVICE_FIELDS['Kameez Shalwar'];
    const initial = {};
    if (config.top) config.top.fields.forEach(f => initial[`${config.top.label} ${f}`] = '');
    if (config.bottom) config.bottom.fields.forEach(f => initial[`${config.bottom.label} ${f}`] = '');
    if (config.outer) config.outer.fields.forEach(f => initial[`${config.outer.label} ${f}`] = '');
    
    setInlineMeasurements(initial);
    setInlineProfileName(`${serviceName} - ${new Date().toLocaleDateString().replace(/\//g, '-')}`);
    setInlineMeasurementModalOpen(true);
  };

  const handleSaveInlineProfile = async (e) => {
    e.preventDefault();
    if (!inlineProfileName.trim()) return toast.error('Please enter a profile name');
    
    // Filter empty
    const filteredMeasurements = Object.fromEntries(
      Object.entries(inlineMeasurements).filter(([_, v]) => v.trim() !== '')
    );
    if (Object.keys(filteredMeasurements).length === 0) {
      return toast.error('Please provide at least one measurement');
    }

    setSavingInlineProfile(true);
    const toastId = toast.loading('Saving measurement profile...');
    try {
      const { data } = await api.post('/api/measurements', {
        profileName: inlineProfileName,
        measurements: filteredMeasurements
      });
      setProfiles([...profiles, data]);
      setSelectedProfileId(data._id);
      setInlineMeasurementModalOpen(false);
      toast.success('Measurement profile saved and selected!', { id: toastId });
    } catch (error) {
      toast.error('Failed to save measurement profile', { id: toastId });
    } finally {
      setSavingInlineProfile(false);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      // 1. Fetch Measurement Profiles First (Critical path for Step 1 UI)
      api.get('/api/measurements').then(res => {
        if (res.data) setProfiles(res.data);
      }).catch(error => {
        console.error('Failed to fetch profiles', error);
      }).finally(() => {
        setIsFetchingData(false);
      });

      // 2. Fetch User Info & Cities together to handle default city selection smoothly
      api.get('/api/profile').then(userRes => {
        const userData = userRes.data;
        if (userData) {
          if (userData.loyaltyPoints) setUserPoints(userData.loyaltyPoints);

          api.get('/api/shipping/cities').then(citiesRes => {
            if (citiesRes.data) {
              setOperationalCities(citiesRes.data);
              if (!userData.location?.city && citiesRes.data.length > 0) {
                setDeliveryCity(citiesRes.data[0].operationalCityName);
              } else if (userData.location?.city) {
                setDeliveryCity(userData.location.city);
              }
            }
            if (userData.location?.street) setDeliveryAddress(userData.location.street);
            setUserInfo(userData);
          }).catch(console.error);
        }
      }).catch(console.error);

      // 3. Fetch Orders (for discount logic)
      api.get('/api/orders/myorders').then(ordRes => {
        if (ordRes.data && ordRes.data.length === 0) setHasDiscount(true);
      }).catch(console.error);

      // 4. Fetch Fabrics (for step 2)
      api.get('/api/fabrics').then(fabRes => {
        if (fabRes.data) setDbFabrics(fabRes.data);
      }).catch(console.error);

      // 5. Fetch Services
      api.get('/api/services').then(srvRes => {
        if (srvRes.data) setDbServices(srvRes.data);
      }).catch(console.error);
    };
    fetchData();
  }, []);

  const config = STYLE_CONFIGS[serviceName] || STYLE_CONFIGS['Kameez Shalwar'];

  let basePrice = SERVICES_PRICES[serviceName] || 2500;
  if (dbServices && dbServices.length > 0) {
    const activeService = dbServices.find(s =>
      s.name && serviceName && s.name.toLowerCase().trim() === serviceName.toLowerCase().trim()
    );
    if (activeService && activeService.basePrice) {
      basePrice = activeService.basePrice;
    }
  }

  // Calculate Extra Styling Charges
  let styleExtras = 0;
  if (config.designs && config.designs.length > 0) {
    const selectedDesign = config.designs.find(d => d.name === styleVariations.design);
    if (selectedDesign && selectedDesign.price) {
      basePrice = selectedDesign.price;
    }
  } else {
    if (config.cuffs && config.cuffs.length > 0) {
      const selectedCuff = config.cuffs.find(c => c.name === styleVariations.cuff);
      if (selectedCuff && selectedCuff.price) styleExtras += selectedCuff.price;
    }

    if (config.bottomPockets && config.bottomPockets.length > 0) {
      const selectedBP = config.bottomPockets.find(b => b.name === styleVariations.bottomPocket);
      if (selectedBP && selectedBP.price) styleExtras += selectedBP.price;
    }

    if (config.bottomDesigns && config.bottomDesigns.length > 0) {
      const selectedBD = config.bottomDesigns.find(b => b.name === styleVariations.bottomDesign);
      if (selectedBD && selectedBD.price) styleExtras += selectedBD.price;
    }
  }

  const isZardariSuit = serviceName === 'Zardari Suit';
  const effectiveFabricPrice = isZardariSuit ? Math.round((selectedFabric.price / 4) * 5) : selectedFabric.price;
  
  const currentGarmentSubTotal = basePrice + styleExtras + effectiveFabricPrice;
  const listSubTotal = garmentsList.reduce((sum, g) => sum + g.basePrice + g.styleExtras + g.effectiveFabricPrice, 0);
  const allGarmentsSubTotal = listSubTotal + currentGarmentSubTotal;

  const discountAmount = hasDiscount ? (allGarmentsSubTotal * 0.1) : 0;
  const deliveryCharge = 250;

  const subTotal = allGarmentsSubTotal - discountAmount + (isRush ? 1000 : 0) + deliveryCharge;
  const pointsDiscount = usePoints ? Math.min(userPoints, subTotal) : 0;
  
  let promoDiscountAmt = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'Percentage') {
      promoDiscountAmt = Math.round((subTotal - pointsDiscount) * (appliedPromo.discountValue / 100));
    } else {
      promoDiscountAmt = appliedPromo.discountValue;
    }
  }

  const totalPrice = Math.max(subTotal - pointsDiscount - promoDiscountAmt, 0);

  let calculatedAdvance = 0;
  garmentsList.forEach(g => {
    calculatedAdvance += g.fabricSelection.name === 'Provide my own fabric' 
      ? Math.ceil((g.basePrice + g.styleExtras) / 2) 
      : Math.max(g.effectiveFabricPrice, Math.ceil((g.basePrice + g.styleExtras + g.effectiveFabricPrice) / 2));
  });

  const isOwnFabric = selectedFabric.name === 'Provide my own fabric';
  const isAllOwnFabric = isOwnFabric && garmentsList.every(g => g.fabricSelection.name === 'Provide my own fabric');
  const currentCalculatedAdvance = isOwnFabric
    ? Math.ceil(currentGarmentSubTotal / 2)
    : Math.max(effectiveFabricPrice, Math.ceil(currentGarmentSubTotal / 2));
    
  calculatedAdvance += currentCalculatedAdvance;
  const advanceAmount = Math.min(calculatedAdvance, Math.max(totalPrice, 0));

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

  // Alert Admin on unload / unmount if not recovered
  useEffect(() => {
    const notifyAdmin = () => {
      if (abandonedCartId && !orderPlacedRef.current) {
        const token = localStorage.getItem('token');
        const baseURL = api.defaults.baseURL || '';
        fetch(`${baseURL}/api/abandoned-carts/${abandonedCartId}/notify-admin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          keepalive: true
        }).catch(() => { });
      }
    };

    window.addEventListener('beforeunload', notifyAdmin);
    return () => {
      window.removeEventListener('beforeunload', notifyAdmin);
      notifyAdmin();
    };
  }, [abandonedCartId]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const validatePromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    setPromoLoading(true);
    setPromoError('');
    try {
      const { data } = await api.post('/api/promos/validate', {
        code: promoCodeInput.trim(),
        cartTotal: allGarmentsSubTotal + deliveryCharge
      });
      setAppliedPromo(data);
      setPromoCodeInput('');
      toast.success('Promo code applied successfully!');
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleAddAnother = () => {
    if (selectedFabric.name !== 'Provide my own fabric' && !selectedColor) {
      toast.error('Please select a color for your fabric');
      return;
    }
    
    setGarmentsList([...garmentsList, {
      serviceName,
      styleVariations: { ...styleVariations },
      fabricSelection: selectedFabric,
      fabricColor: selectedColor,
      basePrice,
      styleExtras,
      effectiveFabricPrice
    }]);

    const conf = STYLE_CONFIGS[serviceName] || STYLE_CONFIGS['Kameez Shalwar'];
    setStyleVariations({
      collar: conf.collarTypes?.length > 0 ? conf.collarTypes[0].name : '',
      collarSub: conf.collarTypes?.length > 0 && conf.collarTypes[0].subs?.length > 0 ? conf.collarTypes[0].subs[0] : '',
      cuff: conf.cuffs?.length > 0 ? conf.cuffs[0].name : '',
      pockets: conf.pockets?.length > 0 ? conf.pockets[0].name : '',
      bottomPocket: conf.bottomPockets?.length > 0 ? conf.bottomPockets[0].name : '',
      bottomDesign: conf.bottomDesigns?.length > 0 ? conf.bottomDesigns[0].name : '',
      design: ''
    });
    setSelectedFabric(fabricList[0]);
    setSelectedColor('');
    
    toast.success('Garment saved to cart! Configure the next one.');
    setStep(2); 
  };

  const handleProceedToDetails = () => {
    if (selectedFabric.name !== 'Provide my own fabric' && !selectedColor) {
      toast.error('Please select a color for your fabric');
      return;
    }
    setStep(4);
  };

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

    if (isAllOwnFabric && paymentMethod === 'COD') {
      executeBankTransferOrder(true);
    } else {
      setBankTransferModalOpen(true);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              resolve(file); // Fallback to original if compression fails
            }
          }, 'image/jpeg', 0.6); // 60% quality is plenty for a receipt
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const toastId = toast.loading('Processing & uploading receipt...');
    
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedFile);

      const { data } = await api.post('/api/upload/reference-image', formData);
      setPaymentReceiptUrl(data.url);
      toast.success('Receipt uploaded successfully!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload receipt. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const executeBankTransferOrder = async (isCod = false) => {
    if (isCod !== true && !paymentReceiptUrl) {
      return toast.error('Please upload your payment receipt to confirm the order');
    }

    setLoading(true);
    const toastId = toast.loading('Confirming your order(s)...');

    try {
      const profile = profiles.find(p => p._id === selectedProfileId);
      
      const allGarmentsToOrder = [...garmentsList, {
        serviceName,
        styleVariations,
        fabricSelection: selectedFabric,
        fabricColor: selectedColor,
        basePrice,
        styleExtras,
        effectiveFabricPrice,
        paymentReceiptUrl: isCod === true ? '' : paymentReceiptUrl,
        pointsUsed: usePoints ? Math.min(userPoints, subTotal) : 0,
        promoCode: appliedPromo ? appliedPromo.code : null,
        promoDiscount: promoDiscountAmt
      }];

      let remainingAdvance = isCod === true ? 0 : advanceAmount;

      for (let i = 0; i < allGarmentsToOrder.length; i++) {
        const g = allGarmentsToOrder[i];
        
        let gTotalPrice = g.basePrice + g.styleExtras + g.effectiveFabricPrice;
        if (i === 0) {
           gTotalPrice += deliveryCharge;
           if (isRush) gTotalPrice += 1000;
           gTotalPrice -= discountAmount;
           gTotalPrice -= pointsDiscount;
           gTotalPrice -= promoDiscountAmt;
        }

        const appliedAdvance = Math.min(gTotalPrice, remainingAdvance);
        remainingAdvance -= appliedAdvance;

        const payload = {
          serviceName: g.serviceName,
          styleVariations: g.styleVariations,
          fabricSelection: g.fabricSelection.name,
          fabricColor: g.fabricColor,
          fabricImageUrl: g.fabricColor ? g.fabricSelection.colors?.find(c => c.name === g.fabricColor)?.imageUrl : g.fabricSelection.imageUrl || g.fabricSelection.img || '',
          measurementSnapshot: {
            profileName: profile.profileName,
            measurements: profile.measurements || {}
          },
          totalPrice: gTotalPrice,
          pointsUsed: i === 0 && usePoints ? pointsDiscount : 0,
          deliveryCity,
          deliveryAddress,
          isRush: i === 0 ? isRush : false,
          promoCode: i === 0 && appliedPromo ? appliedPromo.code : null,
          promoDiscount: i === 0 ? promoDiscountAmt : 0,
          customerNote,
          advancePaid: appliedAdvance,
          advancePaymentStatus: isCod === true ? 'COD' : 'Pending',
          paymentReceiptUrl: isCod === true ? '' : paymentReceiptUrl
        };

        await api.post('/api/orders', payload);
      }

      orderPlacedRef.current = true;

      if (abandonedCartId) {
        api.put(`/api/abandoned-carts/${abandonedCartId}/recover`, { status: 'Recovered' }).catch(() => { });
      }

      setBankTransferModalOpen(false);
      toast.success(isCod === true ? 'Orders placed successfully!' : 'Orders placed successfully! Please complete your transfer.', { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const keysStr = Object.keys(p.measurements || {}).join(' ').toLowerCase();

    // Check if it's a generic profile from older versions (has 'shoulders' but no specific garment name)
    const isOldGeneric = keysStr.includes('shoulders') && !keysStr.includes('kameez') && !keysStr.includes('kurta');
    const hasOldBottom = keysStr.includes('bottom (pancha)');
    const hasWaistcoat = keysStr.includes('waistcoat');

    if (serviceName === 'Zardari Suit') {
      return keysStr.includes('zardari') || (hasWaistcoat && (keysStr.includes('kameez') || keysStr.includes('kurta') || isOldGeneric));
    }

    if (serviceName === 'Waistcoat') {
      return (hasWaistcoat && !keysStr.includes('kameez') && !keysStr.includes('kurta')) || (isOldGeneric && !hasOldBottom);
    }

    if (serviceName === 'Kameez Shalwar') {
      return (keysStr.includes('kameez') || keysStr.includes('shalwar') || hasOldBottom || isOldGeneric) && !hasWaistcoat;
    }

    if (serviceName === 'Kurta Shalwar') {
      return (keysStr.includes('kurta') || keysStr.includes('shalwar') || hasOldBottom || isOldGeneric) && !hasWaistcoat;
    }

    if (serviceName === 'Kurta Pajama') {
      return (keysStr.includes('kurta') || keysStr.includes('pajama') || hasOldBottom || isOldGeneric) && !hasWaistcoat;
    }

    if (serviceName === 'Shirt') {
      return (keysStr.includes('shirt') || isOldGeneric) && !hasWaistcoat && !hasOldBottom;
    }

    return true; // Fallback
  });

  return (
    <>
      <Helmet>
        <title>Custom Stitching Shalwar Kameez Online | Genius Tailors</title>
        <meta name="description" content="Experience the finest online tailor in Pakistan. Get bespoke custom stitching for kurta shalwar delivered right to your doorstep. Submit your measurements!" />
      </Helmet>
      <CustomerLayout title="Place New Order">
        <div className="booking-wizard">

          {/* Progress Bar */}
          <div className="wizard-progress">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">Fit</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">Style</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">Fabric</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
              <span className="step-num">4</span>
              <span className="step-label">Details</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step >= 5 ? 'active' : ''}`}>
              <span className="step-num">5</span>
              <span className="step-label">Checkout</span>
            </div>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className="step-title" style={{ margin: 0 }}>Select Measurement Profile</h2>
                <button type="button" onClick={handleOpenInlineMeasurement} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-plus"></i> New Profile
                </button>
              </div>
              {isFetchingData ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#faf9f6', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--stone)' }}>Loading measurement profiles...</p>
                </div>
              ) : filteredProfiles.length > 0 ? (
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
                  <button type="button" onClick={handleOpenInlineMeasurement} className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Create Profile</button>
                </div>
              )}

              <div className="wizard-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleNext}
                  disabled={!selectedProfileId}
                >
                  Proceed to Style →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Fabric Selection */}
          {step === 3 && (
            <div className="wizard-step luxury-card">
              <h2 className="step-title">Fabric Selection</h2>
              <p style={{ color: 'var(--stone)', marginBottom: '2rem' }}>Choose your preferred fabric or provide your own.</p>

              <div className="style-section" style={{ marginBottom: '2rem' }}>
                <div className="fabric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  {fabricList.map(opt => (
                    <div
                      key={opt._id || opt.name}
                      className={`fabric-card ${selectedFabric.name === opt.name ? 'selected' : ''}`}
                      onClick={() => {
                        if (opt.name === 'Provide my own fabric') {
                          setSelectedFabric(opt);
                          setSelectedColor('');
                        } else {
                          setViewingFabric(opt);
                          if (!selectedColor || selectedFabric.name !== opt.name) {
                            setSelectedColor('Shade No 01');
                          }
                        }
                      }}
                      style={{
                        border: selectedFabric.name === opt.name ? '2px solid var(--onyx)' : '1px solid #e2e8f0',
                        borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                        boxShadow: selectedFabric.name === opt.name ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div className="fabric-img-wrapper" style={{ height: '220px', overflow: 'hidden', background: '#f1f5f9' }}>
                        <img src={opt.imageUrl || opt.img} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="fabric-info" style={{ padding: '1rem', textAlign: 'center' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--onyx)' }}>{opt.name}</h4>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: opt.price === 0 ? 'var(--stone)' : 'var(--primary)' }}>
                          {opt.price === 0 ? 'Free' : `+Rs. ${opt.price}`}
                        </span>
                      </div>
                      {selectedFabric.name === opt.name && selectedFabric.name !== 'Provide my own fabric' && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--onyx)', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>

                {viewingFabric && (
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setViewingFabric(null)}>
                    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', width: '100%', maxWidth: '1100px', display: 'flex', maxHeight: '95vh', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }} onClick={e => e.stopPropagation()}>
                      <div style={{ flex: 1.3, position: 'relative', minHeight: window.innerWidth < 768 ? '350px' : '550px', background: '#f1f5f9' }}>
                        <img
                          src={viewingFabric.colors?.find(c => c.name === selectedColor)?.imageUrl || viewingFabric.imageUrl || viewingFabric.img}
                          alt={viewingFabric.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, transition: 'opacity 0.3s ease-in-out' }}
                        />
                      </div>
                      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--onyx)', margin: 0, fontFamily: 'var(--font-serif)' }}>{viewingFabric.name}</h2>
                          <button onClick={() => setViewingFabric(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>&times;</button>
                        </div>
                        <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '1.5rem' }}>Rs. {viewingFabric.price}</p>
                        {viewingFabric.desc && <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>{viewingFabric.desc}</p>}

                        <div style={{ marginBottom: '2rem' }}>
                          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--onyx)', fontWeight: '600' }}>Color: <span style={{ fontWeight: 'normal', color: '#64748b' }}>{selectedColor}</span></h3>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {[
                              ...(viewingFabric.colors?.some(c => c.name === 'Shade No 01') ? [] : [{ name: 'Shade No 01', hex: '#e2e8f0', imageUrl: viewingFabric.imageUrl || viewingFabric.img }]),
                              ...(viewingFabric.colors || [])
                            ].map(color => (
                              <label
                                key={color.name}
                                className="color-label"
                                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <input type="radio" name="modal-color" checked={selectedColor === color.name} onChange={() => setSelectedColor(color.name)} style={{ display: 'none' }} />
                                <div
                                  style={{
                                    width: '45px', height: '45px', borderRadius: '4px', backgroundColor: color.hex,
                                    backgroundImage: color.imageUrl ? `url(${color.imageUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: color.hex === '#ffffff' || color.hex === '#f8fafc' ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                                    outline: selectedColor === color.name ? '2px solid var(--onyx)' : 'none',
                                    outlineOffset: '2px',
                                    transition: 'all 0.2s',
                                    transform: selectedColor === color.name ? 'scale(1.05)' : 'scale(1)'
                                  }}
                                  title={color.name}
                                ></div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem', background: 'var(--onyx)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedFabric(viewingFabric);
                              if (!selectedColor) {
                                setSelectedColor('Shade No 01');
                              }
                              setViewingFabric(null);
                            }}
                          >
                            Confirm Fabric
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="wizard-actions split">
                <button className="btn btn-outline btn-lg" onClick={handleBack}>← Back</button>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline btn-lg btn-add-garment" onClick={handleAddAnother}>Add Another Garment</button>
                  <button className="btn btn-primary btn-lg" onClick={handleProceedToDetails}>Proceed to Details →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customization (Visual Style Picks) */}
          {step === 2 && (
            <div className="wizard-step luxury-card">
              <h2 className="step-title">{config.designs ? 'Select Your Design' : 'Customize Your Style'}</h2>
              <p style={{ color: 'var(--stone)', marginBottom: '2rem' }}>
                {config.designs ? `Select the exclusive design pattern for your ${serviceName}.` : `Select the specific tailoring details for your ${serviceName}.`}
              </p>

              {config.designs ? (
                <div className="style-section">
                  <h3>Design Options</h3>
                  <div className="style-grid" style={{ marginBottom: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                    {config.designs.map(opt => (
                      <div key={opt.name} className={`style-card ${styleVariations.design === opt.name ? 'selected' : ''}`}
                        onClick={() => { setSelectedDesignModal(opt); setActiveGalleryIndex(0); }}
                        style={{ height: '340px', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}
                      >
                        <div className="design-img-container" style={{ height: '260px', width: '100%', position: 'relative' }}>
                          <img src={opt.img} alt={opt.name} className="style-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0 0', borderBottom: 'none' }} />
                          <div className="design-img-overlay">
                            <span className="design-img-overlay-text">View More</span>
                          </div>
                          {styleVariations.design === opt.name && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#16a34a', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 2 }}>✓</div>
                          )}
                        </div>
                        <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem', padding: 0 }}>{opt.name}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--stone)', padding: 0 }}>
                            Rs. {opt.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Collar Options */}
                  <div className="style-section">
                    <h3>Collar Style</h3>
                    <div className="style-grid" style={{ marginBottom: '1rem' }}>
                      {config.collarTypes.map(opt => (
                        <div key={opt.name} className={`style-card ${styleVariations.collar === opt.name ? 'selected' : ''}`}
                          onClick={() => setStyleVariations({ ...styleVariations, collar: opt.name, collarSub: opt.subs?.length > 0 ? opt.subs[0] : '' })}
                          style={{ position: 'relative' }}
                        >
                          {styleVariations.collar === opt.name && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--onyx)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '12px', zIndex: 2 }}>✓</div>
                          )}
                          <img src={opt.img} alt={opt.name} className="style-img" />
                          <span>{opt.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Collar Sub-option Dropdown */}
                    {config.collarTypes.find(c => c.name === styleVariations.collar)?.subs?.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: 'var(--onyx)', marginBottom: '0.5rem' }}>
                          Select specific {styleVariations.collar} size/style:
                        </label>
                        <select
                          value={styleVariations.collarSub}
                          onChange={e => setStyleVariations({ ...styleVariations, collarSub: e.target.value })}
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
                  {config.cuffs && config.cuffs.length > 0 && (
                    <div className="style-section">
                      <h3>Sleeve Cuffs</h3>
                      <div className="style-grid">
                        {config.cuffs.map(opt => (
                          <div key={opt.name} className={`style-card ${styleVariations.cuff === opt.name ? 'selected' : ''}`}
                            onClick={() => setStyleVariations({ ...styleVariations, cuff: opt.name })}
                            style={{ position: 'relative' }}
                          >
                            {styleVariations.cuff === opt.name && (
                              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--onyx)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '12px', zIndex: 2 }}>✓</div>
                            )}
                            <img src={opt.img} alt={opt.name} className="style-img" />
                            <span>{opt.name} {opt.price > 0 ? `(+Rs.${opt.price})` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pockets */}
                  {config.pockets && config.pockets.length > 0 && (
                    <div className="style-section">
                      <h3>{serviceName === 'Waistcoat' ? 'Waistcoat Pockets' : serviceName.includes('Kameez') ? 'Kameez Pockets' : serviceName.includes('Kurta') ? 'Kurta Pockets' : 'Shirt Pockets'}</h3>
                      <div className="style-grid">
                        {config.pockets.map(opt => (
                          <div key={opt.name} className={`style-card ${styleVariations.pockets === opt.name ? 'selected' : ''}`}
                            onClick={() => setStyleVariations({ ...styleVariations, pockets: opt.name })}
                            style={{ position: 'relative' }}
                          >
                            {styleVariations.pockets === opt.name && (
                              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--onyx)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '12px', zIndex: 2 }}>✓</div>
                            )}
                            <img src={opt.img} alt={opt.name} className="style-img" />
                            <span>{opt.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottoms Options (Pockets and Design) */}
                  {config.bottomPockets && config.bottomPockets.length > 0 && (
                    <div className="style-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                      <div style={{ border: '1px solid var(--ivory-border)', padding: '1.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                        <h3 style={{ marginTop: 0 }}>Bottom Pockets</h3>
                        <div className="style-grid">
                          {config.bottomPockets.map(opt => (
                            <div key={opt.name} className={`style-card ${styleVariations.bottomPocket === opt.name ? 'selected' : ''}`}
                              onClick={() => setStyleVariations({ ...styleVariations, bottomPocket: opt.name })}
                              style={{ position: 'relative' }}
                            >
                              {styleVariations.bottomPocket === opt.name && (
                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--onyx)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '12px', zIndex: 2 }}>✓</div>
                              )}
                              <img src={opt.img} alt={opt.name} className="style-img" />
                              <span>{opt.name} {opt.price > 0 ? `(+Rs.${opt.price})` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {config.bottomDesigns && config.bottomDesigns.length > 0 && (
                        <div style={{ border: '1px solid var(--ivory-border)', padding: '1.5rem', borderRadius: '8px', background: '#f8fafc' }}>
                          <h3 style={{ marginTop: 0 }}>Bottom Design</h3>
                          <div className="style-grid">
                            {config.bottomDesigns.map(opt => (
                              <div key={opt.name} className={`style-card ${styleVariations.bottomDesign === opt.name ? 'selected' : ''}`}
                                onClick={() => setStyleVariations({ ...styleVariations, bottomDesign: opt.name })}
                                style={{ position: 'relative' }}
                              >
                                {styleVariations.bottomDesign === opt.name && (
                                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--onyx)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '12px', zIndex: 2 }}>✓</div>
                                )}
                                <img src={opt.img} alt={opt.name} className="style-img" />
                                <span>{opt.name} {opt.price > 0 ? `(+Rs.${opt.price})` : ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="wizard-actions split">
                <button className="btn btn-outline btn-lg" onClick={handleBack}>← Back</button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleNext}
                  disabled={config.designs && !styleVariations.design}
                >
                  Proceed to Fabric →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Details & Priority */}
          {step === 4 && (
            <div className="wizard-step luxury-card" style={{ maxWidth: '900px', margin: '0 auto', padding: window.innerWidth < 768 ? '1.5rem' : '3rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--onyx)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Final Details</h2>
                <p style={{ color: 'var(--stone)', fontSize: '1rem' }}>Let us know where to ship and any special requests.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Left Column: Shipping & Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--onyx)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Shipping Address
                    </h3>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City <span style={{ color: '#ef4444' }}>*</span></label>
                      <select
                        className="luxury-input"
                        style={{ width: '100%', appearance: 'auto', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                      >
                        {operationalCities.map((city, idx) => (
                          <option key={idx} value={city.operationalCityName}>{city.operationalCityName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Address <span style={{ color: '#ef4444' }}>*</span></label>
                      <textarea
                        className="luxury-textarea"
                        rows="3"
                        style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', resize: 'vertical' }}
                        placeholder="House #, Street, Block, Area..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--onyx)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Additional Notes
                    </h3>
                    <textarea
                      rows="3"
                      style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', resize: 'vertical' }}
                      placeholder="Special instructions for the tailor..."
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="luxury-textarea"
                    ></textarea>
                  </div>
                </div>

                {/* Right Column: Delivery Speed */}
                <div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', height: '100%' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--onyx)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Delivery Speed
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{
                        display: 'block', padding: '1.25rem', borderRadius: '10px',
                        border: !isRush ? '2px solid var(--onyx)' : '1px solid #e2e8f0',
                        backgroundColor: !isRush ? '#f8fafc' : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: !isRush ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                      }}>
                        <input type="radio" name="rush" checked={!isRush} onChange={() => setIsRush(false)} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--onyx)', fontWeight: 600 }}>Standard</h4>
                          <span style={{ fontSize: '0.85rem', background: '#e2e8f0', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>Included</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>5-7 working days delivery after fabric is received.</p>
                      </label>

                      <label style={{
                        display: 'block', padding: '1.25rem', borderRadius: '10px',
                        border: isRush ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: isRush ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: isRush ? '0 4px 12px -2px rgba(59,130,246,0.15)' : 'none'
                      }}>
                        <input type="radio" name="rush" checked={isRush} onChange={() => setIsRush(true)} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e40af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            Expedited Rush
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                          </h4>
                          <span style={{ fontSize: '0.85rem', background: '#dbeafe', color: '#2563eb', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>+Rs. 1,000</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#3b82f6' }}>2-3 working days. Skip the queue.</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="wizard-actions split" style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                <button className="btn btn-outline btn-lg" onClick={handleBack} style={{ padding: '0.875rem 2rem' }}>&larr; Back</button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleNext}
                  disabled={!deliveryCity || !deliveryAddress || deliveryAddress.trim().length < 5}
                  style={{ padding: '0.875rem 2.5rem', fontSize: '1.05rem' }}
                >
                  Proceed to Summary &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Summary & Place Order */}
          {step === 5 && (
            <div className="wizard-step luxury-card">
              <h2 className="step-title">Order Summary</h2>

              <div className="receipt-box">
                {[...garmentsList, { serviceName, styleVariations, fabricSelection: selectedFabric, fabricColor: selectedColor, basePrice, styleExtras, effectiveFabricPrice }].map((g, idx, arr) => (
                  <div key={idx} style={{ marginBottom: '1.5rem', borderBottom: idx < arr.length - 1 ? '1px dashed #cbd5e1' : 'none', paddingBottom: idx < arr.length - 1 ? '1rem' : '0' }}>
                    <div className="receipt-row">
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Garment {idx + 1}: {g.serviceName}</span>
                      <span style={{ fontWeight: 600 }}>Rs. {(g.basePrice + g.styleExtras + g.effectiveFabricPrice).toLocaleString()}</span>
                    </div>
                    <div className="receipt-row" style={{ fontSize: '0.9rem', color: 'var(--stone)', marginTop: '0.25rem' }}>
                      <span>Fabric: {g.fabricSelection.name} {g.fabricColor ? `(${g.fabricColor})` : ''}</span>
                    </div>
                    <div className="receipt-row" style={{ fontSize: '0.9rem', color: 'var(--stone)', marginTop: '0.25rem' }}>
                      <span>Style: {g.styleVariations.design ? g.styleVariations.design : `${g.styleVariations.collar}${g.styleVariations.cuff ? ', ' + g.styleVariations.cuff : ''}${g.styleVariations.pockets ? ', ' + g.styleVariations.pockets : ''}`}</span>
                    </div>
                  </div>
                ))}

                <div className="receipt-divider"></div>
                <div className="receipt-row">
                  <span>Measurement Profile</span>
                  <span>{profiles.find(p => p._id === selectedProfileId)?.profileName}</span>
                </div>
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
                <div className="receipt-row">
                  <span>Delivery Charges</span>
                  <span>Rs. 250</span>
                </div>
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

                {!appliedPromo ? (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Enter Promo Code" 
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <button 
                        className="btn btn-outline" 
                        onClick={validatePromoCode}
                        disabled={promoLoading || !promoCodeInput.trim()}
                        style={{ padding: '0 1rem' }}
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>{promoError}</p>}
                  </div>
                ) : (
                  <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#16a34a', display: 'block' }}>Promo Applied: {appliedPromo.code}</span>
                      <span style={{ fontSize: '0.85rem', color: '#15803d' }}>
                        {appliedPromo.discountType === 'Percentage' ? `${appliedPromo.discountValue}% OFF` : `Rs. ${appliedPromo.discountValue} OFF`}
                      </span>
                    </div>
                    <button 
                      onClick={() => setAppliedPromo(null)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.25rem', cursor: 'pointer' }}
                      title="Remove Promo"
                    >
                      &times;
                    </button>
                  </div>
                )}

                {appliedPromo && (
                  <div className="receipt-row" style={{ color: '#16a34a', fontWeight: 500 }}>
                    <span>Promo Discount</span>
                    <span>- Rs. {promoDiscountAmt.toLocaleString()}</span>
                  </div>
                )}

                <div className="receipt-row total" style={{ fontSize: '1.1rem', marginTop: '1rem' }}>
                  <span>Total Amount</span>
                  <span>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="receipt-divider" style={{ borderStyle: 'dashed' }}></div>
                <div className="receipt-row" style={{ color: '#0f172a', fontWeight: 600 }}>
                  <span>Advance Required</span>
                  <span>Rs. {(isAllOwnFabric && paymentMethod === 'COD') ? '0' : advanceAmount.toLocaleString()}</span>
                </div>
                <div className="receipt-row" style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  <span>Cash on Delivery (Remaining)</span>
                  <span>Rs. {(isAllOwnFabric && paymentMethod === 'COD') ? totalPrice.toLocaleString() : (totalPrice - advanceAmount).toLocaleString()}</span>
                </div>
              </div>

              {isAllOwnFabric && (
                <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.05rem' }}>Select Payment Method</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: paymentMethod === 'COD' ? '2px solid #0f172a' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'COD' ? '#f8fafc' : '#fff' }}>
                      <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ transform: 'scale(1.2)', accentColor: '#0f172a' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>Cash on Delivery (COD)</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pay Rs. {totalPrice.toLocaleString()} at your doorstep upon delivery.</div>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: paymentMethod === 'Transfer' ? '2px solid #0f172a' : '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'Transfer' ? '#f8fafc' : '#fff' }}>
                      <input type="radio" name="paymentMethod" value="Transfer" checked={paymentMethod === 'Transfer'} onChange={() => setPaymentMethod('Transfer')} style={{ transform: 'scale(1.2)', accentColor: '#0f172a' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>Online Bank Transfer</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pay Rs. {advanceAmount.toLocaleString()} in advance to confirm order.</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {(!isAllOwnFabric || paymentMethod === 'Transfer') && (
                <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '0.9rem', color: '#0369a1' }}>
                  <strong>Bank Transfer Required:</strong> An advance payment {isOwnFabric ? 'of 50%' : 'for the fabric'} is required to confirm your custom tailoring order. Our admin will verify your transfer and begin processing. The remaining balance will be collected by PostEx upon delivery.
                </div>
              )}

              <div className="wizard-actions split">
                <button className="btn btn-outline btn-lg" onClick={handleBack} disabled={loading}>&larr; Edit Order</button>
                <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading} style={{ background: '#0f172a', border: 'none' }}>
                  {loading ? 'Processing...' : (isAllOwnFabric && paymentMethod === 'COD' ? 'Place Order (COD)' : 'Place Order & View Bank Details')}
                </button>
              </div>

              {bankTransferModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                  <div style={{ background: '#ffffff', maxWidth: '450px', width: '100%', padding: '2rem', position: 'relative', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', maxHeight: '95vh', overflowY: 'auto' }}>
                    <button onClick={() => setBankTransferModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b', transition: 'background 0.2s' }}>&times;</button>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', marginBottom: '1rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                      </div>
                      <h3 style={{ margin: 0, color: '#0f172a', fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>Bank Transfer</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.5 }}>Please transfer the advance amount below to confirm your custom tailoring order.</p>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Amount Required</p>
                      <p style={{ margin: '0.5rem 0 0 0', color: '#0f172a', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Rs. {advanceAmount.toLocaleString()}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem', borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
                      <img src={jazzcashPaymentInfo} alt="JazzCash Payment Details and QR Code" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '1rem' }} />
                      <div style={{ textAlign: 'left', width: '100%', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#0f172a' }}><strong>Bank:</strong> RAAST</p>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#0f172a' }}><strong>Til ID:</strong> 980208401</p>
                        <p style={{ margin: '0', fontSize: '0.95rem', color: '#0f172a' }}><strong>Account Title:</strong> Genius Tailors</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 600 }}>Upload Payment Screenshot <span style={{ color: '#ef4444' }}>*</span></label>
                      <label style={{ display: 'block', cursor: loading ? 'not-allowed' : 'pointer', padding: '1.25rem 1rem', border: `2px dashed ${paymentReceiptUrl ? '#22c55e' : '#cbd5e1'}`, borderRadius: '12px', textAlign: 'center', background: paymentReceiptUrl ? '#f0fdf4' : '#f8fafc', transition: 'all 0.2s' }}>
                        {paymentReceiptUrl ? (
                          <div style={{ color: '#16a34a', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            <span style={{ fontWeight: 600 }}>Receipt Uploaded</span>
                            <span style={{ fontSize: '0.8rem', color: '#15803d', textDecoration: 'underline' }}>Click to upload a different image</span>
                          </div>
                        ) : (
                          <div style={{ color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            <span style={{ fontWeight: 500 }}>Click to browse or take a photo</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleReceiptUpload} style={{ display: 'none' }} disabled={loading} />
                      </label>
                    </div>

                    <button
                      onClick={() => executeBankTransferOrder(false)}
                      disabled={loading || !paymentReceiptUrl}
                      style={{ width: '100%', padding: '1rem', background: (!paymentReceiptUrl || loading) ? '#e2e8f0' : '#0f172a', color: (!paymentReceiptUrl || loading) ? '#94a3b8' : 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: (!paymentReceiptUrl || loading) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: (!paymentReceiptUrl || loading) ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    >
                      {loading ? 'Processing...' : 'Confirm Order Placed'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Design Modal Popup */}
          {selectedDesignModal && (
            <div className="modal-overlay" onClick={() => setSelectedDesignModal(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '800px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedDesignModal.name}</h3>
                  <button onClick={() => setSelectedDesignModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#f8fafc', flexDirection: 'column' }}>
                  <div style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <img src={selectedDesignModal.gallery && selectedDesignModal.gallery.length > 0 ? selectedDesignModal.gallery[activeGalleryIndex] : selectedDesignModal.img} alt="Gallery preview" style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  </div>
                  {selectedDesignModal.gallery && selectedDesignModal.gallery.length > 0 && (
                    <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', overflowX: 'auto', background: '#fff', justifyContent: 'center' }}>
                      {selectedDesignModal.gallery.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Thumbnail ${idx}`}
                          onClick={() => setActiveGalleryIndex(idx)}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeGalleryIndex === idx ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s', opacity: activeGalleryIndex === idx ? 1 : 0.7 }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>
                    Total: Rs. {selectedDesignModal.price.toLocaleString()}
                  </span>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                    onClick={() => {
                      setStyleVariations({ ...styleVariations, design: selectedDesignModal.name });
                      setSelectedDesignModal(null);
                    }}
                  >
                    {styleVariations.design === selectedDesignModal.name ? 'Already Selected' : 'Select This Design'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {inlineMeasurementModalOpen && (
        <div className="modal-overlay" onClick={() => setInlineMeasurementModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>Create Measurement Profile</h3>
              <button className="close-btn" onClick={() => setInlineMeasurementModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <form id="inline-measurement-form" onSubmit={handleSaveInlineProfile}>
                <div className="luxury-form-group">
                  <label>Profile Name</label>
                  <input
                    type="text"
                    required
                    value={inlineProfileName}
                    onChange={(e) => setInlineProfileName(e.target.value)}
                    placeholder="e.g. My Eid Fit"
                  />
                </div>

                {SERVICE_FIELDS[inlineServiceKey]?.top && SERVICE_FIELDS[inlineServiceKey].top.fields.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--onyx)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      {SERVICE_FIELDS[inlineServiceKey].top.label} Measurements (Inches)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                      {SERVICE_FIELDS[inlineServiceKey].top.fields.map(field => {
                        const key = `${SERVICE_FIELDS[inlineServiceKey].top.label} ${field}`;
                        return (
                          <div className="luxury-form-group" key={key} style={{ marginBottom: 0 }}>
                            <label>{field}</label>
                            <input
                              type="number"
                              step="0.25"
                              placeholder="e.g. 38"
                              value={inlineMeasurements[key] || ''}
                              onChange={(e) => setInlineMeasurements({ ...inlineMeasurements, [key]: e.target.value })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {SERVICE_FIELDS[inlineServiceKey]?.bottom && SERVICE_FIELDS[inlineServiceKey].bottom.fields.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--onyx)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      {SERVICE_FIELDS[inlineServiceKey].bottom.label} Measurements (Inches)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                      {SERVICE_FIELDS[inlineServiceKey].bottom.fields.map(field => {
                        const key = `${SERVICE_FIELDS[inlineServiceKey].bottom.label} ${field}`;
                        return (
                          <div className="luxury-form-group" key={key} style={{ marginBottom: 0 }}>
                            <label>{field}</label>
                            <input
                              type="number"
                              step="0.25"
                              placeholder="e.g. 38"
                              value={inlineMeasurements[key] || ''}
                              onChange={(e) => setInlineMeasurements({ ...inlineMeasurements, [key]: e.target.value })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {SERVICE_FIELDS[inlineServiceKey]?.outer && SERVICE_FIELDS[inlineServiceKey].outer.fields.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--onyx)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      {SERVICE_FIELDS[inlineServiceKey].outer.label} Measurements (Inches)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                      {SERVICE_FIELDS[inlineServiceKey].outer.fields.map(field => {
                        const key = `${SERVICE_FIELDS[inlineServiceKey].outer.label} ${field}`;
                        return (
                          <div className="luxury-form-group" key={key} style={{ marginBottom: 0 }}>
                            <label>{field}</label>
                            <input
                              type="number"
                              step="0.25"
                              placeholder="e.g. 38"
                              value={inlineMeasurements[key] || ''}
                              onChange={(e) => setInlineMeasurements({ ...inlineMeasurements, [key]: e.target.value })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" style={{ border: 'none' }} onClick={() => setInlineMeasurementModalOpen(false)}>Cancel</button>
              <button form="inline-measurement-form" type="submit" className="btn btn-primary" disabled={savingInlineProfile}>
                {savingInlineProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background: #fff;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--ivory-border);
        }
        .modal-header h3 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          margin: 0;
          color: var(--onyx);
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--stone);
        }
        .modal-body {
          padding: 2rem;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--ivory-border);
        }
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
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--stone-light);
          position: relative;
        }

        .step-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--stone);
          transition: all 0.3s ease;
        }

        .step-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          background: #f8fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .step.active {
          color: var(--onyx);
        }

        .step.active .step-num {
          background: var(--onyx);
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .step.active .step-label {
          background: var(--onyx);
          color: white;
          border-color: var(--onyx);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .step-divider {
          flex: 1;
          height: 2px;
          background: var(--ivory-border);
          margin: 0 1rem;
          transform: translateY(-14px); /* Align with the circles */
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

        .btn-add-garment {
          border-color: var(--onyx) !important;
          color: var(--onyx) !important;
        }
        
        .btn-add-garment:hover {
          color: var(--ivory) !important;
          background-color: var(--onyx) !important;
        }

        @media (max-width: 768px) {
          .wizard-progress {
            padding: 1.5rem 1rem 1rem;
            overflow-x: auto;
            white-space: nowrap;
            /* Hide scrollbar for a cleaner look */
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .wizard-progress::-webkit-scrollbar {
            display: none;
          }
          .step {
            flex-shrink: 0;
          }
          .step-divider {
            min-width: 15px;
            margin: 0 0.5rem;
            transform: translateY(-12px);
          }
          
          .wizard-actions {
            flex-direction: column-reverse;
            gap: 1rem;
          }
          
          .wizard-actions button {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          
          .style-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .fabric-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .style-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      </CustomerLayout>
    </>
  );
}

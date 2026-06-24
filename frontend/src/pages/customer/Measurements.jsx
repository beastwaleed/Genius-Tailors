import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../components/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';

import mannequinImg from '../../assets/tailor_mannequin.png';
import imgKameez from '../../assets/model_kameez_shalwar.png';
import imgKurta from '../../assets/model_kurta_pajama.png';
import imgWaistcoat from '../../assets/model_waistcoat.png';
import AIMeasurementCamera from '../../components/AIMeasurementCamera';

const IMAGE_MAP = {
  'Kameez Shalwar': imgKameez,
  'Kurta Shalwar': imgKameez,
  'Kurta Pajama': imgKurta,
  'Waistcoat': imgWaistcoat
};

const SERVICE_FIELDS = {
  'Kameez Shalwar': {
    top: { label: 'Kameez', fields: ['Length', 'Shoulder', 'Sleeves', 'Chest', 'Abdomen', 'Hips', 'Collar'] },
    bottom: { label: 'Shalwar', fields: ['Length', 'Bottom', 'Crotch Depth'] }
  },
  'Kurta Shalwar': {
    top: { label: 'Kurta', fields: ['Length', 'Shoulder', 'Sleeves', 'Chest', 'Abdomen', 'Hips', 'Collar'] },
    bottom: { label: 'Shalwar', fields: ['Length', 'Bottom', 'Crotch Depth'] }
  },
  'Kurta Pajama': {
    top: { label: 'Kurta', fields: ['Length', 'Shoulder', 'Sleeves', 'Chest', 'Abdomen', 'Hips', 'Collar'] },
    bottom: { label: 'Pajama', fields: ['Length', 'Bottom', 'Crotch Depth', 'Hips'] }
  },
  'Waistcoat': {
    top: { label: 'Waistcoat', fields: ['Length', 'Chest', 'Abdomen', 'Shoulder'] },
    bottom: { label: null, fields: [] }
  }
};

const STANDARD_SIZES = {
  'Kameez Shalwar': {
    'S': {
      'Kameez Length': '38', 'Kameez Shoulder': '17.5', 'Kameez Sleeves': '23.5', 'Kameez Chest': '20', 'Kameez Abdomen': '19', 'Kameez Hips': '21', 'Kameez Collar': '15',
      'Shalwar Length': '38', 'Shalwar Bottom': '7', 'Shalwar Crotch Depth': '14'
    },
    'M': {
      'Kameez Length': '40', 'Kameez Shoulder': '18.5', 'Kameez Sleeves': '24.5', 'Kameez Chest': '22', 'Kameez Abdomen': '21', 'Kameez Hips': '23', 'Kameez Collar': '16',
      'Shalwar Length': '40', 'Shalwar Bottom': '7.5', 'Shalwar Crotch Depth': '15'
    },
    'L': {
      'Kameez Length': '42', 'Kameez Shoulder': '19.5', 'Kameez Sleeves': '25.5', 'Kameez Chest': '24', 'Kameez Abdomen': '23', 'Kameez Hips': '25', 'Kameez Collar': '17',
      'Shalwar Length': '41', 'Shalwar Bottom': '8', 'Shalwar Crotch Depth': '16'
    },
    'XL': {
      'Kameez Length': '44', 'Kameez Shoulder': '20.5', 'Kameez Sleeves': '26', 'Kameez Chest': '26', 'Kameez Abdomen': '25', 'Kameez Hips': '27', 'Kameez Collar': '18',
      'Shalwar Length': '42', 'Shalwar Bottom': '8.5', 'Shalwar Crotch Depth': '17'
    }
  },
  'Kurta Shalwar': {
    'S': {
      'Kurta Length': '38', 'Kurta Shoulder': '17.5', 'Kurta Sleeves': '23.5', 'Kurta Chest': '20', 'Kurta Abdomen': '19', 'Kurta Hips': '21', 'Kurta Collar': '15',
      'Shalwar Length': '38', 'Shalwar Bottom': '7', 'Shalwar Crotch Depth': '14'
    },
    'M': {
      'Kurta Length': '40', 'Kurta Shoulder': '18.5', 'Kurta Sleeves': '24.5', 'Kurta Chest': '22', 'Kurta Abdomen': '21', 'Kurta Hips': '23', 'Kurta Collar': '16',
      'Shalwar Length': '40', 'Shalwar Bottom': '7.5', 'Shalwar Crotch Depth': '15'
    },
    'L': {
      'Kurta Length': '42', 'Kurta Shoulder': '19.5', 'Kurta Sleeves': '25.5', 'Kurta Chest': '24', 'Kurta Abdomen': '23', 'Kurta Hips': '25', 'Kurta Collar': '17',
      'Shalwar Length': '41', 'Shalwar Bottom': '8', 'Shalwar Crotch Depth': '16'
    },
    'XL': {
      'Kurta Length': '44', 'Kurta Shoulder': '20.5', 'Kurta Sleeves': '26', 'Kurta Chest': '26', 'Kurta Abdomen': '25', 'Kurta Hips': '27', 'Kurta Collar': '18',
      'Shalwar Length': '42', 'Shalwar Bottom': '8.5', 'Shalwar Crotch Depth': '17'
    }
  },
  'Kurta Pajama': {
    'S': {
      'Kurta Length': '38', 'Kurta Shoulder': '17.5', 'Kurta Sleeves': '23.5', 'Kurta Chest': '20', 'Kurta Abdomen': '19', 'Kurta Hips': '21', 'Kurta Collar': '15',
      'Pajama Length': '39', 'Pajama Bottom': '6.5', 'Pajama Crotch Depth': '13.5', 'Pajama Hips': '22'
    },
    'M': {
      'Kurta Length': '40', 'Kurta Shoulder': '18.5', 'Kurta Sleeves': '24.5', 'Kurta Chest': '22', 'Kurta Abdomen': '21', 'Kurta Hips': '23', 'Kurta Collar': '16',
      'Pajama Length': '41', 'Pajama Bottom': '7', 'Pajama Crotch Depth': '14.5', 'Pajama Hips': '24'
    },
    'L': {
      'Kurta Length': '42', 'Kurta Shoulder': '19.5', 'Kurta Sleeves': '25.5', 'Kurta Chest': '24', 'Kurta Abdomen': '23', 'Kurta Hips': '25', 'Kurta Collar': '17',
      'Pajama Length': '43', 'Pajama Bottom': '7.5', 'Pajama Crotch Depth': '15.5', 'Pajama Hips': '26'
    },
    'XL': {
      'Kurta Length': '44', 'Kurta Shoulder': '20.5', 'Kurta Sleeves': '26', 'Kurta Chest': '26', 'Kurta Abdomen': '25', 'Kurta Hips': '27', 'Kurta Collar': '18',
      'Pajama Length': '44', 'Pajama Bottom': '8', 'Pajama Crotch Depth': '16.5', 'Pajama Hips': '28'
    }
  },
  'Waistcoat': {
    'S': { 'Waistcoat Length': '26', 'Waistcoat Chest': '20', 'Waistcoat Abdomen': '19', 'Waistcoat Shoulder': '15' },
    'M': { 'Waistcoat Length': '27.5', 'Waistcoat Chest': '22', 'Waistcoat Abdomen': '21', 'Waistcoat Shoulder': '16' },
    'L': { 'Waistcoat Length': '29', 'Waistcoat Chest': '24', 'Waistcoat Abdomen': '23', 'Waistcoat Shoulder': '17' },
    'XL': { 'Waistcoat Length': '30.5', 'Waistcoat Chest': '26', 'Waistcoat Abdomen': '25', 'Waistcoat Shoulder': '18' }
  }
};

function getMeasurementVisualConfig(fieldKey) {
  if (!fieldKey) return null;
  const isTop = fieldKey.includes('Kameez') || fieldKey.includes('Kurta') || fieldKey.includes('Waistcoat');
  const isBottom = fieldKey.includes('Shalwar') || fieldKey.includes('Pajama');

  if (fieldKey.includes('Length')) {
    if (isTop) return { top: '30%', left: '38%', height: '35%', width: '3px', transform: 'translateX(-50%)', label: 'Top Length (Shoulder to Knee)' };
    if (isBottom) return { top: '56%', left: '60%', height: '28%', width: '3px', transform: 'translateX(-50%)', label: 'Bottom Length (Waist to Ankle)' };
  }
  if (fieldKey.includes('Shoulder')) {
    return { top: '27%', left: '50%', width: '30%', height: '3px', transform: 'translate(-50%, -50%)', label: 'Shoulder to Shoulder' };
  }
  if (fieldKey.includes('Sleeves')) {
    return { top: '26%', left: '68%', height: '25%', width: '3px', transform: 'rotate(-0deg)', label: 'Arm Length' };
  }
  if (fieldKey.includes('Chest')) {
    return { top: '32%', left: '50%', width: '30%', height: '3px', transform: 'translate(-50%, -50%)', label: 'Chest Circumference' };
  }
  if (fieldKey.includes('Abdomen')) {
    return { top: '44%', left: '50%', width: '28%', height: '3px', transform: 'translate(-50%, -50%)', label: 'Stomach/Waist' };
  }
  if (fieldKey.includes('Hips') && isTop) {
    return { top: '52%', left: '50%', width: '32%', height: '3px', transform: 'translate(-50%, -50%)', label: 'Hips Circumference' };
  }
  if (fieldKey.includes('Hips') && isBottom) {
    return { top: '56%', left: '50%', width: '32%', height: '3px', transform: 'translate(-50%, -50%)', label: 'Bottom Hips' };
  }
  if (fieldKey.includes('Collar')) {
    return { top: '25%', left: '50%', width: '10%', height: '3px', transform: 'translate(-50%, -50%)', label: 'Neck/Collar Base' };
  }
  if (fieldKey.includes('Bottom')) {
    return { top: '84%', left: '60%', width: '12%', height: '3px', transform: 'translate(-50%, -50%)', label: 'Ankle/Pancha' };
  }
  if (fieldKey.includes('Crotch Depth')) {
    return { top: '52%', left: '50%', height: '14%', width: '3px', transform: 'translateX(-50%)', label: 'Asan / Crotch Depth' };
  }
  return null;
}

export default function Measurements() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);
  
  // Height/Weight Estimator State
  const [showHWModal, setShowHWModal] = useState(false);
  const [hwHeight, setHwHeight] = useState('');
  const [hwWeight, setHwWeight] = useState('');

  // New Profile Form State
  const [profileName, setProfileName] = useState('');
  const [selectedService, setSelectedService] = useState('Kameez Shalwar');
  const [measurements, setMeasurements] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [isAiCameraOpen, setIsAiCameraOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data } = await api.get('/api/measurements');
      setProfiles(data);
    } catch (error) {
      console.error('Failed to fetch measurements', error);
      toast.error('Failed to fetch measurements');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (size) => {
    const presets = STANDARD_SIZES[selectedService]?.[size];
    if (presets) {
      setMeasurements(presets);
      toast.success(`Applied ${size} standard sizing`);
      if (!profileName) setProfileName(`Standard ${size}`);
      setActiveField(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingProfileId(null);
    setProfileName('');
    setSelectedService('Kameez Shalwar');
    setActiveField(null);

    const initialFields = {};
    const config = SERVICE_FIELDS['Kameez Shalwar'];
    config.top.fields.forEach(f => initialFields[`${config.top.label} ${f}`] = '');
    config.bottom.fields.forEach(f => initialFields[`${config.bottom.label} ${f}`] = '');

    setMeasurements(initialFields);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (profile) => {
    setEditingProfileId(profile._id);
    setProfileName(profile.profileName);
    setActiveField(null);

    const keys = Object.keys(profile.measurements || {});

    // Attempt to guess the service based on keys stored
    let guessedService = 'Kameez Shalwar';
    if (keys.some(k => k.includes('Pajama'))) guessedService = 'Kurta Pajama';
    else if (keys.some(k => k.includes('Kurta'))) guessedService = 'Kurta Shalwar';
    else if (keys.some(k => k.includes('Waistcoat'))) guessedService = 'Waistcoat';

    setSelectedService(guessedService);

    const config = SERVICE_FIELDS[guessedService];
    const updatedMeasurements = {};

    config.top.fields.forEach(f => {
      const key = `${config.top.label} ${f}`;
      updatedMeasurements[key] = profile.measurements ? (profile.measurements[key] || '') : '';
    });
    config.bottom.fields.forEach(f => {
      const key = `${config.bottom.label} ${f}`;
      updatedMeasurements[key] = profile.measurements ? (profile.measurements[key] || '') : '';
    });

    setMeasurements(updatedMeasurements);
    setIsModalOpen(true);
  };

  const handleServiceChange = (e) => {
    const s = e.target.value;
    setSelectedService(s);
    setActiveField(null);

    const newMeasurements = {};
    const config = SERVICE_FIELDS[s];

    config.top.fields.forEach(f => {
      const key = `${config.top.label} ${f}`;
      newMeasurements[key] = measurements[key] || '';
    });
    config.bottom.fields.forEach(f => {
      const key = `${config.bottom.label} ${f}`;
      newMeasurements[key] = measurements[key] || '';
    });

    setMeasurements(newMeasurements);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName) return toast.error('Profile Name is required');

    // Filter out empty measurements safely
    const filteredMeasurements = {};
    for (const [key, val] of Object.entries(measurements)) {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        filteredMeasurements[key] = String(val).trim();
      }
    }

    if (Object.keys(filteredMeasurements).length === 0) {
      return toast.error('Please enter at least one measurement');
    }

    setSaving(true);
    try {
      if (editingProfileId) {
        const { data } = await api.put(`/api/measurements/${editingProfileId}`, {
          profileName,
          measurements: filteredMeasurements
        });
        setProfiles(profiles.map(p => p._id === editingProfileId ? data : p));
        toast.success('Measurement profile updated successfully');
      } else {
        const { data } = await api.post('/api/measurements', {
          profileName,
          measurements: filteredMeasurements
        });
        setProfiles([...profiles, data]);
        toast.success('Measurement profile created successfully');
      }

      // Reset and close
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = (id) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontWeight: 500, color: 'var(--onyx)' }}>Delete this profile permanently?</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            style={{ padding: '0.5rem 1rem', background: 'var(--ivory)', color: 'var(--stone)', border: '1px solid var(--ivory-border)', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/api/measurements/${id}`);
                setProfiles(prev => prev.filter(p => p._id !== id));
                toast.success('Profile deleted');
              } catch (error) {
                toast.error('Failed to delete profile');
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleAiMeasurementsReady = (aiData) => {
    toast.success('AI Scan Complete! Fields auto-filled.');
    setIsAiCameraOpen(false);

    // Map the generic AI output to the specific service fields
    const newMeasurements = { ...measurements };
    const topLabel = SERVICE_FIELDS[selectedService].top.label;
    const bottomLabel = SERVICE_FIELDS[selectedService].bottom.label;

    if (topLabel) {
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Shoulder')) newMeasurements[`${topLabel} Shoulder`] = aiData.shoulder;
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Sleeves')) newMeasurements[`${topLabel} Sleeves`] = aiData.sleeves;
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Length')) newMeasurements[`${topLabel} Length`] = aiData.kameezLength;
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Chest')) newMeasurements[`${topLabel} Chest`] = aiData.chest;
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Abdomen')) newMeasurements[`${topLabel} Abdomen`] = aiData.abdomen;
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Hips')) newMeasurements[`${topLabel} Hips`] = aiData.hips;
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Collar')) newMeasurements[`${topLabel} Collar`] = aiData.neck;
    }

    if (bottomLabel) {
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Length')) newMeasurements[`${bottomLabel} Length`] = aiData.shalwarLength;
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Bottom')) newMeasurements[`${bottomLabel} Bottom`] = aiData.bottom;
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Crotch Depth')) newMeasurements[`${bottomLabel} Crotch Depth`] = aiData.crotchDepth;
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Hips')) newMeasurements[`${bottomLabel} Hips`] = aiData.hips;
    }

    setMeasurements(newMeasurements);
  };

  const handleHWEstimate = (e) => {
    e.preventDefault();
    if (!hwHeight || !hwWeight) return;
    
    const h = parseFloat(hwHeight);
    const w = parseFloat(hwWeight);

    // Advanced mathematical tailoring proportions
    const chest = (w * 0.4) + 10;
    const shoulder = chest / 2.2;
    const abdomen = chest - (170 / w);
    const hips = chest + 1;
    const neck = chest * 0.38;
    const sleeves = h * 0.34;
    const kameezL = h * 0.55;
    const shalwarL = h * 0.58;
    const crotch = h * 0.22;
    const bottom = 7.5;

    const newMeasurements = { ...measurements };
    const topLabel = SERVICE_FIELDS[selectedService].top.label;
    const bottomLabel = SERVICE_FIELDS[selectedService].bottom.label;

    if (topLabel) {
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Shoulder')) newMeasurements[`${topLabel} Shoulder`] = shoulder.toFixed(1);
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Sleeves')) newMeasurements[`${topLabel} Sleeves`] = sleeves.toFixed(1);
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Length')) newMeasurements[`${topLabel} Length`] = kameezL.toFixed(1);
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Chest')) newMeasurements[`${topLabel} Chest`] = chest.toFixed(1);
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Abdomen')) newMeasurements[`${topLabel} Abdomen`] = abdomen.toFixed(1);
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Hips')) newMeasurements[`${topLabel} Hips`] = hips.toFixed(1);
      if (SERVICE_FIELDS[selectedService].top.fields.includes('Collar')) newMeasurements[`${topLabel} Collar`] = neck.toFixed(1);
    }

    if (bottomLabel) {
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Length')) newMeasurements[`${bottomLabel} Length`] = shalwarL.toFixed(1);
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Bottom')) newMeasurements[`${bottomLabel} Bottom`] = bottom.toFixed(1);
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Crotch Depth')) newMeasurements[`${bottomLabel} Crotch Depth`] = crotch.toFixed(1);
      if (SERVICE_FIELDS[selectedService].bottom.fields.includes('Hips')) newMeasurements[`${bottomLabel} Hips`] = hips.toFixed(1);
    }

    setMeasurements(newMeasurements);
    setShowHWModal(false);
    toast.success('Measurements estimated based on Height & Weight!');
  };

  return (
    <CustomerLayout title="Measurements">
      <div className="luxury-workspace-inner">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="luxury-section-title" style={{ marginBottom: '0.5rem' }}>Measurement Profiles</h2>
            <p style={{ color: 'var(--stone)' }}>Manage your saved measurements for bespoke orders.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/services" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 500, height: '42px' }}>Place an Order</Link>
            <button className="luxury-btn-primary" onClick={handleOpenCreate} style={{ height: '42px' }}>Add New Profile</button>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: '2rem 0', color: 'var(--stone)' }}>Loading measurement profiles...</p>
        ) : (
          <div className="measurement-grid">
            {profiles.map(profile => (
              <div key={profile._id} className="luxury-card measurement-card">
                <div className="measurement-header">
                  <h3>{profile.profileName}</h3>
                  <span className="measurement-badge">Active</span>
                </div>

                <div className="measurement-details">
                  <div className="detail-row">
                    <span className="detail-label">Last Updated</span>
                    <span className="detail-value">{new Date(profile.updatedAt || profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fields Saved</span>
                    <span className="detail-value">{profile.measurements ? Object.keys(profile.measurements).length : 0} metrics</span>
                  </div>
                </div>

                <div className="measurement-actions">
                  <button className="btn-text" onClick={() => handleOpenEdit(profile)}>View Details</button>
                  <button className="btn-text btn-outline-alt" onClick={() => handleDeleteProfile(profile._id)} style={{ color: '#dc3545' }}>Delete</button>
                </div>
              </div>
            ))}

            {/* Empty State Card / Add New */}
            <div className="luxury-card measurement-card add-new-card" onClick={handleOpenCreate}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--stone)" strokeWidth="1" style={{ marginBottom: '1rem' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <h3 style={{ color: 'var(--onyx)', fontWeight: 500, marginBottom: '0.25rem' }}>Create Profile</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--stone)' }}>Add measurements manually.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content interactive-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProfileId ? 'Edit Measurement Profile' : 'Create New Profile'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <div className="modal-body interactive-body">
              {/* Left Side: Form */}
              <div className="interactive-form-side">
                <form id="measurement-form" onSubmit={handleSaveProfile}>
                  <div className="luxury-form-group">
                    <label>Profile Name <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g., My Formal Fit"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      onFocus={() => setActiveField(null)}
                    />
                  </div>

                  <div className="luxury-form-group">
                    <label>Garment Type</label>
                    <select value={selectedService} onChange={handleServiceChange} onFocus={() => setActiveField(null)}>
                      {Object.keys(SERVICE_FIELDS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="preset-sizes-container">
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginRight: '1rem' }}>Standard Presets:</span>
                    <div className="preset-btn-group">
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <button
                          type="button"
                          key={size}
                          className="preset-btn"
                          onClick={() => applyPreset(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ai-scanner-section" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.1), transparent)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(201, 169, 110, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--onyx)', marginBottom: '0.25rem' }}>✨ Smart Auto-Measure</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--stone)' }}>Use your camera or input vitals to estimate.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn btn-outline" style={{ borderColor: '#C9A96E', color: '#C9A96E' }} onClick={() => setShowHWModal(true)}>Height/Weight 📐</button>
                      <button type="button" className="btn btn-gold" onClick={() => setIsAiCameraOpen(true)}>AI Camera 📸</button>
                    </div>
                  </div>

                  {/* Height/Weight Modal Overlay */}
                  {showHWModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, color: 'var(--onyx)', fontFamily: 'var(--font-serif)' }}>Estimate by Vitals</h3>
                        <p style={{ color: 'var(--stone)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter your exact height and weight. We will mathematically approximate your tailoring measurements.</p>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Height (Inches)</label>
                          <input type="number" required placeholder="e.g. 70" value={hwHeight} onChange={e => setHwHeight(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Weight (KG)</label>
                          <input type="number" required placeholder="e.g. 75" value={hwWeight} onChange={e => setHwWeight(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="button" onClick={() => setShowHWModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                          <button type="button" onClick={handleHWEstimate} className="btn-gold" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Estimate</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--onyx)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      {SERVICE_FIELDS[selectedService].top.label} Measurements (Inches)
                    </h4>
                    <div className="measurements-input-grid">
                      {SERVICE_FIELDS[selectedService].top.fields.map(field => {
                        const key = `${SERVICE_FIELDS[selectedService].top.label} ${field}`;
                        return (
                          <div className="luxury-form-group" key={key}>
                            <label>{field}</label>
                            <input
                              type="number"
                              step="0.25"
                              placeholder="e.g., 40"
                              value={measurements[key] || ''}
                              onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                              onFocus={() => setActiveField(key)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {SERVICE_FIELDS[selectedService].bottom.fields.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--onyx)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                        {SERVICE_FIELDS[selectedService].bottom.label} Measurements (Inches)
                      </h4>
                      <div className="measurements-input-grid">
                        {SERVICE_FIELDS[selectedService].bottom.fields.map(field => {
                          const key = `${SERVICE_FIELDS[selectedService].bottom.label} ${field}`;
                          return (
                            <div className="luxury-form-group" key={key}>
                              <label>{field}</label>
                              <input
                                type="number"
                                step="0.25"
                                placeholder="e.g., 38"
                                value={measurements[key] || ''}
                                onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                                onFocus={() => setActiveField(key)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Right Side: Interactive Visual Model */}
              <div key={activeField || 'empty'} className={`interactive-visual-side ${activeField ? 'has-active-field' : ''}`}>
                <div className="mannequin-container">
                  <img src={IMAGE_MAP[selectedService] || imgKameez} alt="Tailor Model" className="mannequin-img" />

                  {/* Overlay dynamic pointers */}
                  {(() => {
                    const config = getMeasurementVisualConfig(activeField);
                    if (!config) return null;
                    return (
                      <div
                        className="mannequin-indicator"
                        style={{
                          top: config.top,
                          left: config.left,
                          width: config.width,
                          height: config.height,
                          transform: config.transform
                        }}
                      >
                        <div className="mannequin-tooltip">
                          {config.label}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                  {activeField
                    ? `Enter the exact ${activeField.toLowerCase()} measurement in inches.`
                    : 'Click on any measurement field to see where to measure.'}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button form="measurement-form" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingProfileId ? 'Update Profile' : 'Save Profile')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .measurement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .measurement-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .measurement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--ivory-border);
        }

        .measurement-header h3 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--onyx);
          margin: 0;
        }

        .measurement-badge {
          background: #e6f4ea;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #137333;
        }

        .measurement-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .detail-label {
          color: var(--stone);
        }

        .detail-value {
          color: var(--onyx);
          font-weight: 500;
        }

        .measurement-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-text {
          flex: 1;
          padding: 0.5rem;
          background: var(--ivory);
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--onyx);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-text:hover {
          background: var(--ivory-dark);
        }

        .btn-outline-alt {
          background: transparent;
        }

        .add-new-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--ivory);
          border: 1px dashed var(--stone);
          box-shadow: none;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 220px;
        }

        .add-new-card:hover {
          border-color: var(--onyx);
          background: #ffffff;
        }

        /* Modal Styles */
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
          width: 95%;
          max-width: 1100px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }

        .interactive-body {
          display: flex;
          padding: 0;
          overflow: hidden;
        }

        .interactive-form-side {
          flex: 1.5;
          padding: 2.5rem;
          overflow-y: auto;
          max-height: calc(90vh - 160px);
        }

        .measurements-input-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0 1.5rem;
        }

        .interactive-visual-side {
          flex: 0.8;
          background: #f8fafc;
          border-left: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        .mannequin-container {
          position: relative;
          width: 100%;
          max-width: 300px;
          aspect-ratio: 1/2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mannequin-img {
          width: auto;
          height: 100%;
          max-height: 500px;
          border-radius: var(--radius-lg);
          object-fit: cover;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .mannequin-indicator {
          position: absolute;
          background: #f59e0b; /* Golden highlight */
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.8), 0 0 4px rgba(255, 255, 255, 0.5) inset;
          border-radius: 99px;
          z-index: 10;
          animation: fadeSlideIn 0.3s ease-out forwards;
          transform-origin: top center;
        }

        @keyframes fadeSlideIn {
          0% { opacity: 0; filter: blur(4px); }
          100% { opacity: 1; filter: blur(0); }
        }

        .mannequin-tooltip {
          position: absolute;
          top: -35px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: white;
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          animation: float 2s infinite ease-in-out;
        }
        
        .mannequin-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: #1e293b transparent transparent transparent;
        }

        .preset-sizes-container {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 0.5rem;
        }

        .preset-btn-group {
          display: flex;
          gap: 0.5rem;
        }

        .preset-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .preset-btn:hover {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        @media (max-width: 768px) {
          .interactive-body { display: block; overflow-y: auto; }
          .interactive-form-side { 
            padding: 1.25rem 1rem; 
            max-height: none;
            overflow: visible;
          }
          
          /* Visual model floats above as a temporary popup on mobile */
          .interactive-visual-side { 
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            background: white;
            padding: 1.5rem;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            border: 1px solid #e2e8f0;
            display: none; /* hidden by default */
            flex-direction: column;
            align-items: center;
          }
          
          /* Only show when there is an active field, and animate it! */
          .interactive-visual-side.has-active-field {
            display: flex;
            animation: mobilePopup 3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            pointer-events: none; /* don't block taps */
          }

          .mannequin-container { max-width: 180px; }
          .mannequin-img { max-height: 380px; }
          
          .measurements-input-grid { grid-template-columns: 1fr; gap: 0 1rem; }
          .modal-header { padding: 1.25rem 1.5rem; }
          .modal-footer { padding: 1.25rem 1.5rem; }
          
          .mannequin-tooltip {
            font-size: 0.65rem;
            padding: 0.25rem 0.5rem;
            top: -28px;
          }
        }

        @keyframes mobilePopup {
          0% { opacity: 0; transform: translate(-50%, -45%) scale(0.95); }
          10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); display: none; }
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
          overflow-y: auto;
        }

        .luxury-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .luxury-form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--stone);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .luxury-form-group input, .luxury-form-group select {
          padding: 0.875rem 1.25rem;
          border: 1px solid var(--ivory-border);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          background: var(--ivory);
          color: var(--onyx);
          transition: all 0.2s ease;
          font-family: var(--font-sans);
          outline: none;
          appearance: auto;
        }

        .luxury-form-group input:focus, .luxury-form-group select:focus {
          outline: none;
          border-color: var(--onyx);
          background: #ffffff;
        }

        .measurements-input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 1.5rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--ivory-border);
          margin-top: 1rem;
        }

        .btn-cancel {
          background: transparent;
          border: none;
          color: var(--stone);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .btn-cancel:hover {
          color: var(--onyx);
          text-decoration: underline;
        }

        .btn-save {
          padding: 1rem 3rem !important;
          font-size: 1.05rem !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }

        @media (max-width: 600px) {
          .measurements-input-grid {
            grid-template-columns: 1fr;
          }
          .measurement-grid {
            grid-template-columns: 1fr;
          }
          .modal-header, .modal-body {
            padding: 1.25rem;
          }
          .modal-content {
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
          }
          .modal-overlay {
            padding: 0;
          }
        }
      `}</style>

      {/* AI Camera Modal */}
      {isAiCameraOpen && (
        <AIMeasurementCamera
          onMeasurementsReady={handleAiMeasurementsReady}
          onClose={() => setIsAiCameraOpen(false)}
        />
      )}
    </CustomerLayout>
  );
}

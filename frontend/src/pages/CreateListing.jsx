import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { INDIAN_CITIES } from '../utils/constants';
import { Home, ArrowLeft, Loader, Upload, X, ArrowRight, Check, Compass, DollarSign, Calendar, Sliders } from 'lucide-react';

const AMENITIES_LIST = [
  'WiFi', 'AC', 'Cooler', 'Fan', 'Refrigerator', 'Microwave', 'RO Water', 'TV', 
  'Study Table', 'Wardrobe', 'Parking', 'Lift', 'Power Backup', 'Attached Bathroom', 
  'Balcony', 'Kitchen', 'Laundry', 'Housekeeping', 'Gym', 'Swimming Pool', 
  'Security Guard', 'CCTV', 'Pet Friendly'
];

const NEARBY_LIST = ['Metro', 'Bus Stop', 'College', 'Hospital', 'Mall', 'Office', 'Market'];

const CreateListing = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State
  const [step, setStep] = useState(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [roomType, setRoomType] = useState('Single Room');
  const [furnishing, setFurnishing] = useState('Semi Furnished');
  const [amenities, setAmenities] = useState([]);
  const [foodPreference, setFoodPreference] = useState('Both');
  const [genderPreference, setGenderPreference] = useState('Anyone');
  const [smoking, setSmoking] = useState('Not Allowed');
  const [drinking, setDrinking] = useState('Not Allowed');
  const [guests, setGuests] = useState('Allowed');
  const [occupancy, setOccupancy] = useState('Single');
  const [nearby, setNearby] = useState([]);
  const [photos, setPhotos] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle local image file picker -> base64 conversion
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setErrorMsg('');
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Each image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]); // Append multiple photos
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAmenityToggle = (amenity) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleNearbyToggle = (facility) => {
    setNearby(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const validateStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!title || !description || !location || !locality || !address) {
        setErrorMsg('Please fill in all location and basic details.');
        return false;
      }
    } else if (step === 2) {
      if (!rent || !securityDeposit || !availableFrom) {
        setErrorMsg('Please fill in rent, security deposit, and available date.');
        return false;
      }
      if (Number(rent) <= 0 || Number(securityDeposit) < 0) {
        setErrorMsg('Rent and deposit values must be positive numbers.');
        return false;
      }
    }
    return true;
  };

  const stepChangeTimeRef = React.useRef(0);

  const handleNext = () => {
    if (validateStep()) {
      stepChangeTimeRef.current = Date.now();
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    stepChangeTimeRef.current = Date.now();
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Safety check: if step changed in the last 800ms, ignore immediate submit
    if (Date.now() - stepChangeTimeRef.current < 800) {
      return;
    }

    setErrorMsg('');

    if (photos.length === 0) {
      setErrorMsg('Please upload at least one room photo.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          location,
          locality,
          address,
          rent: Number(rent),
          securityDeposit: Number(securityDeposit),
          availableFrom,
          roomType,
          furnishing,
          amenities,
          foodPreference,
          genderPreference,
          smoking,
          drinking,
          guests,
          occupancy,
          nearby,
          photos
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/owner-dashboard');
      } else {
        setErrorMsg(data.message || 'Failed to create room listing');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '60px' }} className="fade-in">
      <Link to="/owner-dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14.5px',
        fontWeight: 700,
        marginBottom: '24px',
        transition: 'var(--transition-smooth)'
      }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-card" style={{ padding: '40px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Home size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Post New Room</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Configure vacancy details and upload listing media</p>
            </div>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '8px' }}>
            Step {step} of 4
          </span>
        </div>

        {/* Step Progress Indicators */}
        <div style={{ display: 'flex', gap: '8px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', marginBottom: '36px', overflow: 'hidden' }}>
          <div style={{ width: step >= 1 ? '25%' : '0%', height: '100%', backgroundColor: '#2563EB', transition: 'var(--transition-smooth)' }} />
          <div style={{ width: step >= 2 ? '25%' : '0%', height: '100%', backgroundColor: '#2563EB', transition: 'var(--transition-smooth)' }} />
          <div style={{ width: step >= 3 ? '25%' : '0%', height: '100%', backgroundColor: '#2563EB', transition: 'var(--transition-smooth)' }} />
          <div style={{ width: step >= 4 ? '25%' : '0%', height: '100%', backgroundColor: '#2563EB', transition: 'var(--transition-smooth)' }} />
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid rgba(239, 68, 68, 0.15)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '24px',
            fontWeight: 500
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Location & Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Room Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Spacious Master Bedroom with Private Balcony"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room Description *</label>
                <textarea
                  placeholder="Describe the room, building rules, current flatmates, preferred tenant traits, etc..."
                  className="form-control"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select
                    className="form-control form-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  >
                    <option value="">Select City</option>
                    {INDIAN_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Locality *</label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, Phase 2"
                    className="form-control"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Complete Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 304, Green Glen Layout, Behind Tech Park"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Budgets & Timeline */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Monthly Rent (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700 }}>₹</span>
                    <input
                      type="number"
                      placeholder="18000"
                      className="form-control"
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      style={{ paddingLeft: '32px', width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Security Deposit (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700 }}>₹</span>
                    <input
                      type="number"
                      placeholder="40000"
                      className="form-control"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      style={{ paddingLeft: '32px', width: '100%' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Available From *</label>
                <input
                  type="date"
                  className="form-control"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Room Preferences & Rules */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Room Type *</label>
                  <select className="form-control form-select" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                    <option value="Single Room">Single Room</option>
                    <option value="Shared Room">Shared Room</option>
                    <option value="Private Room">Private Room</option>
                    <option value="1 RK">1 RK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Furnishing Status *</label>
                  <select className="form-control form-select" value={furnishing} onChange={(e) => setFurnishing(e.target.value)}>
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Maximum Occupancy *</label>
                  <select className="form-control form-select" value={occupancy} onChange={(e) => setOccupancy(e.target.value)}>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Food Rules *</label>
                  <select className="form-control form-select" value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)}>
                    <option value="Veg Only">Veg Only</option>
                    <option value="Non-Veg Allowed">Non-Veg Allowed</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Smoking Rule *</label>
                  <select className="form-control form-select" value={smoking} onChange={(e) => setSmoking(e.target.value)}>
                    <option value="Not Allowed">Not Allowed</option>
                    <option value="Allowed">Allowed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Drinking Rule *</label>
                  <select className="form-control form-select" value={drinking} onChange={(e) => setDrinking(e.target.value)}>
                    <option value="Not Allowed">Not Allowed</option>
                    <option value="Allowed">Allowed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Guests Rule *</label>
                  <select className="form-control form-select" value={guests} onChange={(e) => setGuests(e.target.value)}>
                    <option value="Allowed">Allowed</option>
                    <option value="Not Allowed">Not Allowed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Gender Preference *</label>
                  <select className="form-control form-select" value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)}>
                    <option value="Anyone">Anyone</option>
                    <option value="Boys">Male (Boys)</option>
                    <option value="Girls">Female (Girls)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Amenities, Proximity & Media */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Photo Upload Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="form-label">Property Photos (Upload Multiple) *</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '16px',
                  padding: '30px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-secondary)',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <Upload size={32} style={{ color: 'var(--text-light)', margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>Click to browse or drag room photos here</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>PNG, JPG or JPEG (Max 2MB per file)</p>
                </div>

                {photos.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                    {photos.map((pic, idx) => (
                      <div key={idx} style={{
                        position: 'relative',
                        width: '90px',
                        height: '70px',
                        borderRadius: '10px',
                        backgroundImage: `url(${pic})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1.5px solid var(--border-color)'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--danger)',
                            border: 'none',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="form-label">Available Amenities</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {AMENITIES_LIST.map(amenity => (
                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nearby Proximity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="form-label">Nearby Proximities</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '16px'
                }}>
                  {NEARBY_LIST.map(facility => (
                    <label key={facility} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={nearby.includes(facility)}
                        onChange={() => handleNearbyToggle(facility)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Form actions footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            {step > 1 ? (
              <button type="button" onClick={handlePrev} className="btn btn-secondary">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < 4 ? (
              <button key="btn-next" type="button" onClick={handleNext} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button key="btn-submit" type="submit" className="btn btn-accent" style={{ padding: '12px 30px' }} disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="spin" size={16} style={{ animation: 'spin 1s linear infinite' }} /> Publishing room...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Publish Listing
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateListing;

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { INDIAN_CITIES } from '../utils/constants';
import { UserCheck, ArrowLeft, Loader, ArrowRight, Check } from 'lucide-react';

const AMENITIES_LIST = [
  'WiFi', 'AC', 'Parking', 'Lift', 'Attached Bathroom', 'Kitchen', 'Balcony', 'Study Table', 'Wardrobe', 'Gym', 'Security', 'CCTV'
];

const NEARBY_LIST = ['Metro', 'College', 'Hospital', 'Office', 'Mall', 'Market'];

const TenantProfile = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Wizard step state
  const [step, setStep] = useState(1);

  // States matching Profile model
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferredLocality, setPreferredLocality] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [preferredRoomType, setPreferredRoomType] = useState('Single Room');
  const [furnishingPreference, setFurnishingPreference] = useState('Semi Furnished');
  const [requiredAmenities, setRequiredAmenities] = useState([]);
  const [foodPreference, setFoodPreference] = useState('Both');
  const [gender, setGender] = useState('Anyone');
  const [smokingPreference, setSmokingPreference] = useState('Not Allowed');
  const [drinkingPreference, setDrinkingPreference] = useState('Not Allowed');
  
  // Specific requirements booleans
  const [pets, setPets] = useState(false);
  const [parkingRequired, setParkingRequired] = useState(false);
  const [attachedBathroomRequired, setAttachedBathroomRequired] = useState(false);
  const [balconyRequired, setBalconyRequired] = useState(false);
  const [kitchenRequired, setKitchenRequired] = useState(false);
  const [securityRequired, setSecurityRequired] = useState(false);
  
  const [preferredOccupancy, setPreferredOccupancy] = useState('Single');
  const [nearbyPreference, setNearbyPreference] = useState([]);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current profile requirements if any
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profiles/my-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.profile) {
          const { profile } = data;
          setPreferredLocation(profile.preferredLocation || '');
          setPreferredLocality(profile.preferredLocality || '');
          setBudgetMin(profile.budgetMin || '');
          setBudgetMax(profile.budgetMax || '');
          setPreferredRoomType(profile.preferredRoomType || 'Single Room');
          setFurnishingPreference(profile.furnishingPreference || 'Semi Furnished');
          setRequiredAmenities(profile.requiredAmenities || []);
          setFoodPreference(profile.foodPreference || 'Both');
          setGender(profile.gender || 'Anyone');
          setSmokingPreference(profile.smokingPreference || 'Not Allowed');
          setDrinkingPreference(profile.drinkingPreference || 'Not Allowed');
          
          setPets(!!profile.pets);
          setParkingRequired(!!profile.parkingRequired);
          setAttachedBathroomRequired(!!profile.attachedBathroomRequired);
          setBalconyRequired(!!profile.balconyRequired);
          setKitchenRequired(!!profile.kitchenRequired);
          setSecurityRequired(!!profile.securityRequired);

          setPreferredOccupancy(profile.preferredOccupancy || 'Single');
          setNearbyPreference(profile.nearbyPreference || []);

          // Format date for date input (YYYY-MM-DD)
          if (profile.moveInDate) {
            const date = new Date(profile.moveInDate);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            setMoveInDate(`${yyyy}-${mm}-${dd}`);
          }
        }
      } catch (err) {
        console.error('Error fetching profile requirements:', err.message);
      } finally {
        setFetching(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleAmenityToggle = (amenity) => {
    setRequiredAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleNearbyToggle = (facility) => {
    setNearbyPreference(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const validateStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!preferredLocation || !preferredLocality || !budgetMin || !budgetMax || !moveInDate) {
        setErrorMsg('Please fill in all location and budget details.');
        return false;
      }
      const min = Number(budgetMin);
      const max = Number(budgetMax);
      if (min < 0 || max < 0) {
        setErrorMsg('Budget limits cannot be negative.');
        return false;
      }
      if (max < min) {
        setErrorMsg('Maximum budget cannot be less than minimum budget.');
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
    setSuccessMsg('');

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          preferredLocation,
          preferredLocality,
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax),
          moveInDate,
          preferredRoomType,
          furnishingPreference,
          requiredAmenities,
          foodPreference,
          gender,
          smokingPreference,
          drinkingPreference,
          pets,
          parkingRequired,
          attachedBathroomRequired,
          balconyRequired,
          kitchenRequired,
          securityRequired,
          preferredOccupancy,
          nearbyPreference
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Your requirements profile has been updated!');
        setTimeout(() => {
          navigate('/tenant-dashboard');
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Failed to update preferences');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '10px' }}>
        <Loader className="spin" size={32} style={{ color: '#2563EB' }} />
        <span>Loading preferences...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '60px' }} className="fade-in">
      <Link to="/tenant-dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 700,
        marginBottom: '24px',
        transition: 'var(--transition-smooth)'
      }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-card" style={{ padding: '40px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '32px' }}>
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
              <UserCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Requirements Profile</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Define search preferences for AI matching</p>
            </div>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '8px' }}>
            Step {step} of 3
          </span>
        </div>

        {/* Step Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', marginBottom: '36px', overflow: 'hidden' }}>
          <div style={{ width: step >= 1 ? '33.3%' : '0%', height: '100%', backgroundColor: '#2563EB', transition: 'var(--transition-smooth)' }} />
          <div style={{ width: step >= 2 ? '33.3%' : '0%', height: '100%', backgroundColor: '#2563EB', transition: 'var(--transition-smooth)' }} />
          <div style={{ width: step >= 3 ? '33.4%' : '0%', height: '100%', backgroundColor: '#2563EB', transition: 'var(--transition-smooth)' }} />
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
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

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            color: 'var(--success)',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '24px',
            fontWeight: 550
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Location and budgets */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Preferred City *</label>
                  <select
                    className="form-control form-select"
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    required
                  >
                    <option value="">Select City</option>
                    {INDIAN_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Locality *</label>
                  <input
                    type="text"
                    placeholder="e.g. HSR Layout, Sector 2"
                    className="form-control"
                    value={preferredLocality}
                    onChange={(e) => setPreferredLocality(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Minimum Budget *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700 }}>₹</span>
                    <input
                      type="number"
                      placeholder="10000"
                      className="form-control"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      style={{ paddingLeft: '32px', width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Budget *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700 }}>₹</span>
                    <input
                      type="number"
                      placeholder="20000"
                      className="form-control"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      style={{ paddingLeft: '32px', width: '100%' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Move-in Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Preferences & Habits */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Preferred Room Type *</label>
                  <select
                    className="form-control form-select"
                    value={preferredRoomType}
                    onChange={(e) => setPreferredRoomType(e.target.value)}
                    required
                  >
                    {['Single Room', 'Shared Room', 'Private Room', '1 RK', '1 BHK', '2 BHK'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Furnishing *</label>
                  <select
                    className="form-control form-select"
                    value={furnishingPreference}
                    onChange={(e) => setFurnishingPreference(e.target.value)}
                    required
                  >
                    {['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Occupancy preference *</label>
                  <select
                    className="form-control form-select"
                    value={preferredOccupancy}
                    onChange={(e) => setPreferredOccupancy(e.target.value)}
                    required
                  >
                    {['Single', 'Double', 'Triple'].map(oc => (
                      <option key={oc} value={oc}>{oc}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Diet / Food preference *</label>
                  <select
                    className="form-control form-select"
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value)}
                    required
                  >
                    {['Veg Only', 'Non-Veg Allowed', 'Both'].map(fd => (
                      <option key={fd} value={fd}>{fd}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Smoking preference *</label>
                  <select className="form-control form-select" value={smokingPreference} onChange={(e) => setSmokingPreference(e.target.value)}>
                    <option value="Not Allowed">Not Allowed</option>
                    <option value="Allowed">Allowed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Drinking preference *</label>
                  <select className="form-control form-select" value={drinkingPreference} onChange={(e) => setDrinkingPreference(e.target.value)}>
                    <option value="Not Allowed">Not Allowed</option>
                    <option value="Allowed">Allowed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender Preference *</label>
                  <select className="form-control form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Anyone">Anyone</option>
                    <option value="Boys">Male (Boys)</option>
                    <option value="Girls">Female (Girls)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Checklists */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Boolean specifications */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="form-label">Mandatory Flat Requirements</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={attachedBathroomRequired} onChange={(e) => setAttachedBathroomRequired(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span>Attached Bathroom</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={balconyRequired} onChange={(e) => setBalconyRequired(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span>Private Balcony</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={kitchenRequired} onChange={(e) => setKitchenRequired(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span>Kitchen Access</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={parkingRequired} onChange={(e) => setParkingRequired(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span>Parking Space</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={securityRequired} onChange={(e) => setSecurityRequired(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span>CCTV/Security Guard</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={pets} onChange={(e) => setPets(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <span>Pet Friendly</span>
                  </label>
                </div>
              </div>

              {/* Amenities checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="form-label">Amenities Required</label>
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
                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={requiredAmenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nearby list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    <label key={facility} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={nearbyPreference.includes(facility)}
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

            {step < 3 ? (
              <button key="btn-next" type="button" onClick={handleNext} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button key="btn-submit" type="submit" className="btn btn-accent" style={{ padding: '12px 30px' }} disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="spin" size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving requirements...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save Preferences
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

export default TenantProfile;

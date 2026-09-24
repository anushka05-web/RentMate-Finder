import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { INDIAN_CITIES } from '../utils/constants';
import { Search, MapPin, Sparkles, AlertCircle, ArrowRight, Home, ShieldAlert, Heart, Sliders, X, Check, Coffee, User, Info, Eye } from 'lucide-react';
import { CardSkeleton } from '../components/SkeletonLoader';

const AMENITIES_LIST = [
  'WiFi', 'AC', 'Cooler', 'Fan', 'Refrigerator', 'Microwave', 'RO Water', 'TV', 
  'Study Table', 'Wardrobe', 'Parking', 'Lift', 'Power Backup', 'Attached Bathroom', 
  'Balcony', 'Kitchen', 'Laundry', 'Housekeeping', 'Gym', 'Swimming Pool', 
  'Security Guard', 'CCTV', 'Pet Friendly'
];

const NEARBY_LIST = ['Metro', 'Bus Stop', 'Hospital', 'College', 'Mall', 'Office', 'Market'];

const Listings = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  
  // Filtering & Sorting states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterLocation, setFilterLocation] = useState(searchParams.get('city') || '');
  const [filterRent, setFilterRent] = useState(searchParams.get('budget') || '');
  const [filterRoomType, setFilterRoomType] = useState(searchParams.get('type') || '');
  const [filterFurnishing, setFilterFurnishing] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterFood, setFilterFood] = useState('');
  const [filterOccupancy, setFilterOccupancy] = useState('');
  const [filterAmenities, setFilterAmenities] = useState([]);
  const [filterNearby, setFilterNearby] = useState([]);
  const [sortBy, setSortBy] = useState('compatibility'); // 'compatibility', 'rent_low', 'newest'

  // Saved rooms UI-only state
  const [savedListingIds, setSavedListingIds] = useState([]);

  // Modal detailed display state
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const queryParams = new URLSearchParams();
      if (filterLocation) queryParams.append('location', filterLocation);
      if (filterRent) queryParams.append('maxRent', filterRent);
      if (filterRoomType) queryParams.append('roomType', filterRoomType);

      const res = await fetch(`${API_URL}/listings?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      } else {
        setErrorMsg(data.message || 'Failed to fetch room listings');
      }
    } catch (err) {
      setErrorMsg('Error connecting to matching server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings();
    }
  }, [token, filterLocation, filterRent, filterRoomType]);

  const handleAmenityToggle = (amenity) => {
    setFilterAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleNearbyToggle = (facility) => {
    setFilterNearby(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const handleResetFilters = () => {
    setFilterLocation('');
    setFilterRent('');
    setFilterRoomType('');
    setFilterFurnishing('');
    setFilterGender('');
    setFilterFood('');
    setFilterOccupancy('');
    setFilterAmenities([]);
    setFilterNearby([]);
    setSortBy('compatibility');
  };

  const handleSendInterest = async (listingId) => {
    setActionLoading(prev => ({ ...prev, [listingId]: true }));
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/interests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ listingId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchListings();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message || 'Failed to submit interest');
      }
    } catch (err) {
      setErrorMsg('Error submitting request');
    } finally {
      setActionLoading(prev => ({ ...prev, [listingId]: false }));
    }
  };

  const toggleSaveListing = (id) => {
    setSavedListingIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Perform advanced client-side filtering and sorting
  const getFilteredAndSortedListings = () => {
    let result = [...listings];

    if (filterFurnishing) {
      result = result.filter(item => item.furnishing === filterFurnishing);
    }
    if (filterGender) {
      result = result.filter(item => item.genderPreference === filterGender);
    }
    if (filterFood) {
      result = result.filter(item => item.foodPreference === filterFood);
    }
    if (filterOccupancy) {
      result = result.filter(item => item.occupancy === filterOccupancy);
    }
    if (filterAmenities.length > 0) {
      result = result.filter(item => 
        filterAmenities.every(am => (item.amenities || []).includes(am))
      );
    }
    if (filterNearby.length > 0) {
      result = result.filter(item => 
        filterNearby.every(nb => (item.nearby || []).includes(nb))
      );
    }

    // Sort
    if (sortBy === 'compatibility') {
      result.sort((a, b) => {
        const scoreA = a.compatibility?.score || 0;
        const scoreB = b.compatibility?.score || 0;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'rent_low') {
      result.sort((a, b) => a.rent - b.rent);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  };

  const processedListings = getFilteredAndSortedListings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="fade-in">
      
      {/* Search Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }} className="gradient-text">Browse Rooms</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find and request listings in your target city based on compatibility</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="btn btn-secondary"
            style={{ borderRadius: '12px', padding: '10px 18px', gap: '6px' }}
          >
            <Sliders size={16} /> {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
          </button>

          <select
            className="form-control form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '220px', borderRadius: '12px', padding: '10px 18px' }}
          >
            <option value="compatibility">Highest Compatibility</option>
            <option value="rent_low">Lowest Rent</option>
            <option value="newest">Newest Listed</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1.5px solid rgba(16, 185, 129, 0.15)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1.5px solid rgba(239, 68, 68, 0.15)',
          color: 'var(--danger)',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Left Side Filter Panel */}
        {sidebarOpen && (
          <div className="glass-card" style={{
            width: '280px',
            flexShrink: 0,
            padding: '24px',
            borderRadius: '20px',
            position: 'sticky',
            top: '96px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Filters</h3>
              <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Reset All
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <select className="form-control form-select" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: '10px 14px', fontSize: '13.5px' }}>
                <option value="">All Cities</option>
                {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Budget (INR)</label>
              <input
                type="number"
                placeholder="Budget Limit"
                className="form-control"
                value={filterRent}
                onChange={(e) => setFilterRent(e.target.value)}
                style={{ padding: '10px 14px', fontSize: '13.5px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Room Type</label>
              <select className="form-control form-select" value={filterRoomType} onChange={(e) => setFilterRoomType(e.target.value)} style={{ padding: '10px 14px', fontSize: '13.5px' }}>
                <option value="">All Types</option>
                {['Single Room', 'Shared Room', 'Private Room', '1 RK', '1 BHK', '2 BHK'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Furnishing</label>
              <select className="form-control form-select" value={filterFurnishing} onChange={(e) => setFilterFurnishing(e.target.value)} style={{ padding: '10px 14px', fontSize: '13.5px' }}>
                <option value="">All Furnishing</option>
                {['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gender Preference</label>
              <select className="form-control form-select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)} style={{ padding: '10px 14px', fontSize: '13.5px' }}>
                <option value="">Anyone</option>
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
              </select>
            </div>

            {/* Checklist Amenities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label">Amenities</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
                {AMENITIES_LIST.map(am => (
                  <label key={am} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={filterAmenities.includes(am)} onChange={() => handleAmenityToggle(am)} style={{ width: '14px', height: '14px' }} />
                    <span>{am}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Proximity nearby */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label">Nearby Transit</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                {NEARBY_LIST.map(f => (
                  <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={filterNearby.includes(f)} onChange={() => handleNearbyToggle(f)} style={{ width: '14px', height: '14px' }} />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Right Listings Cards Grid */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : processedListings.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
              <Home size={44} style={{ margin: '0 auto 16px auto', color: 'var(--text-light)', opacity: 0.6 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>No Rooms Match</h3>
              <p>Try broadening filter options or target city search parameters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {processedListings.map((room) => {
                const isSaved = savedListingIds.includes(room._id);
                return (
                  <div className="glass-card" key={room._id} style={{
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1.5px solid var(--border-color)'
                  }}>
                    {/* Visual photo frame */}
                    <div style={{
                      height: '190px',
                      backgroundImage: `url(${room.photos && room.photos[0] ? room.photos[0] : '/rooms/default.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: 'var(--bg-tertiary)',
                      position: 'relative'
                    }}>
                      <button
                        onClick={() => toggleSaveListing(room._id)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(15, 23, 42, 0.6)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          color: isSaved ? '#EF4444' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                        title="Save Listing"
                      >
                        <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
                      </button>

                      {room.compatibility && (
                        <div style={{
                          position: 'absolute',
                          bottom: '16px',
                          left: '16px',
                          backgroundColor: 'rgba(9, 13, 22, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <Sparkles size={12} style={{ color: '#10B981' }} />
                          {room.compatibility.score}% Match
                        </div>
                      )}
                    </div>

                    {/* Details content */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {room.location} • {room.locality}
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {room.title || `${room.roomType} room`}
                        </h4>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Owner: <strong>{room.owner?.name || 'Landlord'}</strong>
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '19px', fontWeight: 800, color: '#2563EB' }}>
                          ₹{room.rent.toLocaleString('en-IN')}<span style={{ fontSize: '12px', color: 'var(--text-light)' }}>/mo</span>
                        </span>
                        <span style={{ fontSize: '11px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {room.roomType}
                        </span>
                      </div>

                      {room.compatibility?.explanation && (
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4,
                          background: 'var(--bg-tertiary)',
                          padding: '10px',
                          borderRadius: '8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '38px',
                          borderLeft: '2.5px solid #2563EB'
                        }} title={room.compatibility.explanation}>
                          {room.compatibility.explanation}
                        </p>
                      )}

                      {/* Amenities checklist row */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', height: '22px', overflow: 'hidden' }}>
                          {room.amenities.slice(0, 3).map(am => (
                            <span key={am} style={{ fontSize: '10.5px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px' }}>
                              {am}
                            </span>
                          ))}
                          {room.amenities.length > 3 && <span style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>+{room.amenities.length - 3} more</span>}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '11.5px', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
                        <span>From: {new Date(room.availableFrom).toLocaleDateString('en-GB')}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => setSelectedRoomDetails(room)}
                          className="btn btn-secondary"
                          style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px' }}
                          title="View Details"
                        >
                          <Info size={14} /> Details
                        </button>

                        {room.interestStatus === null ? (
                          <button
                            onClick={() => handleSendInterest(room._id)}
                            className="btn btn-primary"
                            style={{ flexGrow: 1, padding: '10px', borderRadius: '10px', fontSize: '12.5px' }}
                            disabled={actionLoading[room._id]}
                          >
                            {actionLoading[room._id] ? 'Sending...' : 'Send Interest'}
                          </button>
                        ) : room.interestStatus === 'pending' ? (
                          <span className="badge badge-pending" style={{ flexGrow: 1, justifycontent: 'center' }}>Pending</span>
                        ) : room.interestStatus === 'accepted' ? (
                          <div style={{ display: 'flex', gap: '8px', flexGrow: 1 }}>
                            <span className="badge badge-success" style={{ flexGrow: 1, justifycontent: 'center' }}>Accepted</span>
                            <Link to="/chat" className="btn btn-primary" style={{ padding: '10px 14px', borderRadius: '10px', textDecoration: 'none' }}>
                              Chat
                            </Link>
                          </div>
                        ) : (
                          <span className="badge badge-danger" style={{ flexGrow: 1, justifycontent: 'center' }}>Declined</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* 4. Room Details Drawer Overlay (Modal) */}
      {selectedRoomDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setSelectedRoomDetails(null)}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderLeft: '1.5px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            overflowY: 'auto',
            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase' }}>Property Detail View</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedRoomDetails.title}</h3>
              </div>
              <button onClick={() => setSelectedRoomDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Slider/Photos */}
            <div style={{
              height: '240px',
              backgroundImage: `url(${selectedRoomDetails.photos?.[0] || '/rooms/default.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-tertiary)'
            }} />

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="form-label">Description</span>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selectedRoomDetails.description}</p>
            </div>

            {/* Price detail info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Monthly Rent</span>
                <strong style={{ fontSize: '18px', color: '#2563EB' }}>₹{selectedRoomDetails.rent.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Security Deposit</span>
                <strong style={{ fontSize: '18px' }}>₹{selectedRoomDetails.securityDeposit.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Rules enums */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="form-label">Rules & Guidelines</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>Food Preference: <strong>{selectedRoomDetails.foodPreference}</strong></div>
                <div>Gender Allowed: <strong>{selectedRoomDetails.genderPreference}</strong></div>
                <div>Smoking: <strong>{selectedRoomDetails.smoking}</strong></div>
                <div>Drinking: <strong>{selectedRoomDetails.drinking}</strong></div>
                <div>Guests: <strong>{selectedRoomDetails.guests}</strong></div>
                <div>Max Occupancy: <strong>{selectedRoomDetails.occupancy}</strong></div>
              </div>
            </div>

            {/* Amenities list */}
            {selectedRoomDetails.amenities && selectedRoomDetails.amenities.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="form-label">Available Amenities</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedRoomDetails.amenities.map(am => (
                    <span key={am} style={{ fontSize: '11px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Proximity transit */}
            {selectedRoomDetails.nearby && selectedRoomDetails.nearby.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="form-label">Nearby Proximity</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedRoomDetails.nearby.map(nb => (
                    <span key={nb} style={{ fontSize: '11px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                      Near {nb}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Listings;

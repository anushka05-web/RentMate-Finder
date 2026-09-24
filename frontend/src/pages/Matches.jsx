import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { Sparkles, MapPin, Compass, ArrowRight, Check, X, ShieldCheck, Heart, User, ShieldAlert } from 'lucide-react';
import { CardSkeleton } from '../components/SkeletonLoader';

const Matches = () => {
  const { token, user } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMatchesAndProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Tenant Profile Requirements
      const profileRes = await fetch(`${API_URL}/profiles/my-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success && profileData.profile) {
        setTenantProfile(profileData.profile);
      }

      // 2. Fetch Listings (which returns compatibility scores and request statuses)
      const listingsRes = await fetch(`${API_URL}/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listingsData = await listingsRes.json();
      if (listingsData.success) {
        // Filter listings that have compatibility scores computed
        const scoredListings = (listingsData.listings || []).filter(room => room.compatibility);
        setMatches(scoredListings);
      } else {
        setErrorMsg(listingsData.message || 'Failed to fetch match recommendations');
      }
    } catch (err) {
      setErrorMsg('Error connecting to the AI matchmaking server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMatchesAndProfile();
    }
  }, [token]);

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
        fetchMatchesAndProfile();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message || 'Failed to submit interest request');
      }
    } catch (err) {
      setErrorMsg('Error communicating request');
    } finally {
      setActionLoading(prev => ({ ...prev, [listingId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="fade-in">
        <div className="skeleton" style={{ height: '40px', width: '30%', borderRadius: '8px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {[1, 2].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }} className="fade-in">
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }} className="gradient-text">AI Compatibility Matches</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Premium room vacancies scored and ordered according to your habit, location, and budget preferences</p>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
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
          border: '1px solid rgba(239, 68, 68, 0.15)',
          color: 'var(--danger)',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {errorMsg}
        </div>
      )}

      {!tenantProfile ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
          <ShieldAlert size={56} style={{ margin: '0 auto 16px auto', color: 'var(--warning)', opacity: 0.8 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Preferences Setup Required</h3>
          <p style={{ marginBottom: '24px' }}>In order to calculate compatibility scores and display matching results, you must set up your requirements profile first.</p>
          <Link to="/tenant-profile" className="btn btn-primary" style={{ textDecoration: 'none', borderRadius: '12px' }}>
            Set Up Requirement Profile
          </Link>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
          <Compass size={56} style={{ margin: '0 auto 16px auto', color: 'var(--text-light)', opacity: 0.6 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Match Results</h3>
          <p>No listings are currently available in the platform database. Check back later or adjust your preferred city location.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {matches.map((room) => {
            // Calculate alignments
            const isLocationMatch = tenantProfile.preferredLocation.toLowerCase() === room.location.toLowerCase();
            const isBudgetMatch = room.rent >= tenantProfile.budgetMin && room.rent <= tenantProfile.budgetMax;
            const isMoveInMatch = new Date(room.availableFrom) <= new Date(tenantProfile.moveInDate);
            
            // Overlapping amenities list
            const matchedAmenities = (tenantProfile.requiredAmenities || []).filter(am => (room.amenities || []).includes(am));

            return (
              <div className="glass-card" key={room._id} style={{
                padding: 0,
                overflow: 'hidden',
                borderRadius: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-md)'
              }}>
                {/* Visual Image Block */}
                <div style={{
                  flex: '1 1 300px',
                  height: '320px',
                  backgroundImage: `url(${room.photos && room.photos[0] ? room.photos[0] : '/rooms/default.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'var(--bg-tertiary)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: room.compatibility.score >= 80 ? '#10B981' : room.compatibility.score >= 50 ? '#F59E0B' : '#EF4444',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Sparkles size={14} />
                    {room.compatibility.score}% Compatibility
                  </div>
                </div>

                {/* Details Block */}
                <div style={{ flex: '2 1 400px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {room.location} • {room.locality}
                      </span>
                      <h3 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{room.title || `${room.roomType} room`}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Owner: <strong>{room.owner.name}</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '24px', fontWeight: 900, color: '#2563EB' }}>
                        ₹{room.rent.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>/month</span>
                    </div>
                  </div>

                  {/* Proportional metrics check */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    borderTop: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '16px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      {isLocationMatch ? <Check size={18} style={{ color: '#10B981' }} /> : <X size={18} style={{ color: '#EF4444' }} />}
                      <span>Location: {isLocationMatch ? 'Aligned' : 'Mismatch'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      {isBudgetMatch ? <Check size={18} style={{ color: '#10B981' }} /> : <X size={18} style={{ color: '#EF4444' }} />}
                      <span>Budget: {isBudgetMatch ? 'Within Range' : 'Exceeds'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      {isMoveInMatch ? <Check size={18} style={{ color: '#10B981' }} /> : <X size={18} style={{ color: '#EF4444' }} />}
                      <span>Move-in: {isMoveInMatch ? 'Compatible' : 'Delayed'}</span>
                    </div>
                  </div>

                  {/* AI match explanation text */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '14px', borderLeft: '4px solid #2563EB' }}>
                    <h5 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '0.05em' }}>AI Matching Assessment</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{room.compatibility.explanation}</p>
                  </div>

                  {/* Overlapping Amenities */}
                  {matchedAmenities.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Matching Amenities ({matchedAmenities.length})</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {matchedAmenities.map(am => (
                          <span key={am} style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={10} /> {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interest requests footer */}
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      Available from: {new Date(room.availableFrom).toLocaleDateString('en-GB')}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {room.interestStatus === null ? (
                        <button
                          onClick={() => handleSendInterest(room._id)}
                          className="btn btn-primary"
                          style={{ borderRadius: '12px', padding: '10px 20px' }}
                          disabled={actionLoading[room._id]}
                        >
                          {actionLoading[room._id] ? 'Registering...' : 'Send Interest Request'}
                        </button>
                      ) : room.interestStatus === 'pending' ? (
                        <span className="badge badge-pending">Request Pending</span>
                      ) : room.interestStatus === 'accepted' ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="badge badge-success">Match Connected</span>
                          <Link to="/chat" className="btn btn-primary" style={{ padding: '8px 14px', borderRadius: '10px', textDecoration: 'none' }}>
                            <MessageSquare size={14} /> Chat
                          </Link>
                        </div>
                      ) : (
                        <span className="badge badge-danger">Declined</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;

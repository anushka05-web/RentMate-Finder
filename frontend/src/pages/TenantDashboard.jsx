import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { Compass, User, Clock, CheckCircle2, MessageSquare, Sparkles, AlertCircle, Calendar, Heart, ShieldAlert, ArrowRight } from 'lucide-react';
import { MetricsSkeleton, TableSkeleton } from '../components/SkeletonLoader';

const TenantDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [interests, setInterests] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [matchesCount, setMatchesCount] = useState(0);

  // Check if profile exists and get details
  const checkProfileAndMatches = async () => {
    try {
      // 1. Fetch requirements profile
      const res = await fetch(`${API_URL}/profiles/my-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setHasProfile(true);
        setProfileData(data.profile);

        // 2. Fetch matches to count high compatibility
        const listingsRes = await fetch(`${API_URL}/listings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const listingsData = await listingsRes.json();
        if (listingsData.success) {
          const scored = (listingsData.listings || []).filter(room => room.compatibility);
          setMatchesCount(scored.length);
        }
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error('Error checking profile:', err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch Sent Interests
  const fetchInterests = async () => {
    try {
      const res = await fetch(`${API_URL}/interests/tenant`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInterests(data.interests);
      }
    } catch (err) {
      console.error('Error fetching sent interests:', err.message);
    } finally {
      setInterestsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      checkProfileAndMatches();
      fetchInterests();
    }
  }, [token]);

  const activeRequestsCount = interests.length;
  const acceptedMatchesCount = interests.filter(i => i.status === 'accepted').length;

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="fade-in">
        <div className="skeleton" style={{ height: '40px', width: '30%', borderRadius: '6px' }} />
        <MetricsSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }} className="fade-in">
      
      {/* 1. Welcome Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
        padding: '36px',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div>
          <span style={{ fontSize: '11px', background: 'rgba(37,99,235,0.08)', color: '#2563EB', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tenant Workspace</span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }} className="gradient-text">Welcome, {user?.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Discover matching flatmates and premium rooms matching your criteria.</p>
        </div>

        {hasProfile && profileData && (
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Calendar size={20} style={{ color: '#2563EB' }} />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Move-In Target</span>
              <strong style={{ fontSize: '14.5px' }}>{new Date(profileData.moveInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Profiles Missing Warning */}
      {!hasProfile && (
        <div className="glass-card" style={{
          padding: '36px',
          borderLeft: '5px solid #7C3AED',
          background: 'linear-gradient(135deg, var(--card-bg), rgba(124, 58, 237, 0.02))',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#7C3AED' }}>
            <AlertCircle size={24} />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Profile Setup Pending</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            You haven't defined your search preferences (budget, locality, habits). Create your requirements profile to let Gemini calculate roommate compatibility scores.
          </p>
          <Link to="/tenant-profile" className="btn btn-primary" style={{
            alignSelf: 'flex-start',
            textDecoration: 'none',
            borderRadius: '12px'
          }}>
            Create Preference Profile
          </Link>
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compatibility Matches</span>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{matchesCount} Available</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sent Room Requests</span>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{activeRequestsCount} Pending</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted Matches</span>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{acceptedMatchesCount} Connected</h3>
          </div>
        </div>

      </div>

      {/* 3. Split Layout: Quick Actions & Request List */}
      <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Quick Actions Panel */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/tenant-profile" className="glass-card" style={{ textDecoration: 'none', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(37,99,235,0.06)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#2563EB' }}>
                <User size={20} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)', display: 'block' }}>Create Preference Profile</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Modify target budgets or habits</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-light)' }} />
            </Link>

            <Link to="/listings" className="glass-card" style={{ textDecoration: 'none', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(124,58,237,0.06)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#7C3AED' }}>
                <Compass size={20} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)', display: 'block' }}>Browse Rooms</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Explore listings with AI scores</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-light)' }} />
            </Link>

            <Link to="/matches" className="glass-card" style={{ textDecoration: 'none', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.06)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#10B981' }}>
                <Sparkles size={20} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)', display: 'block' }}>AI Compatibility Matches</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Inspect matching overlaps</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-light)' }} />
            </Link>

            <Link to="/chat" className="glass-card" style={{ textDecoration: 'none', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.06)', display: 'flex', alignItems: 'center', justifycontent: 'center', color: '#EF4444' }}>
                <MessageSquare size={20} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: '14.5px', color: 'var(--text-primary)', display: 'block' }}>Chats</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Coordinate room leases</span>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-light)' }} />
            </Link>
          </div>
        </div>

        {/* Room Requests sent */}
        <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Sent Match Requests</h3>
          
          {interestsLoading ? <TableSkeleton /> : interests.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Clock size={40} style={{ margin: '0 auto 12px auto', color: 'var(--text-light)', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No requests sent yet</p>
              <p style={{ fontSize: '12.5px', marginTop: '4px' }}>Browse matching listings and send interest requests.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {interests.map((req) => (
                <div className="glass-card" key={req._id} style={{
                  padding: '20px',
                  borderRadius: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: `5px solid ${req.status === 'accepted' ? '#10B981' : req.status === 'declined' ? '#EF4444' : '#F59E0B'}`
                }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase' }}>{req.listing.location}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>{req.listing.title || `${req.listing.roomType} room`}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Owner: <strong>{req.listing.owner.name}</strong> • Phone: {req.listing.owner.phone}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontWeight: 800, color: '#2563EB', fontSize: '14.5px' }}>
                        ₹{req.listing.rent.toLocaleString('en-IN')}/mo
                      </span>
                      {req.score !== null && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: req.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : req.score >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: req.score >= 80 ? '#10B981' : req.score >= 50 ? '#F59E0B' : '#EF4444',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {req.score}% AI Match
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${req.status === 'accepted' ? 'badge-success' : req.status === 'declined' ? 'badge-danger' : 'badge-pending'}`}>
                      {req.status}
                    </span>
                    {req.status === 'accepted' && (
                      <Link
                        to="/chat"
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', fontSize: '12.5px', borderRadius: '8px', textDecoration: 'none' }}
                      >
                        <MessageSquare size={13} /> Chat
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TenantDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { PlusCircle, Edit2, Trash2, Home, CheckCircle2, Clock, Check, X, AlertCircle, MessageSquare, MapPin, Eye, Sparkles, User } from 'lucide-react';
import { MetricsSkeleton, TableSkeleton } from '../components/SkeletonLoader';

const OwnerDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Interested tenant modal drawer state
  const [selectedListingForTenants, setSelectedListingForTenants] = useState(null);
  const [interestedTenants, setInterestedTenants] = useState([]);

  // Fetch Owner listings
  const fetchListings = async () => {
    try {
      const res = await fetch(`${API_URL}/listings/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error('Error fetching listings:', err.message);
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch Received interests
  const fetchInterests = async () => {
    try {
      const res = await fetch(`${API_URL}/interests/owner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInterests(data.interests);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error('Error fetching interests:', err.message);
    } finally {
      setLoadingInterests(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings();
      fetchInterests();
    }
  }, [token]);

  // Update tenant candidates list if modal listing changes
  useEffect(() => {
    if (selectedListingForTenants) {
      const candidates = interests.filter(i => i.listing._id === selectedListingForTenants._id || i.listing === selectedListingForTenants._id);
      setInterestedTenants(candidates);
    }
  }, [selectedListingForTenants, interests]);

  // Toggle listing filled status
  const handleToggleFilled = async (id) => {
    try {
      const res = await fetch(`${API_URL}/listings/${id}/fill`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchListings();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Error updating listing status');
    }
  };

  // Delete listing
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Listing deleted successfully');
        fetchListings();
        fetchInterests();
        if (selectedListingForTenants && selectedListingForTenants._id === id) {
          setSelectedListingForTenants(null);
        }
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Error deleting listing');
    }
  };

  // Accept Request
  const handleAcceptInterest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/interests/${id}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Interest request accepted! Real-time chat is now open.');
        fetchInterests();
        fetchListings();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Error accepting request');
    }
  };

  // Decline Request
  const handleDeclineInterest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/interests/${id}/decline`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Interest request declined.');
        fetchInterests();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Error declining request');
    }
  };

  const totalListings = listings.length;
  const activeRooms = listings.filter(l => !l.isFilled).length;
  const filledRooms = listings.filter(l => l.isFilled).length;
  const pendingRequests = interests.filter(i => i.status === 'pending').length;
  const acceptedMatches = interests.filter(i => i.status === 'accepted').length;

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
          <span style={{ fontSize: '11px', background: 'rgba(37,99,235,0.08)', color: '#2563EB', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner Workspace</span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }} className="gradient-text">Welcome, {user?.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>Post vacancies, review compatibility matches, and approve chat connections.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/create-listing" className="btn btn-primary" style={{ textDecoration: 'none', borderRadius: '12px' }}>
            <PlusCircle size={16} /> Post New Room
          </Link>
        </div>
      </div>

      {/* Messages */}
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

      {/* 2. Owner Analytics Grid */}
      {loadingListings || loadingInterests ? <MetricsSkeleton /> : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '24px'
        }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Home size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Listings</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{totalListings}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Requests</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{pendingRequests}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted Matches</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{acceptedMatches}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={24} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filled Rooms</span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{filledRooms}</h3>
            </div>
          </div>
        </div>
      )}

      {/* 3. Quick Actions Links */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/create-listing" className="btn btn-secondary" style={{ textDecoration: 'none', borderRadius: '10px', fontSize: '13px' }}>
          <PlusCircle size={14} /> Post New Room
        </Link>
        <a href="#listings-table-section" className="btn btn-secondary" style={{ textDecoration: 'none', borderRadius: '10px', fontSize: '13px' }}>
          <Home size={14} /> Manage Listings
        </a>
        <Link to="/chat" className="btn btn-secondary" style={{ textDecoration: 'none', borderRadius: '10px', fontSize: '13px' }}>
          <MessageSquare size={14} /> Messages
        </Link>
        <Link to="/notifications" className="btn btn-secondary" style={{ textDecoration: 'none', borderRadius: '10px', fontSize: '13px' }}>
          <AlertCircle size={14} /> Notifications
        </Link>
      </div>

      {/* 4. Listings Cards Table Grid */}
      <div id="listings-table-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Manage Room Listings</h2>
        
        {loadingListings ? <TableSkeleton /> : listings.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
            <Home size={44} style={{ margin: '0 auto 16px auto', color: 'var(--text-light)', opacity: 0.6 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>No Rooms Posted</h3>
            <p style={{ fontSize: '13.5px' }}>Post details and rent pricing to generate tenant interest.</p>
            <Link to="/create-listing" className="btn btn-primary" style={{ marginTop: '16px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px' }}>
              Create Listing
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {listings.map((room) => {
              // Calculate request counts
              const candCount = interests.filter(i => i.listing._id === room._id || i.listing === room._id).length;

              return (
                <div className="glass-card" key={room._id} style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1.5px solid var(--border-color)'
                }}>
                  {/* Photo frame */}
                  <div style={{
                    height: '180px',
                    backgroundImage: `url(${room.photos && room.photos[0] ? room.photos[0] : '/rooms/default.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'var(--bg-tertiary)',
                    position: 'relative'
                  }}>
                    <span className={`badge ${room.isFilled ? 'badge-danger' : 'badge-success'}`} style={{ position: 'absolute', top: '16px', right: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {room.isFilled ? 'Filled' : 'Available'}
                    </span>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {room.location} • {room.locality}
                      </span>
                      <h4 style={{ fontSize: '17px', fontWeight: 800, marginTop: '2px' }}>{room.title || `${room.roomType} room`}</h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB' }}>
                        ₹{room.rent.toLocaleString('en-IN')}<span style={{ fontSize: '12px', color: 'var(--text-light)' }}>/mo</span>
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deposit: ₹{room.securityDeposit?.toLocaleString('en-IN')}</span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                      {room.address}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-light)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
                      <span>From: {new Date(room.availableFrom).toLocaleDateString('en-GB')}</span>
                      <span style={{ fontWeight: 700, color: candCount > 0 ? '#2563EB' : 'var(--text-light)' }}>{candCount} interested tenants</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <button
                        onClick={() => handleToggleFilled(room._id)}
                        className={`btn ${room.isFilled ? 'btn-secondary' : 'btn-outline'}`}
                        style={{ flex: '1 1 100px', padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}
                      >
                        {room.isFilled ? 'Mark Open' : 'Mark Filled'}
                      </button>

                      <button
                        onClick={() => setSelectedListingForTenants(room)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', gap: '4px' }}
                        title="View Interested Tenants"
                      >
                        <Eye size={12} /> Tenants
                      </button>

                      <Link
                        to={`/edit-listing/${room._id}`}
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', textDecoration: 'none' }}
                        title="Edit Listing"
                      >
                        <Edit2 size={12} />
                      </Link>

                      <button
                        onClick={() => handleDeleteListing(room._id)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}
                        title="Delete Listing"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Interested Tenants Detailed Drawer Overlay */}
      {selectedListingForTenants && (
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
        }} onClick={() => setSelectedListingForTenants(null)}>
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
                <h3 style={{ fontSize: '19px', fontWeight: 800 }}>Interested Tenants</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Room: {selectedListingForTenants.roomType} in {selectedListingForTenants.location}
                </p>
              </div>
              <button onClick={() => setSelectedListingForTenants(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '16px' }}>
                <X size={20} />
              </button>
            </div>

            {interestedTenants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', margin: 'auto 0' }}>
                <Clock size={36} style={{ margin: '0 auto 12px auto', color: 'var(--text-light)', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No requests received yet</p>
                <p style={{ fontSize: '12px' }}>Tenant request submissions for this property will display here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {interestedTenants.map((req) => (
                  <div key={req._id} style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1.5px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} style={{ color: '#2563EB' }} /> {req.tenant.name}
                        </h4>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>Email: {req.tenant.email}</p>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Phone: {req.tenant.phone}</p>
                      </div>

                      {req.score !== null && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: req.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : req.score >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: req.score >= 80 ? '#10B981' : req.score >= 50 ? '#F59E0B' : '#EF4444',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          <Sparkles size={10} /> {req.score}% AI Match
                        </span>
                      )}
                    </div>

                    {req.score !== null && req.explanation && (
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-secondary)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        lineHeight: 1.4
                      }}>
                        <strong>AI Reason:</strong> {req.explanation}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                      <span className={`badge ${req.status === 'accepted' ? 'badge-success' : req.status === 'declined' ? 'badge-danger' : 'badge-pending'}`}>
                        {req.status}
                      </span>

                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleAcceptInterest(req._id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '6px' }}>
                            <Check size={12} /> Accept
                          </button>
                          <button onClick={() => handleDeclineInterest(req._id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '6px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                            <X size={12} /> Decline
                          </button>
                        </div>
                      )}

                      {req.status === 'accepted' && (
                        <Link to="/chat" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '6px', textDecoration: 'none' }}>
                          <MessageSquare size={12} /> Chat
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

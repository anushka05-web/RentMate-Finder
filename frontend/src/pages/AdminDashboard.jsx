import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Users, Home, Clock, Heart, Trash2, ArrowRight, ShieldAlert, AlertCircle, Calendar } from 'lucide-react';
import { MetricsSkeleton, TableSkeleton } from '../components/SkeletonLoader';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'listings'
  
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // 2. Fetch users
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsersList(usersData.users);
      }

      // 3. Fetch listings (all active ones)
      const listingsRes = await fetch(`${API_URL}/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listingsData = await listingsRes.json();
      if (listingsData.success) {
        setListingsList(listingsData.listings);
      }
    } catch (err) {
      setErrorMsg('Error loading admin control panel');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // Handle User Delete
  const handleDeleteUser = async (id, name, role) => {
    if (role === 'admin') {
      alert('Cannot delete administrator accounts');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This will remove all their listings and data.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchAdminData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to delete user');
    }
  };

  // Handle Listing Delete
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room listing?')) {
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
        fetchAdminData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to delete listing');
    }
  };

  const tabButtonStyle = (tabName) => ({
    padding: '10px 24px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    border: 'none',
    transition: 'var(--transition-smooth)',
    backgroundColor: activeTab === tabName ? '#2563EB' : 'var(--bg-tertiary)',
    color: activeTab === tabName ? '#fff' : 'var(--text-secondary)',
    boxShadow: activeTab === tabName ? '0 4px 10px rgba(37,99,235,0.2)' : 'none'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }} className="fade-in">
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }} className="gradient-text">Admin Panel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Supervise RentMate Finder platform accounts, listings, and matching metrics</p>
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

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: '16px', alignSelf: 'flex-start', border: '1.5px solid var(--border-color)' }}>
        <button style={tabButtonStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabButtonStyle('users')} onClick={() => setActiveTab('users')}>Users ({usersList.length})</button>
        <button style={tabButtonStyle('listings')} onClick={() => setActiveTab('listings')}>Listings ({listingsList.length})</button>
      </div>

      {loading ? (
        <div>
          <MetricsSkeleton />
          <TableSkeleton />
        </div>
      ) : (
        <>
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {/* Metric Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Accounts</span>
                    <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{stats.users.total}</h3>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Home size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Rooms</span>
                    <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{stats.listings.active}</h3>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match Requests</span>
                    <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{stats.interests.total}</h3>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(244, 63, 94, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Heart size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Messages</span>
                    <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{stats.messages}</h3>
                  </div>
                </div>
              </div>

              {/* Composition info blocks */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                <div className="glass-card" style={{ borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Platform Composition</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Property Owners</span>
                      <strong>{stats.users.owners}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Room Seeking Tenants</span>
                      <strong>{stats.users.tenants}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Administrators</span>
                      <strong>{stats.users.total - stats.users.owners - stats.users.tenants}</strong>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Listings Overview</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Active Vacancies</span>
                      <strong style={{ color: '#10B981' }}>{stats.listings.active} Available</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Occupied / Filled Rooms</span>
                      <strong style={{ color: '#EF4444' }}>{stats.listings.filled} Filled</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Users List */}
          {activeTab === 'users' && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1.5px solid var(--border-color)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1.5px solid var(--border-color)' }}>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Name</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Email</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Role</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Mobile Phone</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-smooth)' }} className="table-row-hover">
                        <td style={{ padding: '18px 24px', fontWeight: 700 }}>{usr.name}</td>
                        <td style={{ padding: '18px 24px', color: 'var(--text-secondary)' }}>{usr.email}</td>
                        <td style={{ padding: '18px 24px' }}>
                          <span className={`badge ${usr.role === 'admin' ? 'badge-danger' : usr.role === 'owner' ? 'badge-info' : 'badge-success'}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px', color: 'var(--text-secondary)' }}>+91 {usr.phone}</td>
                        <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                          {usr.role !== 'admin' ? (
                            <button
                              onClick={() => handleDeleteUser(usr._id, usr.name, usr.role)}
                              className="btn btn-secondary"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                padding: '6px 12px',
                                color: 'var(--danger)',
                                borderColor: 'rgba(239,68,68,0.1)'
                              }}
                            >
                              <Trash2 size={13} /> Delete Account
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>Platform Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Listings List */}
          {activeTab === 'listings' && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1.5px solid var(--border-color)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1.5px solid var(--border-color)' }}>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Location</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Complete Address</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Rent (INR)</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)' }}>Room Type</th>
                      <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listingsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No listings currently active on the platform.
                        </td>
                      </tr>
                    ) : (
                      listingsList.map((lst) => (
                        <tr key={lst._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '18px 24px', fontWeight: 700 }}>{lst.location}</td>
                          <td style={{ padding: '18px 24px', color: 'var(--text-secondary)' }}>{lst.address}</td>
                          <td style={{ padding: '18px 24px', fontWeight: 800, color: 'var(--primary)' }}>₹{lst.rent.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '18px 24px' }}>
                            <span style={{ background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{lst.roomType}</span>
                          </td>
                          <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteListing(lst._id)}
                              className="btn btn-secondary"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                padding: '6px 12px',
                                color: 'var(--danger)',
                                borderColor: 'rgba(239,68,68,0.1)'
                              }}
                            >
                              <Trash2 size={13} /> Remove Room
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

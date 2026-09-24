import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { Sun, Moon, Bell, LogOut, MessageSquare, PlusCircle, Compass, User, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, token, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch unread notifications count
  useEffect(() => {
    if (!token || !user) return;

    const fetchNotificationsCount = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          const unread = data.notifications.filter(n => !n.isRead).length;
          setUnreadNotifications(unread);
        }
      } catch (err) {
        console.error('Error fetching notification count:', err.message);
      }
    };

    fetchNotificationsCount();
    const interval = setInterval(fetchNotificationsCount, 30000);
    return () => clearInterval(interval);
  }, [token, user, location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: isActive(path) ? '#2563EB' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '14.5px',
    fontWeight: isActive(path) ? '700' : '600',
    padding: '8px 14px',
    borderRadius: '10px',
    backgroundColor: isActive(path) ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
    transition: 'var(--transition-fast)',
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav style={{
      position: 'sticky',
      top: '16px',
      margin: '16px auto',
      width: 'calc(100% - 32px)',
      maxWidth: '1240px',
      zIndex: 100,
      background: 'var(--card-bg)',
      border: '1.5px solid var(--glass-border)',
      backdropFilter: 'var(--glass-blur)',
      webkitBackdropFilter: 'var(--glass-blur)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      transition: 'var(--transition-medium)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        
        {/* Branding Logo */}
        <Link to="/" style={{
          textDecoration: 'none',
          fontSize: '20px',
          fontWeight: 900,
          color: '#2563EB',
          letterSpacing: '-0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }} onClick={() => setMobileMenuOpen(false)}>
          <span style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            color: '#fff',
            width: '32px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 900
          }}>RM</span>
          RentMate <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Finder</span>
        </Link>

        {/* Desktop Menu - Dynamically Render Based on Role */}
        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          
          {user && user.role === 'tenant' && (
            <>
              <Link to="/tenant-dashboard" style={linkStyle('/tenant-dashboard')}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/listings" style={linkStyle('/listings')}>
                <Compass size={16} /> Browse Rooms
              </Link>
              <Link to="/matches" style={linkStyle('/matches')}>
                <Sparkles size={16} /> AI Matches
              </Link>
              <Link to="/tenant-profile" style={linkStyle('/tenant-profile')}>
                <User size={16} /> Preference Profile
              </Link>
              <Link to="/chat" style={linkStyle('/chat')}>
                <MessageSquare size={16} /> Chats
              </Link>
            </>
          )}

          {user && user.role === 'owner' && (
            <>
              <Link to="/owner-dashboard" style={linkStyle('/owner-dashboard')}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/create-listing" style={linkStyle('/create-listing')}>
                <PlusCircle size={16} /> Post Room
              </Link>
              <Link to="/chat" style={linkStyle('/chat')}>
                <MessageSquare size={16} /> Chats
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" style={linkStyle('/admin-dashboard')}>
                <LayoutDashboard size={16} /> Admin Console
              </Link>
            </>
          )}

          {/* User profile details & toggles */}
          {user && <div style={{ width: '1.5px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 12px' }} />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user && (
              <Link to="/notifications" style={{
                position: 'relative',
                color: isActive('/notifications') ? '#2563EB' : 'var(--text-secondary)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isActive('/notifications') ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                transition: 'var(--transition-fast)'
              }}>
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '1px',
                    right: '1px',
                    backgroundColor: 'var(--danger)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-secondary)'
                  }}>
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            <button onClick={toggleDarkMode} style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)'
            }} title="Toggle Theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* User Avatar badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-tertiary)',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#2563EB',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {getInitials(user.name)}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name.split(' ')[0]}</span>
                  <span style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(37,99,235,0.08)', color: '#2563EB', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800 }}>
                    {user.role}
                  </span>
                </div>

                <button onClick={handleLogout} className="btn btn-secondary" style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px'
                }}>
                  <LogOut size={13} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Link to="/login" className="btn btn-secondary" style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  textDecoration: 'none'
                }}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  textDecoration: 'none'
                }}>Register</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(prev => !prev)} style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 99
        }}>
          {user && user.role === 'tenant' && (
            <>
              <Link to="/tenant-dashboard" style={linkStyle('/tenant-dashboard')} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/listings" style={linkStyle('/listings')} onClick={() => setMobileMenuOpen(false)}>
                <Compass size={16} /> Browse Rooms
              </Link>
              <Link to="/matches" style={linkStyle('/matches')} onClick={() => setMobileMenuOpen(false)}>
                <Sparkles size={16} /> AI Matches
              </Link>
              <Link to="/tenant-profile" style={linkStyle('/tenant-profile')} onClick={() => setMobileMenuOpen(false)}>
                <User size={16} /> Preference Profile
              </Link>
              <Link to="/chat" style={linkStyle('/chat')} onClick={() => setMobileMenuOpen(false)}>
                <MessageSquare size={16} /> Chats
              </Link>
            </>
          )}

          {user && user.role === 'owner' && (
            <>
              <Link to="/owner-dashboard" style={linkStyle('/owner-dashboard')} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/create-listing" style={linkStyle('/create-listing')} onClick={() => setMobileMenuOpen(false)}>
                <PlusCircle size={16} /> Post Room
              </Link>
              <Link to="/chat" style={linkStyle('/chat')} onClick={() => setMobileMenuOpen(false)}>
                <MessageSquare size={16} /> Chats
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" style={linkStyle('/admin-dashboard')} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard size={16} /> Admin Console
              </Link>
            </>
          )}

          {user && (
            <Link to="/notifications" style={linkStyle('/notifications')} onClick={() => setMobileMenuOpen(false)}>
              <Bell size={16} /> Notifications ({unreadNotifications})
            </Link>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
            <button onClick={toggleDarkMode} style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />} Toggle Theme
            </button>

            {user ? (
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <Link to="/login" className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Query script */}
      <style>{`
        @media (max-width: 992px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

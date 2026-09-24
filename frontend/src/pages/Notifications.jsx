import React, { useEffect, useState } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Bell, Check, Trash2, ArrowLeft, Loader, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TableSkeleton } from '../components/SkeletonLoader';

const Notifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchNotifications();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track match approvals, chats, and interest requests</p>
        </div>

        {notifications.filter(n => !n.isRead).length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
          >
            <CheckSquare size={14} /> Mark All Read
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          marginBottom: '20px',
          fontWeight: 500
        }}>
          {successMsg}
        </div>
      )}

      {loading ? <TableSkeleton /> : notifications.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <Bell size={40} style={{ margin: '0 auto 12px auto', color: 'var(--text-light)' }} />
          <p>You have no notifications at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map((notif) => (
            <div className="glass-card" key={notif._id} style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              opacity: notif.isRead ? 0.75 : 1,
              borderLeft: notif.isRead ? '4px solid var(--border-color)' : '4px solid var(--primary)',
              background: notif.isRead ? 'var(--card-bg)' : 'linear-gradient(90deg, var(--card-bg), rgba(79, 70, 229, 0.02))'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {notif.title}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {notif.message}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                  {new Date(notif.createdAt).toLocaleString('en-IN')}
                </span>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  style={{
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    color: 'var(--primary)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  title="Mark as Read"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

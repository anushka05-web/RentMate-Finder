import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, Loader } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('tenant'); // 'tenant' or 'owner'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      return 'All fields are required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9';
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await register(name, email, password, role, phone);
      if (result.success) {
        if (result.role === 'owner') {
          navigate('/owner-dashboard');
        } else {
          // Redirect directly to profile setup so they set requirements immediately
          navigate('/tenant-profile');
        }
      } else {
        setErrorMsg(result.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '40px 0'
    }} className="fade-in">
      <div className="glass-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800 }} className="gradient-text">Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>
            Sign up to find rooms or manage rental properties.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-tertiary)',
          padding: '6px',
          borderRadius: '14px',
          border: '1.5px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => setRole('tenant')}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              backgroundColor: role === 'tenant' ? '#2563EB' : 'transparent',
              color: role === 'tenant' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: role === 'tenant' ? '0 4px 10px rgba(37,99,235,0.2)' : 'none'
            }}
          >
            I am a Tenant
          </button>
          <button
            type="button"
            onClick={() => setRole('owner')}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              backgroundColor: role === 'owner' ? '#2563EB' : 'transparent',
              color: role === 'owner' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: role === 'owner' ? '0 4px 10px rgba(37,99,235,0.2)' : 'none'
            }}
          >
            I am an Owner
          </button>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid rgba(239, 68, 68, 0.15)',
            color: 'var(--danger)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            marginBottom: '24px',
            fontWeight: 500
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)',
                pointerEvents: 'none'
              }} />
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="Rajesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '48px', width: '100%' }}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)',
                pointerEvents: 'none'
              }} />
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="rajesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '48px', width: '100%' }}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number (India)</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)',
                pointerEvents: 'none'
              }} />
              <span style={{
                position: 'absolute',
                left: '44px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                fontSize: '14.5px',
                fontWeight: 600
              }}>+91</span>
              <input
                id="phone"
                type="text"
                className="form-control"
                placeholder="9823456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                style={{ paddingLeft: '84px', width: '100%' }}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password (Min 6 chars)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)',
                pointerEvents: 'none'
              }} />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '48px', width: '100%' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)',
                pointerEvents: 'none'
              }} />
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '48px', width: '100%' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '15px', marginTop: '10px' }} disabled={loading}>
            {loading ? (
              <>
                <Loader className="spin" size={18} /> Creating account...
              </>
            ) : (
              <>
                <UserPlus size={18} /> Register as {role === 'tenant' ? 'Tenant' : 'Owner'}
              </>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginTop: '28px'
        }}>
          Already have an account? <Link to="/login" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
        </div>
      </div>
      
      {/* Dynamic inline spin animation definition */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (result.role === 'owner') {
          navigate('/owner-dashboard');
        } else {
          navigate('/tenant-dashboard');
        }
      } else {
        setErrorMsg(result.message || 'Invalid email or password');
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
      minHeight: '80vh',
      padding: '40px 0'
    }} className="fade-in">
      <div className="glass-card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800 }} className="gradient-text">Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>
            Enter your details to access your RentMate dashboard.
          </p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '48px', width: '100%' }}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '15px' }} disabled={loading}>
            {loading ? (
              <>
                <Loader className="spin" size={18} style={{ animation: 'spin 1s linear infinite' }} /> Logging in...
              </>
            ) : (
              <>
                <LogIn size={18} /> Login to Account
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
          Don't have an account? <Link to="/register" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>
      
      {/* Dynamic spinner definition */}
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

export default Login;

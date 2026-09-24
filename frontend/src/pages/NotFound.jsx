import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      gap: '20px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        color: 'var(--danger)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px'
      }}>
        <Compass size={40} className="spin" style={{ animation: 'spin 4s linear infinite' }} />
      </div>
      <h1 style={{ fontSize: '48px', fontWeight: 800 }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '16px', lineHeight: 1.5 }}>
        Oops! The page you are looking for does not exist or has been relocated. Let's get you back on track.
      </p>
      <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', borderRadius: '10px', marginTop: '10px' }}>
        Back to Home <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default NotFound;

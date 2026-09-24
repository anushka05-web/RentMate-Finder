import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '40px 24px',
      marginTop: 'auto',
      transition: 'var(--transition-smooth)',
      fontSize: '14px',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '32px'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: '12px'
          }}>RentMate Finder</h3>
          <p style={{ lineHeight: 1.6, maxWidth: '280px', color: 'var(--text-light)' }}>
            India's premium flatmate matching & room hunting platform. Find compatible spaces powered by intelligent matchmaking.
          </p>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Cities We Cover</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
            <li>Bengaluru</li>
            <li>Mumbai</li>
            <li>Delhi NCR (Noida/Gurugram)</li>
            <li>Pune</li>
            <li>Hyderabad & Chennai</li>
          </ul>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Features</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
            <li>AI Compatibility Engine</li>
            <li>Real-time Chat Verification</li>
            <li>Indian Rupee Price Filters</li>
            <li>Instant Email Alerts</li>
          </ul>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '30px 0' }} />

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <p>© {new Date().getFullYear()} RentMate Finder India. All rights reserved.</p>
        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
          Tailored specifically for Indian property owners and flatmates. Made in India.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

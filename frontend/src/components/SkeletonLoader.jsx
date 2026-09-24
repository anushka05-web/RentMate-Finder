import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
      {/* Thumbnail area */}
      <div className="skeleton" style={{ height: '200px', width: '100%' }} />
      {/* Content area */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '22px', width: '60%', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '22px', width: '25%', borderRadius: '4px' }} />
        </div>
        <div className="skeleton" style={{ height: '16px', width: '80%', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <div className="skeleton" style={{ height: '24px', width: '70px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '24px', width: '90px', borderRadius: '12px' }} />
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
        <div className="skeleton" style={{ height: '36px', width: '100%', borderRadius: '8px' }} />
      </div>
    </div>
  );
};

export const MetricsSkeleton = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {[1, 2, 3, 4].map((i) => (
        <div className="glass-card" key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="skeleton" style={{ height: '16px', width: '50%', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '36px', width: '30%', borderRadius: '6px' }} />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '6px' }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', gap: '16px' }}>
          <div className="skeleton" style={{ height: '30px', flex: 1, borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '30px', flex: 2, borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '30px', flex: 1, borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  );
};

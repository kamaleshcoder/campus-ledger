import React from 'react';

export default function RoleSelection({ onSelectRole }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '32px',
        padding: '50px 40px',
        textAlign: 'center',
        maxWidth: '580px',
        width: '100%',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
        color: '#ffffff'
      }}>
        
        {/* Brand Logo & Icon */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.6)'
          }}>
            🎓
          </div>
        </div>

        {/* Premium Badge */}
        <div style={{ marginBottom: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', padding: '6px 16px', borderRadius: '30px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#60a5fa', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #60a5fa' }}></span>
          <span style={{
            color: '#93c5fd',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '1.2px',
            textTransform: 'uppercase'
          }}>
            Enterprise Academic Gateway
          </span>
        </div>

        {/* Title */}
        <h1 style={{ 
          fontSize: '44px', 
          fontWeight: '900', 
          margin: '0 0 12px 0', 
          letterSpacing: '-1px',
          color: '#ffffff'
        }}>
          Campus Ledger
        </h1>
        
        {/* Subtitle */}
        <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '38px', fontWeight: '400', lineHeight: '1.5' }}>
          Select your designated portal to securely access the workspace and academic logs.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          
          {/* Teacher Button */}
          <button
            onClick={() => onSelectRole('teacher')}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              padding: '24px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 35px -5px rgba(37, 99, 235, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.4)';
            }}
          >
            <span style={{ fontSize: '32px' }}>👨‍🏫</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Teacher</span>
            <span style={{ fontSize: '12px', color: '#bfdbfe', opacity: '0.9' }}>Faculty Workspace</span>
          </button>

          {/* Student Button */}
          <button
            onClick={() => onSelectRole('student')}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              padding: '24px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 20px 35px -5px rgba(5, 150, 105, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(5, 150, 105, 0.4)';
            }}
          >
            <span style={{ fontSize: '32px' }}>🧑‍🎓</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Student</span>
            <span style={{ fontSize: '12px', color: '#a7f3d0', opacity: '0.9' }}>Student Portal</span>
          </button>

        </div>
        
        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '38px', letterSpacing: '0.5px' }}>
          © 2026 Campus Ledger Systems. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

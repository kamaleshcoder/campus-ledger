import React, { useState } from 'react';
import { apiFetch } from './Api';

export default function SignIn({
  role,
  onLogin,
  onBack,
}) {
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMsg('');

    const cleanIdentifier = identifier.trim();
    const cleanName = name.trim();

    if (!cleanIdentifier || !password) {
      setError(
        role === 'teacher'
          ? '❌ Please enter Teacher ID and password.'
          : '❌ Please enter Register Number and password.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: {
          role,
          identifier: cleanIdentifier,
          name: cleanName,
          password,
        },
      });

      if (!data?.success || !data?.token) {
        throw new Error(
          data?.message || 'Login failed. Please check your credentials.'
        );
      }

      const finalName = cleanName || data?.user?.name || cleanIdentifier;
      onLogin(cleanIdentifier, finalName, data.token);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        `🚫 ${err?.message || 'Unable to connect to the server.'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // PASSWORD RESET
  // --------------------------------------------------

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMsg('');

    const cleanIdentifier = resetIdentifier.trim();

    if (!cleanIdentifier || !oldPassword || !newPassword) {
      setError('❌ Please fill in all reset details.');
      return;
    }

    if (newPassword.length < 6) {
      setError('❌ New password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch('/reset-password', {
        method: 'POST',
        body: {
          role,
          identifier: cleanIdentifier,
          oldPassword,
          newPassword,
        },
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to reset password.');
      }

      setSuccessMsg(
        '✅ Password successfully reset. Please sign in with your new password.'
      );

      setIsForgotPassword(false);
      setIdentifier(cleanIdentifier);
      setOldPassword('');
      setNewPassword('');
      setResetIdentifier('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError(`❌ ${err?.message || 'Unable to reset password.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '32px',
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85)',
          color: '#ffffff',
        }}
      >
        {/* ICON BADGE */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background:
                role === 'teacher'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              boxShadow:
                role === 'teacher'
                  ? '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
                  : '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
            }}
          >
            {role === 'teacher' ? '👨‍🏫' : '🧑‍🎓'}
          </div>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {isForgotPassword
            ? 'Reset Password'
            : role === 'teacher'
            ? 'Teacher Portal Sign In'
            : 'Student Portal Sign In'}
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '22px' }}>
          {isForgotPassword
            ? 'Enter your account details to change your password.'
            : role === 'teacher'
            ? 'Enter your Teacher ID, Faculty Name, and password.'
            : 'Enter your Register Number, Student Name, and password.'}
        </p>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              fontSize: '13px',
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              textAlign: 'left',
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              backgroundColor: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              fontSize: '13px',
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              textAlign: 'left',
            }}
          >
            {successMsg}
          </div>
        )}

        {!isForgotPassword ? (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'left',
            }}
          >
            {/* FIELD 1: ID / REG NO */}
            <div>
              <label style={labelStyle}>
                {role === 'teacher' ? 'Teacher ID' : 'Register Number'}
              </label>
              <input
                type="text"
                value={identifier}
                placeholder={role === 'teacher' ? 'Enter your Teacher ID' : 'Enter your Register Number'}
                autoComplete="username"
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError('');
                }}
                required
                style={inputStyle}
              />
            </div>

            {/* FIELD 2: NAME */}
            <div>
              <label style={labelStyle}>
                {role === 'teacher' ? 'Faculty Name' : 'Student Name'}
              </label>
              <input
                type="text"
                value={name}
                placeholder={role === 'teacher' ? 'Enter your full name' : 'Enter your full name'}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                style={inputStyle}
              />
            </div>

            {/* FIELD 3: PASSWORD */}
            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                style={{ ...inputStyle, paddingRight: '55px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '32px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#94a3b8',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background:
                  role === 'teacher'
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                boxShadow:
                  role === 'teacher'
                    ? '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                    : '0 10px 25px -5px rgba(5, 150, 105, 0.4)',
                opacity: isLoading ? 0.7 : 1,
                marginTop: '4px',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? 'Signing In...' : `Sign In as ${role === 'teacher' ? 'Faculty' : 'Student'}`}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleResetSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'left',
            }}
          >
            <div>
              <label style={labelStyle}>
                {role === 'teacher' ? 'Teacher ID' : 'Register Number'}
              </label>
              <input
                type="text"
                value={resetIdentifier}
                placeholder="Enter ID / Register Number"
                onChange={(e) => setResetIdentifier(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                placeholder="Enter current password"
                onChange={(e) => setOldPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={newPassword}
                placeholder="Enter new password (min 6 characters)"
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '14px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
                setSuccessMsg('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px',
                marginTop: '6px',
                textAlign: 'center',
              }}
            >
              Remember password? Sign In
            </button>
          </form>
        )}

        {!isForgotPassword && (
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '20px',
              textDecoration: 'underline',
            }}
          >
            ← Back to Portal Selection
          </button>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  color: '#cbd5e1',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '6px',
  letterSpacing: '0.4px',
};

const inputStyle = {
  width: '100%',
  backgroundColor: 'rgba(30,41,59,0.95)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '14px',
  padding: '12px 14px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

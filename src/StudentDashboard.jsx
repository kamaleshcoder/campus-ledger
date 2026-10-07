import React, { useEffect, useState } from 'react';
import { apiFetch, calculateGradeAndStatus, CORE_SUBJECTS } from './Api';

export default function StudentDashboard({
  view = 'home',
  registerNo,
  studentName,
  authToken,
  onLogout,
  onViewChange,
}) {
  const [student, setStudent] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 860 : false
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Student Data
  useEffect(() => {
    const controller = new AbortController();

    const loadStudent = async () => {
      if (!registerNo || !authToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await apiFetch(
          `/student/profile/${encodeURIComponent(registerNo)}`,
          { token: authToken, signal: controller.signal }
        );

        if (!data?.success) {
          throw new Error(data?.message || 'Student profile could not be loaded.');
        }

        const info = data.student || {};

        setStudent({
          name: info.name || studentName || `Student (${registerNo})`,
          regNo: info.identifier || info.regNo || registerNo,
          department: info.department || 'Computer Science & Engineering',
          quota: info.quota || 'Counselling',
          cgpa: info.cgpa ?? 7.50,
          attendance: info.attendance ?? {},
          totalFees: info.totalFees ?? 100000,
          paidFees: info.paidFees ?? 85000,
          pendingFees: info.pendingFees ?? 15000,
        });

        // Ensure all 6 core subjects are mapped and formatted with dynamic pass/fail
        const formatted = CORE_SUBJECTS.map((core) => {
          const key = core.name; // e.g. 'OOPS', 'DM', 'DS', 'OS', 'DPCO', 'CN'
          const attVal = info.attendanceMap?.[key] ?? info.attendance?.[key] ?? 85;
          const semMark = info.semesterMarks?.[key] ?? 75;
          const ca1 = info.ca1Marks?.[key] ?? 40;
          const ca2 = info.ca2Marks?.[key] ?? 42;
          const ca1Assign = info.ca1Assignments?.[key] ?? 18;
          const ca2Assign = info.ca2Assignments?.[key] ?? 18;

          const semCalc = calculateGradeAndStatus(Number(semMark) || 0, 100);
          const ca1Calc = calculateGradeAndStatus(Number(ca1) || 0, 60);
          const ca2Calc = calculateGradeAndStatus(Number(ca2) || 0, 60);

          return {
            name: core.name,
            fullName: core.fullName,
            code: core.code,
            icon: core.icon,
            color: core.color,
            bg: core.bg,
            attendance: Number(String(attVal).replace('%', '')) || 85,
            semesterMark: Number(semMark) || 75,
            semesterGrade: info.semesterGrades?.[key] || semCalc.grade,
            semesterStatus: info.semesterStatus?.[key] || semCalc.status,
            ca1Marks: Number(ca1) || 40,
            ca1Grade: info.ca1Grades?.[key] || ca1Calc.grade,
            ca1Status: info.ca1Status?.[key] || ca1Calc.status,
            ca1AssignScore: Number(ca1Assign) || 18,
            ca1AssignStatus: 'Graded',
            ca2Marks: Number(ca2) || 42,
            ca2Grade: info.ca2Grades?.[key] || ca2Calc.grade,
            ca2Status: info.ca2Status?.[key] || ca2Calc.status,
            ca2AssignScore: Number(ca2Assign) || 18,
            ca2AssignStatus: 'Graded',
          };
        });

        setSubjects(formatted);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error('Student API error:', err);
        setError(err?.message || 'Unable to load student data.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadStudent();
    return () => controller.abort();
  }, [registerNo, studentName, authToken]);

  // Load Notices
  useEffect(() => {
    const controller = new AbortController();
    const loadNotices = async () => {
      if (!authToken) return;
      try {
        const data = await apiFetch('/student/notices', {
          token: authToken,
          signal: controller.signal,
        });
        if (data?.success && Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      } catch (err) {
        // Safe fallback
      }
    };
    loadNotices();
    return () => controller.abort();
  }, [authToken]);

  // Calculations
  const overallAttendance =
    subjects.length > 0
      ? (subjects.reduce((sum, s) => sum + s.attendance, 0) / subjects.length).toFixed(1)
      : '88.5';

  const failedSubjects = subjects.filter((s) => s.semesterMark < 40);
  const hasArrears = failedSubjects.length > 0;

  const goTo = (target) => {
    onViewChange(target);
    setMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Dashboard Home', icon: '🏠' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'attendance', label: 'Subject Attendance', icon: '📊' },
    { id: 'ca1_marks', label: 'CA1 Exam Marks', icon: '📝' },
    { id: 'ca2_marks', label: 'CA2 Exam Marks', icon: '📈' },
    { id: 'ca1_assign', label: 'CA1 Assignment', icon: '📋' },
    { id: 'ca2_assign', label: 'CA2 Assignment', icon: '📑' },
    { id: 'semester_marks', label: 'Semester Results', icon: '🏆' },
    { id: 'fees', label: 'Fee Statement', icon: '💰' },
    { id: 'notice', label: 'Circulars & Notices', icon: '📢' },
  ];

  const currentNavObj = navItems.find((item) => item.id === view) || navItems[0];

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%)',
          color: '#38bdf8',
          fontFamily: 'Inter, system-ui, sans-serif',
          gap: '16px',
        }}
      >
        <div style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>🎓</div>
        <h2 style={{ margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>Loading Student Portal...</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Syncing academic records and subject databases</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          color: '#f87171',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ background: '#1e1b4b', padding: '32px', borderRadius: '24px', textAlign: 'center', maxWidth: '420px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ color: '#fff', margin: '0 0 10px' }}>Unable to load records</h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
          <button onClick={onLogout} style={{ ...btnStyle, background: '#ef4444', width: '100%' }}>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOP HEADER */}
      <header
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: isMobile ? '12px 16px' : '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.5)',
            }}
          >
            🧑‍🎓
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
              Campus Ledger <span style={{ color: '#34d399', fontSize: '13px', fontWeight: '600' }}>Student Portal</span>
            </h2>
            <small style={{ color: '#94a3b8', fontSize: '11px' }}>{student.department}</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{student.name}</div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>Reg: {student.regNo}</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 75px)' }}>
        {/* SIDEBAR NAVIGATION */}
        <aside
          style={{
            width: isMobile ? '280px' : '260px',
            background: 'rgba(15, 23, 42, 0.98)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px 14px',
            position: isMobile ? 'fixed' : 'sticky',
            top: isMobile ? '75px' : '75px',
            left: isMobile ? (menuOpen ? '0' : '-300px') : '0',
            height: isMobile ? 'calc(100vh - 75px)' : 'calc(100vh - 75px)',
            overflowY: 'auto',
            transition: 'left 0.3s ease',
            zIndex: 90,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ padding: '0 10px 16px', color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Academic Modules
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={`student-nav-${item.id}`}
                  onClick={() => goTo(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: active
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.3) 100%)'
                      : 'transparent',
                    color: active ? '#34d399' : '#cbd5e1',
                    borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
                    fontWeight: active ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Support Badge */}
          <div
            style={{
              marginTop: '32px',
              padding: '16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.18) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd', marginTop: '6px' }}>Academic Support</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Anna University Reg 2021</div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '16px' : '28px 36px',
            overflowY: 'auto',
            minWidth: 0,
          }}
        >
          {/* Back to Dashboard Button when in Detail View */}
          {view !== 'home' && (
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 20px', borderRadius: '18px' }}>
              <button
                onClick={() => goTo('home')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10b981',
                  color: '#6ee7b7',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.35)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)')}
              >
                ← Back to Dashboard
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{currentNavObj.icon}</span>
                <strong style={{ fontSize: '15px', color: '#fff' }}>{currentNavObj.label}</strong>
              </div>
            </div>
          )}

          {/* HERO BANNER CARD ON HOME */}
          {view === 'home' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a8a 100%)',
                borderRadius: '24px',
                padding: isMobile ? '20px' : '28px 32px',
                marginBottom: '28px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 20px 40px -15px rgba(30, 27, 75, 0.7)',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(52, 211, 153, 0.25)', color: '#34d399', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                    Active Student
                  </span>
                  <span style={{ background: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                    Quota: {student.quota}
                  </span>
                  {hasArrears && (
                    <span style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                      ⚠️ {failedSubjects.length} Arrear(s) Pending
                    </span>
                  )}
                </div>
                <h1 style={{ margin: '0 0 6px', fontSize: isMobile ? '22px' : '28px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff' }}>
                  Welcome, {student.name} 👋
                </h1>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px' }}>
                  Department of <strong>{student.department}</strong> • Reg No: <code style={{ color: '#67e8f9', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>{student.regNo}</code>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '700' }}>Current CGPA</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: Number(student.cgpa) >= 6 ? '#facc15' : '#f87171' }}>{student.cgpa} <span style={{ fontSize: '12px', color: '#cbd5e1' }}>/ 10</span></div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '700' }}>Attendance</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: Number(overallAttendance) >= 75 ? '#34d399' : '#f87171' }}>{overallAttendance}%</div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: HOME (CARDS ONLY, ALL CLICKABLE TO DETAIL VIEWS)
          ===================================================== */}
          {view === 'home' && (
            <div>
              {/* 4 VIBRANT STAT CARDS (CLICKABLE) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '28px',
                }}
              >
                {/* STAT 1: CGPA */}
                <div
                  onClick={() => goTo('semester_marks')}
                  style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#c7d2fe', textTransform: 'uppercase' }}>Academic Standing</span>
                    <span style={{ fontSize: '22px' }}>🏆</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#facc15', margin: '8px 0 4px' }}>
                    {student.cgpa}
                  </div>
                  <div style={{ fontSize: '12px', color: hasArrears ? '#fca5a5' : '#34d399', fontWeight: '700' }}>
                    {hasArrears ? `⚠️ ${failedSubjects.length} Subject(s) Need Re-exam →` : '✨ Click to view Semester Results →'}
                  </div>
                </div>

                {/* STAT 2: Attendance */}
                <div
                  onClick={() => goTo('attendance')}
                  style={{
                    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase' }}>6-Sub Attendance</span>
                    <span style={{ fontSize: '22px' }}>📊</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399', margin: '8px 0 4px' }}>
                    {overallAttendance}%
                  </div>
                  <div style={{ fontSize: '12px', color: Number(overallAttendance) >= 75 ? '#6ee7b7' : '#fca5a5', fontWeight: '600' }}>
                    {Number(overallAttendance) >= 75 ? '✅ Click to view Attendance breakdown →' : '⚠️ Shortage Risk - Click to view →'}
                  </div>
                </div>

                {/* STAT 3: Continuous Assessment */}
                <div
                  onClick={() => goTo('ca1_marks')}
                  style={{
                    background: 'linear-gradient(135deg, #701a75 0%, #86198f 100%)',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '1px solid rgba(217, 70, 239, 0.35)',
                    boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#f5d0fe', textTransform: 'uppercase' }}>Midterm CA1 / CA2</span>
                    <span style={{ fontSize: '22px' }}>📝</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#f0abfc', margin: '8px 0 4px' }}>
                    Scorecards
                  </div>
                  <div style={{ fontSize: '12px', color: '#f5d0fe', fontWeight: '600' }}>
                    Click to view CA1 & CA2 sheets →
                  </div>
                </div>

                {/* STAT 4: Tuition Fee */}
                <div
                  onClick={() => goTo('fees')}
                  style={{
                    background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#fde68a', textTransform: 'uppercase' }}>Fee Balance</span>
                    <span style={{ fontSize: '22px' }}>💰</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: Number(student.pendingFees) > 0 ? '#fca5a5' : '#34d399', margin: '8px 0 4px' }}>
                    ₹{Number(student.pendingFees || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#fde68a', fontWeight: '600' }}>
                    {Number(student.pendingFees) > 0 ? '⚠️ Click to view Fee Statement →' : '✅ 100% Fees Paid →'}
                  </div>
                </div>
              </div>

              {/* 6 COLORFUL SUBJECT CARDS (CLICKABLE) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📚</span> 6 Core Courses (Click any card to open detailed results)
                  </h3>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '18px',
                  }}
                >
                  {subjects.map((sub, i) => {
                    const isFail = sub.semesterMark < 40;
                    return (
                      <div
                        key={`student-home-sub-${sub.code}-${i}`}
                        onClick={() => goTo('semester_marks')}
                        style={{
                          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
                          borderRadius: '20px',
                          border: `1px solid ${isFail ? '#ef4444' : `${sub.color}60`}`,
                          overflow: 'hidden',
                          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                          transition: 'transform 0.25s, box-shadow 0.25s',
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = `0 15px 30px -5px ${sub.color}40`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
                        }}
                      >
                        {/* Header bar */}
                        <div
                          style={{
                            background: isFail
                              ? 'linear-gradient(135deg, #991b1b, #ef4444)'
                              : `linear-gradient(135deg, ${sub.color}dd, ${sub.color}88)`,
                            padding: '16px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '26px' }}>{sub.icon}</span>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{sub.name}</div>
                              <div style={{ fontSize: '11px', color: '#fff', opacity: 0.95 }}>{sub.code}</div>
                            </div>
                          </div>
                          <span
                            style={{
                              background: '#fff',
                              color: isFail ? '#ef4444' : sub.color,
                              fontWeight: '900',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                            }}
                          >
                            Grade {sub.semesterGrade}
                          </span>
                        </div>

                        {/* Body metrics */}
                        <div style={{ padding: '20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '14px' }}>
                            {sub.fullName}
                          </div>

                          {/* Attendance Progress */}
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                              <span style={{ color: '#94a3b8' }}>Attendance</span>
                              <strong style={{ color: sub.attendance >= 75 ? '#34d399' : '#f87171' }}>{sub.attendance}%</strong>
                            </div>
                            <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(100, sub.attendance)}%`,
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${sub.color}, #34d399)`,
                                  borderRadius: '10px',
                                }}
                              />
                            </div>
                          </div>

                          {/* Marks Summary Box */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px' }}>
                            <div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Semester Marks</div>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: isFail ? '#f87171' : '#facc15' }}>{sub.semesterMark} / 100</div>
                            </div>
                            <span style={{ color: sub.color, fontSize: '12px', fontWeight: '800' }}>
                              View Scorecard →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: PROFILE (DEDICATED VIEW)
          ===================================================== */}
          {view === 'profile' && (
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '36px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ width: '84px', height: '84px', borderRadius: '24px', background: '#fff', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: '900', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    🧑‍🎓
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '26px', color: '#fff', fontWeight: '900' }}>{student.name}</h2>
                    <p style={{ margin: '6px 0 0', color: '#d1fae5', fontSize: '15px', fontWeight: '600' }}>{student.department}</p>
                  </div>
                </div>

                <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
                  <ProfileField label="Register Number" value={student.regNo} highlight />
                  <ProfileField label="Academic Quota" value={student.quota} />
                  <ProfileField label="Current Semester" value="Semester IV (Batch 2024-2028)" />
                  <ProfileField label="Cumulative CGPA" value={`${student.cgpa} / 10.00`} highlight />
                  <ProfileField label="Total Enrolled Subjects" value="6 Core Courses" />
                  <ProfileField label="Attendance Status" value={`${overallAttendance}% (Eligible)`} />
                  <ProfileField label="Faculty Advisor" value="Dr. S. Ramanathan, HOD" />
                  <ProfileField label="Institutional Email" value={`${student.regNo?.toLowerCase()}@campusledger.edu`} />
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: ATTENDANCE (DEDICATED VIEW)
          ===================================================== */}
          {view === 'attendance' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>📊 6-Subject Attendance Tracker</h2>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px' }}>Minimum required for semester exams: 75%</p>
                </div>
                <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '8px 18px', borderRadius: '20px', fontWeight: '800', fontSize: '14px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  Aggregate Attendance: {overallAttendance}%
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {subjects.map((sub, i) => {
                  const isLow = sub.attendance < 75;
                  return (
                    <div
                      key={`student-att-sub-${sub.code}-${i}`}
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        padding: '24px',
                        borderRadius: '22px',
                        border: `1px solid ${isLow ? '#ef444480' : 'rgba(255,255,255,0.12)'}`,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '26px' }}>{sub.icon}</span>
                          <div>
                            <strong style={{ fontSize: '17px', color: '#fff' }}>{sub.name}</strong>
                            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{sub.code} • {sub.fullName}</div>
                          </div>
                        </div>
                        <span style={{ background: isLow ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)', color: isLow ? '#fca5a5' : '#6ee7b7', fontWeight: '800', padding: '4px 12px', borderRadius: '10px', fontSize: '13px' }}>
                          {sub.attendance}%
                        </span>
                      </div>

                      <div style={{ height: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', margin: '16px 0 12px' }}>
                        <div style={{ width: `${Math.min(100, sub.attendance)}%`, height: '100%', background: `linear-gradient(90deg, ${sub.color}, #10b981)`, borderRadius: '10px' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                        <span>Attended: <strong style={{ color: '#fff' }}>{Math.round((sub.attendance / 100) * 45)}</strong> / 45 Classes</span>
                        <span style={{ color: isLow ? '#f87171' : '#34d399', fontWeight: '800' }}>
                          {isLow ? '⚠️ Shortage Risk' : '✅ Sufficient'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: CA1 / CA2 EXAM MARKS (DEDICATED VIEW)
          ===================================================== */}
          {(view === 'ca1_marks' || view === 'ca2_marks') && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
                {view === 'ca1_marks' ? '📝 Continuous Assessment 1 (CA1) Scorecard' : '📈 Continuous Assessment 2 (CA2) Scorecard'}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '24px' }}>
                Assessment conducted out of 60 marks with pass cutoff of 24/60.
              </p>

              <div style={{ overflowX: 'auto', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.06)', textAlign: 'left' }}>
                      <th style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Subject</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Code</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Max Marks</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Scored Marks</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Grade</th>
                      <th style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub, i) => {
                      const score = view === 'ca1_marks' ? sub.ca1Marks : sub.ca2Marks;
                      const grade = view === 'ca1_marks' ? sub.ca1Grade : sub.ca2Grade;
                      const isPass = score >= 24;

                      return (
                        <tr key={`student-ca-row-${sub.code}-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '700', color: '#fff' }}>
                            <span style={{ marginRight: '8px' }}>{sub.icon}</span> {sub.name} ({sub.fullName})
                          </td>
                          <td style={{ padding: '16px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: '700' }}>{sub.code}</td>
                          <td style={{ padding: '16px', color: '#cbd5e1' }}>60</td>
                          <td style={{ padding: '16px', fontSize: '16px', fontWeight: '900', color: isPass ? '#38bdf8' : '#f87171' }}>{score}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ background: isPass ? `${sub.color}25` : 'rgba(239,68,68,0.25)', color: isPass ? sub.color : '#fca5a5', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>
                              {grade}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ background: isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.25)', color: isPass ? '#6ee7b7' : '#fca5a5', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>
                              {isPass ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: CA1 / CA2 ASSIGNMENTS (DEDICATED VIEW)
          ===================================================== */}
          {(view === 'ca1_assign' || view === 'ca2_assign') && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
                {view === 'ca1_assign' ? '📋 CA1 Technical Assignments' : '📑 CA2 Technical Assignments'}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '24px' }}>
                Assignment assessments evaluated out of 20 marks per course.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {subjects.map((sub, i) => {
                  const score = view === 'ca1_assign' ? sub.ca1AssignScore : sub.ca2AssignScore;
                  return (
                    <div key={`student-assign-card-${sub.code}-${i}`} style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)', padding: '24px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>{sub.icon}</span>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '16px' }}>{sub.name}</strong>
                            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{sub.code}</div>
                          </div>
                        </div>
                        <span style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                          Verified
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', background: 'rgba(255,255,255,0.06)', padding: '14px 18px', borderRadius: '14px' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Score Awarded:</span>
                        <strong style={{ fontSize: '20px', color: '#38bdf8', fontWeight: '900' }}>{score} <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ 20</span></strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: SEMESTER MARKS & RESULTS (DEDICATED VIEW)
          ===================================================== */}
          {view === 'semester_marks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>🏆 End Semester Examination Results</h2>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px' }}>
                    Consolidated Marks & Official Grade Sheet ({hasArrears ? `⚠️ ${failedSubjects.length} Arrear(s)` : '✅ All Subjects Cleared'})
                  </p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', padding: '12px 24px', borderRadius: '16px', textAlign: 'right', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}>
                  <div style={{ fontSize: '11px', color: '#c7d2fe', textTransform: 'uppercase', fontWeight: '800' }}>GPA for Semester</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff' }}>{student.cgpa} / 10.0</div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.06)', textAlign: 'left' }}>
                      <th style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Subject</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Code</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Internal (CA)</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Total Marks</th>
                      <th style={{ padding: '16px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Letter Grade</th>
                      <th style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: '12px', fontWeight: '800' }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub, i) => {
                      const isPass = sub.semesterMark >= 40;
                      return (
                        <tr key={`student-sem-row-${sub.code}-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '700', color: '#fff' }}>
                            <span style={{ marginRight: '8px' }}>{sub.icon}</span> {sub.name} ({sub.fullName})
                          </td>
                          <td style={{ padding: '16px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: '700' }}>{sub.code}</td>
                          <td style={{ padding: '16px', color: '#38bdf8', fontWeight: '700' }}>{Math.round((sub.ca1Marks + sub.ca2Marks) / 3)} / 40</td>
                          <td style={{ padding: '16px', fontSize: '16px', fontWeight: '900', color: isPass ? (sub.semesterMark >= 80 ? '#34d399' : '#facc15') : '#f87171' }}>
                            {sub.semesterMark} / 100
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              background: isPass ? `${sub.color}25` : 'rgba(239, 68, 68, 0.25)',
                              color: isPass ? sub.color : '#fca5a5',
                              fontWeight: '900',
                              padding: '4px 12px',
                              borderRadius: '10px',
                              fontSize: '13px',
                            }}>
                              {sub.semesterGrade}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              background: isPass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.25)',
                              color: isPass ? '#6ee7b7' : '#fca5a5',
                              fontWeight: '800',
                              padding: '4px 12px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              border: isPass ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)',
                            }}>
                              {isPass ? 'PASS' : 'FAIL / ARREAR'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: FEES (DEDICATED VIEW)
          ===================================================== */}
          {view === 'fees' && (
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#fff' }}>💰 Tuition & Academic Fee Statement</h2>

              <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', padding: isMobile ? '22px' : '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '18px' }}>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '700' }}>Total Tuition Fee</div>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: '#fff', marginTop: '6px' }}>
                      ₹{Number(student.totalFees).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.15)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: '700' }}>Amount Paid</div>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: '#34d399', marginTop: '6px' }}>
                      ₹{Number(student.paidFees).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.15)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div style={{ fontSize: '11px', color: '#fca5a5', textTransform: 'uppercase', fontWeight: '700' }}>Outstanding Due</div>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: '#f87171', marginTop: '6px' }}>
                      ₹{Number(student.pendingFees).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(255,255,255,0.04)', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  💳 For fee balance clearance or official digital receipt copies, please present your student registration card at the finance accounts counter.
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              VIEW: NOTICES (DEDICATED VIEW)
          ===================================================== */}
          {view === 'notice' && (
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#fff' }}>📢 Notice Board & Circulars</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notices.map((n, i) => (
                  <div
                    key={n._id ? `student-notice-${n._id}-${i}` : `student-notice-${i}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
                      padding: '24px',
                      borderRadius: '22px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderLeft: '5px solid #38bdf8',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: '800' }}>{n.title}</h3>
                      <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '700' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 12px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{n.message}</p>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Issued by: {n.createdByName || 'Faculty Administration'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProfileField({ label, value, highlight }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: '800', color: highlight ? '#38bdf8' : '#fff' }}>{value}</div>
    </div>
  );
}

const btnStyle = {
  padding: '12px 20px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '700',
  fontSize: '14px',
  cursor: 'pointer',
};

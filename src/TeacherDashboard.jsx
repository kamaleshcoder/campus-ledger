import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, calculateGradeAndStatus, CORE_SUBJECTS, generateUniqueId } from './Api';

export const SUBJECT_ROUTINE_INFO = {
  OOPS: {
    slot: 'Mon & Wed 09:30 AM - 10:30 AM',
    labSlot: 'Thu 02:00 PM - 04:30 PM (CS Lab 2)',
    classroom: 'Room 304, IT Block',
    credits: '4 Credits (3L + 2P)',
    syllabus: 'Classes, Objects, Inheritance, Polymorphism, Exception Handling, STL & Streams',
  },
  DM: {
    slot: 'Tue & Thu 10:30 AM - 11:30 AM',
    labSlot: 'Tutorial: Fri 09:30 AM - 10:30 AM',
    classroom: 'Room 302, Math Wing',
    credits: '4 Credits (3L + 1T)',
    syllabus: 'Propositional Logic, Predicates, Combinatorics, Recurrence Relations, Graph Theory',
  },
  DS: {
    slot: 'Mon & Fri 11:30 AM - 12:30 PM',
    labSlot: 'Tue 02:00 PM - 04:30 PM (DS Lab 1)',
    classroom: 'Room 306, IT Block',
    credits: '4 Credits (3L + 2P)',
    syllabus: 'Linear Structures, Trees, Graphs, Sorting & Searching Algorithms, Dynamic Programming',
  },
  OS: {
    slot: 'Wed & Fri 01:30 PM - 02:30 PM',
    labSlot: 'Seminar: Tue 11:30 AM - 12:30 PM',
    classroom: 'Room 208, Main Block',
    credits: '3 Credits (3L + 0P)',
    syllabus: 'Process Management, Threads, Deadlocks, Memory Management, File Systems, Disk Scheduling',
  },
  DPCO: {
    slot: 'Mon & Thu 02:30 PM - 03:30 PM',
    labSlot: 'Hardware Lab: Fri 02:30 PM - 04:30 PM',
    classroom: 'Room 105, Digital Systems Lab',
    credits: '4 Credits (3L + 2P)',
    syllabus: 'Boolean Algebra, Combinational & Sequential Circuits, CPU Architecture, Instruction Pipelines',
  },
  CN: {
    slot: 'Tue & Fri 09:30 AM - 10:30 AM',
    labSlot: 'Networking Lab: Wed 02:00 PM - 04:30 PM',
    classroom: 'Room 310, Network Lab',
    credits: '4 Credits (3L + 2P)',
    syllabus: 'OSI/TCP-IP Models, Data Link Layer, IP Addressing, Routing Protocols, TCP/UDP, DNS, HTTP',
  },
};

export default function TeacherDashboard({
  authToken,
  teacherName,
  onLogout,
}) {
  const [teacherTab, setTeacherTab] = useState('dashboard');
  const [activeSubjectDetail, setActiveSubjectDetail] = useState(CORE_SUBJECTS[0]);
  const [popup, setPopup] = useState('');
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Responsive state
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 860 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Teacher Profile
  const [teacherProfile, setTeacherProfile] = useState({
    name: teacherName || 'Dr. S. Ramanathan',
    identifier: 'T101',
    designation: 'Professor & Head',
    department: 'Computer Science & Engineering',
    experience: '16 Years',
    phone: '+91 98765 43210',
    email: 'ramanathan@campusledger.edu',
    subjectsHandled: ['OOPS', 'DM', 'DS', 'OS', 'DPCO', 'CN'],
  });

  // Notices
  const [notices, setNotices] = useState([]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeMsg, setNewNoticeMsg] = useState('');

  // Students
  const [students, setStudents] = useState([]);

  // Registration form
  const [newStuName, setNewStuName] = useState('');
  const [newStuReg, setNewStuReg] = useState('');
  const [newStuDept, setNewStuDept] = useState('Computer Science & Engineering');
  const [newStuQuota, setNewStuQuota] = useState('Counselling');
  const [recentlyAddedStudent, setRecentlyAddedStudent] = useState(null);

  // Edit states
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [tempPaidFee, setTempPaidFee] = useState('');
  const [tempBalanceFee, setTempBalanceFee] = useState('');

  const [editingMarksId, setEditingMarksId] = useState(null);
  const [tempMarks, setTempMarks] = useState({});

  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [tempAttendance, setTempAttendance] = useState({});

  const [editingCA1Id, setEditingCA1Id] = useState(null);
  const [tempCA1, setTempCA1] = useState({});

  const [editingCA2Id, setEditingCA2Id] = useState(null);
  const [tempCA2, setTempCA2] = useState({});

  const showPopup = (message) => {
    setPopup(message);
    window.setTimeout(() => setPopup(''), 3500);
  };

  const getStudentId = (student) => student?._id || student?.id || student?.identifier;
  const getStudentRegNo = (student) => student?.regNo || student?.identifier || '-';

  // Load teacher data
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [studentsRes, noticesRes] = await Promise.all([
          apiFetch('/teacher/students', { token: authToken, signal: controller.signal }),
          apiFetch('/student/notices', { token: authToken, signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return;

        if (studentsRes?.students) {
          setStudents(studentsRes.students);
        }
        if (studentsRes?.teacher) {
          setTeacherProfile((prev) => ({
            ...prev,
            ...studentsRes.teacher,
            name: studentsRes.teacher.name || prev.name,
          }));
        }

        if (noticesRes?.notices) {
          // Deduplicate
          const unique = [];
          const seen = new Set();
          noticesRes.notices.forEach((n) => {
            const id = n._id || n.id;
            if (!seen.has(id)) {
              seen.add(id);
              unique.push(n);
            }
          });
          setNotices(unique);
        }
      } catch (err) {
        console.error('Error loading teacher data:', err);
        setError(err?.message || 'Failed to load teacher dashboard.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => controller.abort();
  }, [authToken, teacherName]);

  // Update student in state
  const updateStudentInState = (id, updatedFields) => {
    setStudents((prev) =>
      prev.map((s) => (String(getStudentId(s)) === String(id) ? { ...s, ...updatedFields } : s))
    );
  };

  // Register Student
  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    const name = newStuName.trim();
    const regNo = newStuReg.trim().toUpperCase();

    if (!name || !regNo) {
      showPopup('❌ Please provide both Student Name and Register Number.');
      return;
    }

    try {
      setSavingAction('register');
      const data = await apiFetch('/teacher/student/register', {
        method: 'POST',
        token: authToken,
        body: {
          name,
          regNo,
          department: newStuDept,
          quota: newStuQuota,
        },
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Registration failed.');
      }

      const added = data.student;
      setStudents((prev) => [added, ...prev.filter((s) => getStudentId(s) !== getStudentId(added))]);
      setRecentlyAddedStudent(added);
      setNewStuName('');
      setNewStuReg('');
      showPopup(`🎉 ${name} successfully enrolled in Class Roster!`);
    } catch (err) {
      showPopup(`❌ ${err?.message || 'Failed to register student.'}`);
    } finally {
      setSavingAction('');
    }
  };

  // Save Fee
  const handleSaveFee = async (id) => {
    try {
      setSavingAction(`fee-${id}`);
      const paid = Number(tempPaidFee) || 0;
      const pending = Number(tempBalanceFee) || 0;

      await apiFetch(`/teacher/student/fee/${id}`, {
        method: 'PUT',
        token: authToken,
        body: { paidFee: paid, balanceFee: pending },
      });

      updateStudentInState(id, { paidFees: paid, pendingFees: pending });
      setEditingFeeId(null);
      showPopup('✅ Fee statement successfully updated!');
    } catch (err) {
      showPopup(`❌ ${err?.message || 'Failed to update fees.'}`);
    } finally {
      setSavingAction('');
    }
  };

  // Save Semester Marks
  const handleSaveMarks = async (id) => {
    try {
      setSavingAction(`marks-${id}`);
      const cleaned = {};
      const newGrades = {};
      const newStatus = {};

      CORE_SUBJECTS.forEach((sub) => {
        const val = Math.min(100, Math.max(0, Number(tempMarks[sub.name] ?? 75)));
        cleaned[sub.name] = val;
        const { grade, status } = calculateGradeAndStatus(val, 100);
        newGrades[sub.name] = grade;
        newStatus[sub.name] = status;
      });

      const marksArr = Object.values(cleaned);
      const newCGPA = Number(((marksArr.reduce((a, b) => a + b, 0) / marksArr.length) / 10).toFixed(2));

      await apiFetch(`/teacher/student/marks/${id}`, {
        method: 'PUT',
        token: authToken,
        body: { semesterMarks: cleaned },
      });

      updateStudentInState(id, {
        semesterMarks: cleaned,
        semesterGrades: newGrades,
        semesterStatus: newStatus,
        cgpa: newCGPA,
      });
      setEditingMarksId(null);
      showPopup('✅ 6-Subject semester marks & CGPA updated!');
    } catch (err) {
      showPopup(`❌ ${err?.message || 'Failed to update marks.'}`);
    } finally {
      setSavingAction('');
    }
  };

  // Save Attendance
  const handleSaveAttendance = async (id) => {
    try {
      setSavingAction(`att-${id}`);
      const cleaned = {};
      CORE_SUBJECTS.forEach((sub) => {
        cleaned[sub.name] = Math.min(100, Math.max(0, Number(tempAttendance[sub.name] ?? 85)));
      });

      await apiFetch(`/teacher/student/attendance/${id}`, {
        method: 'PUT',
        token: authToken,
        body: { attendance: cleaned },
      });

      updateStudentInState(id, { attendance: cleaned, attendanceMap: cleaned });
      setEditingAttendanceId(null);
      showPopup('✅ 6-Subject attendance saved successfully!');
    } catch (err) {
      showPopup(`❌ ${err?.message || 'Failed to update attendance.'}`);
    } finally {
      setSavingAction('');
    }
  };

  // Save CA1
  const handleSaveCA1 = async (id) => {
    try {
      setSavingAction(`ca1-${id}`);
      const cleaned = {};
      const newGrades = {};
      const newStatus = {};
      CORE_SUBJECTS.forEach((sub) => {
        const val = Math.min(60, Math.max(0, Number(tempCA1[sub.name] ?? 40)));
        cleaned[sub.name] = val;
        const { grade, status } = calculateGradeAndStatus(val, 60);
        newGrades[sub.name] = grade;
        newStatus[sub.name] = status;
      });

      await apiFetch(`/teacher/student/ca1/${id}`, {
        method: 'PUT',
        token: authToken,
        body: { ca1Marks: cleaned },
      });

      updateStudentInState(id, { ca1Marks: cleaned, ca1Grades: newGrades, ca1Status: newStatus });
      setEditingCA1Id(null);
      showPopup('✅ CA1 examination marks updated!');
    } catch (err) {
      showPopup(`❌ ${err?.message || 'Failed to update CA1.'}`);
    } finally {
      setSavingAction('');
    }
  };

  // Save CA2
  const handleSaveCA2 = async (id) => {
    try {
      setSavingAction(`ca2-${id}`);
      const cleaned = {};
      const newGrades = {};
      const newStatus = {};
      CORE_SUBJECTS.forEach((sub) => {
        const val = Math.min(60, Math.max(0, Number(tempCA2[sub.name] ?? 42)));
        cleaned[sub.name] = val;
        const { grade, status } = calculateGradeAndStatus(val, 60);
        newGrades[sub.name] = grade;
        newStatus[sub.name] = status;
      });

      await apiFetch(`/teacher/student/ca2/${id}`, {
        method: 'PUT',
        token: authToken,
        body: { ca2Marks: cleaned },
      });

      updateStudentInState(id, { ca2Marks: cleaned, ca2Grades: newGrades, ca2Status: newStatus });
      setEditingCA2Id(null);
      showPopup('✅ CA2 examination marks updated!');
    } catch (err) {
      showPopup(`❌ ${err?.message || 'Failed to update CA2.'}`);
    } finally {
      setSavingAction('');
    }
  };

  // Publish Notice
  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeMsg.trim()) {
      showPopup('❌ Please provide notice title and description.');
      return;
    }

    try {
      setSavingAction('notice');
      const data = await apiFetch('/teacher/notice', {
        method: 'POST',
        token: authToken,
        body: {
          title: newNoticeTitle.trim(),
          message: newNoticeMsg.trim(),
        },
      });

      const newN = data?.notice || {
        _id: generateUniqueId('not'),
        title: newNoticeTitle.trim(),
        message: newNoticeMsg.trim(),
        createdByName: teacherProfile.name,
        createdAt: new Date().toISOString(),
      };

      setNotices((prev) => [newN, ...prev.filter((item) => (item._id || item.id) !== (newN._id || newN.id))]);
      setNewNoticeTitle('');
      setNewNoticeMsg('');
      showPopup('✅ Official announcement published to notice board!');
    } catch (err) {
      showPopup(`❌ ${err?.message || 'Failed to post notice.'}`);
    } finally {
      setSavingAction('');
    }
  };

  // Class analytics computed
  const analytics = useMemo(() => {
    if (students.length === 0) {
      return {
        avgCGPA: '0.00',
        passCount: 0,
        arrearCount: 0,
        totalFeesPending: 0,
        passPercentage: 0,
        passRate: 0,
        avgAttendance: 0,
        subjectStats: {},
      };
    }

    let totalCGPA = 0;
    let studentsWithAllPass = 0;
    let studentsWithArrears = 0;
    let totalPending = 0;
    let totalAttSum = 0;
    let totalAttEntries = 0;

    const subStats = {};
    CORE_SUBJECTS.forEach((sub) => {
      subStats[sub.name] = { totalMarks: 0, passCount: 0, failCount: 0, avgAttendance: 0, totalAtt: 0 };
    });

    students.forEach((stu) => {
      totalCGPA += Number(stu.cgpa || 0);
      totalPending += Number(stu.pendingFees || 0);

      const semMarks = stu.semesterMarks || {};
      let hasAnyArrear = false;

      CORE_SUBJECTS.forEach((sub) => {
        const mark = Number(semMarks[sub.name] ?? 0);
        const att = Number(stu.attendance?.[sub.name] ?? stu.attendanceMap?.[sub.name] ?? 0);

        subStats[sub.name].totalMarks += mark;
        subStats[sub.name].totalAtt += att;
        totalAttSum += att;
        totalAttEntries += 1;

        if (mark >= 40) {
          subStats[sub.name].passCount += 1;
        } else {
          subStats[sub.name].failCount += 1;
          hasAnyArrear = true;
        }
      });

      if (hasAnyArrear) {
        studentsWithArrears += 1;
      } else {
        studentsWithAllPass += 1;
      }
    });

    const passRate = Math.round((studentsWithAllPass / students.length) * 100);
    const avgAttendance = totalAttEntries > 0 ? Math.round(totalAttSum / totalAttEntries) : 0;

    return {
      avgCGPA: (totalCGPA / students.length).toFixed(2),
      passCount: studentsWithAllPass,
      arrearCount: studentsWithArrears,
      totalFeesPending: totalPending,
      passPercentage: passRate,
      passRate: passRate,
      avgAttendance: avgAttendance,
      subjectStats: subStats,
    };
  }, [students]);

  // Filtered student list for search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.regNo?.toLowerCase().includes(q) ||
        s.identifier?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: '🏠', color: '#3b82f6', desc: 'Main control center & 6 core course cards' },
    { id: 'subject_detail', label: 'Course Inspector', icon: '📚', color: '#38bdf8', desc: 'Subject syllabus, routine & student marks', hiddenFromSidebar: true },
    { id: 'attendance', label: 'Subject Attendance', icon: '📋', color: '#06b6d4', desc: 'Manage attendance register across 6 courses' },
    { id: 'marks', label: 'Semester Results & CGPA', icon: '🏆', color: '#f43f5e', desc: 'Enter 0-100 marks per subject with auto CGPA' },
    { id: 'ca1', label: 'CA1 Assessment Marks', icon: '📝', color: '#6366f1', desc: 'Manage CA1 unit test scores (out of 60)' },
    { id: 'ca2', label: 'CA2 Assessment Marks', icon: '📈', color: '#a855f7', desc: 'Manage CA2 unit test scores (out of 60)' },
    { id: 'routine', label: 'Class Routine & Timetable', icon: '📅', color: '#10b981', desc: 'Weekly schedule & classroom allocations' },
    { id: 'register', label: 'Student Enrollment & Roster', icon: '🧑‍🎓', color: '#14b8a6', desc: 'Enroll student & inspect roster status' },
    { id: 'fees', label: 'Fee Management Ledger', icon: '💰', color: '#f59e0b', desc: 'Tuition paid & outstanding fee balances' },
    { id: 'notices', label: 'Department Circulars', icon: '📢', color: '#64748b', desc: 'Publish announcements to students' },
    { id: 'profile', label: 'Faculty Profile', icon: '👨‍🏫', color: '#8b5cf6', desc: 'View instructor credentials and load' },
  ];

  const currentTabObj = navTabs.find((t) => t.id === teacherTab) || navTabs[0];

  const handleOpenSubjectDetail = (sub) => {
    setActiveSubjectDetail(sub);
    setTeacherTab('subject_detail');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%)', color: '#38bdf8', fontFamily: 'Inter, system-ui, sans-serif', gap: '16px' }}>
        <div style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>👨‍🏫</div>
        <h2 style={{ margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>Loading Faculty Workspace...</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Syncing 6 core subjects and class gradebooks</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%)', color: '#f8fafc', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* TOP HEADER */}
      <header
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: isMobile ? '14px 18px' : '16px 36px',
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.5)',
            }}
          >
            👨‍🏫
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
              Campus Ledger <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '600' }}>Faculty Portal</span>
            </h2>
            <small style={{ color: '#94a3b8', fontSize: '11px' }}>{teacherProfile.department}</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{teacherProfile.name}</div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>ID: {teacherProfile.identifier}</div>
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
            top: '75px',
            left: isMobile ? (isMobileMenuOpen ? '0' : '-300px') : '0',
            height: 'calc(100vh - 75px)',
            overflowY: 'auto',
            transition: 'left 0.3s ease',
            zIndex: 90,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ padding: '0 10px 16px', color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Academic Modules
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navTabs
                .filter((tab) => !tab.hiddenFromSidebar)
                .map((tab) => {
                  const active = teacherTab === tab.id;
                  return (
                    <button
                      key={`teacher-nav-${tab.id}`}
                      onClick={() => {
                        setTeacherTab(tab.id);
                        if (isMobile) setIsMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: active
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.3) 100%)'
                          : 'transparent',
                        color: active ? '#60a5fa' : '#cbd5e1',
                        borderLeft: active ? `3px solid ${tab.color}` : '3px solid transparent',
                        fontWeight: active ? '700' : '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <div>
            {/* Quick Academic Support Card */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.18) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '24px' }}>🏛️</span>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd', marginTop: '6px' }}>6 Core Courses Active</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Anna University Reg 2021</div>
            </div>
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
          {/* Notifications popup */}
          {popup && (
            <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#1e293b', border: '1px solid #38bdf8', color: '#fff', padding: '14px 20px', borderRadius: '14px', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', zIndex: 1000, fontWeight: '700', animation: 'fadeIn 0.3s' }}>
              {popup}
            </div>
          )}

        {/* BACK TO DASHBOARD BANNER WHEN INSIDE ANY DETAIL VIEW */}
        {teacherTab !== 'dashboard' && (
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(30, 41, 59, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 20px', borderRadius: '18px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <button
              onClick={() => setTeacherTab('dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.35) 100%)',
                border: '1px solid #3b82f6',
                color: '#93c5fd',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.5) 100%)';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.35) 100%)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              ← Back to Dashboard
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>
                {teacherTab === 'subject_detail' ? activeSubjectDetail.icon : currentTabObj.icon}
              </span>
              <strong style={{ fontSize: '15px', color: '#fff' }}>
                {teacherTab === 'subject_detail'
                  ? `${activeSubjectDetail.name} — ${activeSubjectDetail.fullName} (${activeSubjectDetail.code})`
                  : currentTabObj.label}
              </strong>
            </div>
          </div>
        )}

        {/* HERO BANNER CARD ON DASHBOARD HOME (CLEAN STUDENT-STYLE LAYOUT) */}
        {teacherTab === 'dashboard' && (
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
                  👨‍🏫 Active Faculty Portal
                </span>
                <span style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  📚 6 Core Courses
                </span>
                <span style={{ background: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                  Anna University Reg 2021
                </span>
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: isMobile ? '22px' : '28px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff' }}>
                Welcome, {teacherProfile.name} 👋
              </h1>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px' }}>
                {teacherProfile.designation} • Department of <strong>{teacherProfile.department}</strong> • Faculty ID: <code style={{ color: '#67e8f9', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>{teacherProfile.identifier}</code>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '700' }}>Enrolled Students</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>{students.length} <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Total</span></div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '700' }}>Class Pass Rate</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: analytics.passRate >= 75 ? '#34d399' : '#f87171' }}>{analytics.passRate}%</div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: DASHBOARD OVERVIEW (FOCUSED ON 6 CORE SUBJECTS)
        ===================================================== */}
        {teacherTab === 'dashboard' && (
          <div>
            {/* 4 VIBRANT FACULTY STAT CARDS (MATCHING STUDENT DASHBOARD) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              {/* STAT 1: Pass Rate / CGPA */}
              <div
                onClick={() => setTeacherTab('marks')}
                style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                  padding: '20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(99, 102, 241, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -10px rgba(0,0,0,0.5)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#c7d2fe', textTransform: 'uppercase' }}>Class Standing & CGPA</span>
                  <span style={{ fontSize: '22px' }}>🏆</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#facc15', margin: '8px 0 4px' }}>
                  {analytics.passRate}% <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: '700' }}>({analytics.avgCGPA} Avg)</span>
                </div>
                <div style={{ fontSize: '12px', color: analytics.arrearCount > 0 ? '#fca5a5' : '#34d399', fontWeight: '700' }}>
                  {analytics.arrearCount > 0 ? `⚠️ ${analytics.arrearCount} Student(s) with Arrears →` : '✨ 100% Class Pass Rate →'}
                </div>
              </div>

              {/* STAT 2: Attendance */}
              <div
                onClick={() => setTeacherTab('attendance')}
                style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
                  padding: '20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(16, 185, 129, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -10px rgba(0,0,0,0.5)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#a7f3d0', textTransform: 'uppercase' }}>6-Course Attendance</span>
                  <span style={{ fontSize: '22px' }}>📊</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399', margin: '8px 0 4px' }}>
                  {analytics.avgAttendance}%
                </div>
                <div style={{ fontSize: '12px', color: Number(analytics.avgAttendance) >= 75 ? '#6ee7b7' : '#fca5a5', fontWeight: '600' }}>
                  {Number(analytics.avgAttendance) >= 75 ? '✅ Click to view Attendance Register →' : '⚠️ Shortage Risk - Click to view →'}
                </div>
              </div>

              {/* STAT 3: Continuous Assessment */}
              <div
                onClick={() => setTeacherTab('ca1')}
                style={{
                  background: 'linear-gradient(135deg, #701a75 0%, #86198f 100%)',
                  padding: '20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(217, 70, 239, 0.4)',
                  boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(217, 70, 239, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -10px rgba(0,0,0,0.5)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#f5d0fe', textTransform: 'uppercase' }}>Midterm CA1 / CA2</span>
                  <span style={{ fontSize: '22px' }}>📝</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#f0abfc', margin: '8px 0 4px' }}>
                  Scorecards
                </div>
                <div style={{ fontSize: '12px', color: '#f5d0fe', fontWeight: '600' }}>
                  Click to view & grade CA marksheets →
                </div>
              </div>

              {/* STAT 4: Tuition Fee Ledger */}
              <div
                onClick={() => setTeacherTab('fees')}
                style={{
                  background: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
                  padding: '20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(245, 158, 11, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -10px rgba(0,0,0,0.5)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#fde68a', textTransform: 'uppercase' }}>Fee Collection Ledger</span>
                  <span style={{ fontSize: '22px' }}>💰</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: analytics.totalFeesPending > 0 ? '#fca5a5' : '#34d399', margin: '8px 0 4px' }}>
                  ₹{Number(analytics.totalFeesPending || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '12px', color: '#fde68a', fontWeight: '600' }}>
                  {analytics.totalFeesPending > 0 ? '⚠️ Click to inspect fee statements →' : '✅ 100% Student Fees Cleared →'}
                </div>
              </div>
            </div>

            {/* 6 COLORFUL CORE SUBJECT CARDS (STUDENT DASHBOARD STYLING) */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📚</span> 6 Core Courses (Click any card to open detailed course view)
                </h3>
                <span style={{ fontSize: '12px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 12px', borderRadius: '10px', fontWeight: '700' }}>
                  Regulation 2021 • Semester III
                </span>
              </div>

              {/* Grid of 6 Core Subject Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '18px',
                }}
              >
                {CORE_SUBJECTS.map((sub, i) => {
                  const stat = analytics.subjectStats[sub.name] || { totalMarks: 0, passCount: 0, failCount: 0, totalAtt: 0 };
                  const count = students.length || 1;
                  const avgM = (stat.totalMarks / count).toFixed(1);
                  const avgA = Math.round(stat.totalAtt / count);
                  const passPct = Math.round((stat.passCount / count) * 100);
                  const routine = SUBJECT_ROUTINE_INFO[sub.name] || {};
                  const hasArrears = stat.failCount > 0;

                  return (
                    <div
                      key={`teacher-core-sub-${sub.code}-${i}`}
                      onClick={() => handleOpenSubjectDetail(sub)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        borderRadius: '20px',
                        border: `1px solid ${hasArrears ? '#ef4444' : `${sub.color}60`}`,
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                        transition: 'transform 0.25s, box-shadow 0.25s',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
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
                      {/* Header bar matching Student Card */}
                      <div>
                        <div
                          style={{
                            background: hasArrears
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
                              color: hasArrears ? '#ef4444' : sub.color,
                              fontWeight: '900',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                            }}
                          >
                            {passPct}% Pass
                          </span>
                        </div>

                        {/* Body metrics */}
                        <div style={{ padding: '20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '12px' }}>
                            {sub.fullName}
                          </div>

                          {/* Routine & Classroom mini-badge */}
                          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px', marginBottom: '14px', fontSize: '11px', color: '#94a3b8' }}>
                            <div>🕒 {routine.slot}</div>
                            <div style={{ marginTop: '2px', color: '#cbd5e1' }}>📍 {routine.classroom}</div>
                          </div>

                          {/* Class Attendance Progress */}
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                              <span style={{ color: '#94a3b8' }}>Class Attendance</span>
                              <strong style={{ color: avgA >= 75 ? '#34d399' : '#f87171' }}>{avgA}%</strong>
                            </div>
                            <div style={{ height: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(100, avgA)}%`,
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${sub.color}, #34d399)`,
                                  borderRadius: '10px',
                                }}
                              />
                            </div>
                          </div>

                          {/* Class Average Marks Summary Box */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px' }}>
                            <div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Class Average</div>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: Number(avgM) >= 50 ? '#38bdf8' : '#f87171' }}>{avgM} / 100</div>
                            </div>
                            <span style={{ color: sub.color, fontSize: '12px', fontWeight: '800' }}>
                              Inspect Details →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DIRECT MODULE & MANAGEMENT PORTAL CARDS (VIBRANT STYLING) */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '6px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⚡</span> Academic Management Portals
              </h2>
              <p style={{ margin: '0 0 18px', color: '#94a3b8', fontSize: '13px' }}>
                Quick direct access to student gradebooks, examination registers, fees ledger and circulars.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {navTabs
                  .filter((tab) => tab.id !== 'dashboard' && !tab.hiddenFromSidebar)
                  .map((tab, idx) => {
                    // Vibrant theme colors for each portal
                    const colorThemes = {
                      attendance: { bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', border: 'rgba(16, 185, 129, 0.45)', glow: 'rgba(16, 185, 129, 0.35)', tag: '#6ee7b7' },
                      marks: { bg: 'linear-gradient(135deg, #881337 0%, #9f1239 100%)', border: 'rgba(244, 63, 94, 0.45)', glow: 'rgba(244, 63, 94, 0.35)', tag: '#fda4af' },
                      ca1: { bg: 'linear-gradient(135deg, #312e81 0%, #3730a3 100%)', border: 'rgba(99, 102, 241, 0.45)', glow: 'rgba(99, 102, 241, 0.35)', tag: '#c7d2fe' },
                      ca2: { bg: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)', border: 'rgba(168, 85, 247, 0.45)', glow: 'rgba(168, 85, 247, 0.35)', tag: '#e9d5ff' },
                      routine: { bg: 'linear-gradient(135deg, #134e4a 0%, #115e59 100%)', border: 'rgba(20, 184, 166, 0.45)', glow: 'rgba(20, 184, 166, 0.35)', tag: '#99f6e4' },
                      register: { bg: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)', border: 'rgba(6, 182, 212, 0.45)', glow: 'rgba(6, 182, 212, 0.35)', tag: '#a5f3fc' },
                      fees: { bg: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)', border: 'rgba(245, 158, 11, 0.45)', glow: 'rgba(245, 158, 11, 0.35)', tag: '#fde68a' },
                      notices: { bg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', border: 'rgba(148, 163, 184, 0.45)', glow: 'rgba(148, 163, 184, 0.35)', tag: '#e2e8f0' },
                      profile: { bg: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)', border: 'rgba(139, 92, 246, 0.45)', glow: 'rgba(139, 92, 246, 0.35)', tag: '#ddd6fe' },
                    };
                    const theme = colorThemes[tab.id] || { bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: `${tab.color}45`, glow: `${tab.color}35`, tag: tab.color };

                    return (
                      <div
                        key={`portal-tab-${tab.id}-${idx}`}
                        onClick={() => setTeacherTab(tab.id)}
                        style={{
                          background: theme.bg,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '20px',
                          padding: '22px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          boxShadow: '0 10px 25px -10px rgba(0,0,0,0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = `0 15px 30px -5px ${theme.glow}`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 25px -10px rgba(0,0,0,0.5)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                            {tab.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ display: 'block', fontSize: '16px', color: '#fff', fontWeight: '800' }}>{tab.label}</strong>
                            <p style={{ margin: '6px 0 12px', color: '#cbd5e1', fontSize: '12px', lineHeight: '1.45' }}>{tab.desc}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ color: theme.tag, fontSize: '12px', fontWeight: '800' }}>Open Module View →</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: DEDICATED SUBJECT DETAIL INSPECTOR (VIEW ON CARD CLICK)
        ===================================================== */}
        {teacherTab === 'subject_detail' && activeSubjectDetail && (
          <div>
            {/* Subject Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '20px' }}>
              {CORE_SUBJECTS.map((sub) => {
                const active = activeSubjectDetail.name === sub.name;
                return (
                  <button
                    key={`detail-sub-tab-${sub.code}`}
                    onClick={() => setActiveSubjectDetail(sub)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '14px',
                      border: active ? `1px solid ${sub.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? `${sub.color}30` : 'rgba(30, 41, 59, 0.6)',
                      color: active ? '#fff' : '#cbd5e1',
                      fontWeight: active ? '800' : '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name} ({sub.code})</span>
                  </button>
                );
              })}
            </div>

            {/* Subject Hero Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '24px', border: `1px solid ${activeSubjectDetail.color}60`, padding: isMobile ? '20px' : '28px', marginBottom: '24px', boxShadow: `0 15px 35px -10px ${activeSubjectDetail.color}30` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${activeSubjectDetail.color}30`, border: `1px solid ${activeSubjectDetail.color}80`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    {activeSubjectDetail.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#fff' }}>{activeSubjectDetail.fullName}</h2>
                      <span style={{ background: activeSubjectDetail.color, color: '#fff', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                        {activeSubjectDetail.code}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#93c5fd', fontSize: '13px', fontWeight: '600' }}>
                      Anna University Chennai • Reg 2021 • Semester III • {SUBJECT_ROUTINE_INFO[activeSubjectDetail.name]?.credits || '4 Credits'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setSelectedSubjectFilter(activeSubjectDetail.name);
                      setTeacherTab('marks');
                    }}
                    style={{ padding: '9px 16px', background: 'linear-gradient(135deg, #e11d48, #f43f5e)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                  >
                    📈 Edit Semester Marks
                  </button>
                  <button
                    onClick={() => {
                      setTeacherTab('attendance');
                    }}
                    style={{ padding: '9px 16px', background: 'linear-gradient(135deg, #0284c7, #06b6d4)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                  >
                    📋 Edit Attendance
                  </button>
                </div>
              </div>

              {/* Course Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Class Routine</div>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: '700', marginTop: '4px' }}>
                    {SUBJECT_ROUTINE_INFO[activeSubjectDetail.name]?.slot}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Lab / Tutorial Slot</div>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: '700', marginTop: '4px' }}>
                    {SUBJECT_ROUTINE_INFO[activeSubjectDetail.name]?.labSlot}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Classroom / Lab Venue</div>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: '700', marginTop: '4px' }}>
                    {SUBJECT_ROUTINE_INFO[activeSubjectDetail.name]?.classroom}
                  </div>
                </div>
              </div>

              {/* Syllabus Summary */}
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '14px' }}>
                <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: '800' }}>Syllabus Units & Modules</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.5' }}>
                  {SUBJECT_ROUTINE_INFO[activeSubjectDetail.name]?.syllabus}
                </div>
              </div>
            </div>

            {/* Student Roster for this Subject */}
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: isMobile ? '20px' : '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#fff' }}>
                  🧑‍🎓 Enrolled Students Performance in {activeSubjectDetail.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Total {students.length} students enrolled
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px 16px' }}>Reg No</th>
                      <th style={{ padding: '12px 16px' }}>Student Name</th>
                      <th style={{ padding: '12px 16px' }}>CA1 (60)</th>
                      <th style={{ padding: '12px 16px' }}>CA2 (60)</th>
                      <th style={{ padding: '12px 16px' }}>Semester Mark (100)</th>
                      <th style={{ padding: '12px 16px' }}>Attendance</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((stu, idx) => {
                      const semM = Number(stu.semesterMarks?.[activeSubjectDetail.name] ?? 75);
                      const ca1M = Number(stu.ca1Marks?.[activeSubjectDetail.name] ?? 42);
                      const ca2M = Number(stu.ca2Marks?.[activeSubjectDetail.name] ?? 45);
                      const att = Number(stu.attendance?.[activeSubjectDetail.name] ?? stu.attendanceMap?.[activeSubjectDetail.name] ?? 85);
                      const { grade, status } = calculateGradeAndStatus(semM, 100);
                      const isPass = semM >= 40;

                      return (
                        <tr key={`subject-roster-stu-${getStudentId(stu)}-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '700' }}>
                            {getStudentRegNo(stu)}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#fff' }}>
                            {stu.name}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                            {ca1M} / 60
                          </td>
                          <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                            {ca2M} / 60
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <strong style={{ color: isPass ? '#38bdf8' : '#f87171', fontSize: '15px' }}>{semM}</strong>
                            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#94a3b8' }}>({grade})</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: att >= 75 ? '#34d399' : '#f87171', fontWeight: '700' }}>{att}%</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: isPass ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isPass ? '#6ee7b7' : '#fca5a5', border: `1px solid ${isPass ? '#10b981' : '#ef4444'}`, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: CLASS ROUTINE & TIMETABLE (DEDICATED VIEW)
        ===================================================== */}
        {teacherTab === 'routine' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', padding: isMobile ? '20px' : '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, color: '#fff' }}>📅 Department Timetable & Class Routine</h2>
                  <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                    Weekly Lecture & Lab Session schedule for all 6 Core Courses (Regulation 2021)
                  </p>
                </div>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid #10b981', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                  Odd Semester 2026-2027
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {CORE_SUBJECTS.map((sub) => {
                  const routine = SUBJECT_ROUTINE_INFO[sub.name] || {};
                  return (
                    <div
                      key={`routine-card-${sub.code}`}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${sub.color}40`,
                        borderRadius: '18px',
                        padding: '20px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{sub.icon}</span>
                        <div>
                          <strong style={{ fontSize: '16px', color: '#fff' }}>{sub.name}</strong>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sub.code} • {sub.fullName}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                          <span style={{ color: '#94a3b8' }}>Theory Slot: </span>
                          <strong style={{ color: '#fff' }}>{routine.slot}</strong>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                          <span style={{ color: '#94a3b8' }}>Practical / Lab: </span>
                          <strong style={{ color: '#fff' }}>{routine.labSlot}</strong>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '10px' }}>
                          <span style={{ color: '#94a3b8' }}>Venue: </span>
                          <strong style={{ color: '#38bdf8' }}>{routine.classroom}</strong>
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
            TAB: FACULTY PROFILE (DEDICATED VIEW)
        ===================================================== */}
        {teacherTab === 'profile' && (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', padding: '36px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: '#fff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '900', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                  👨‍🏫
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: '#fff' }}>{teacherProfile.name}</h2>
                  <p style={{ margin: '4px 0 0', color: '#bfdbfe', fontSize: '14px', fontWeight: '600' }}>{teacherProfile.designation} • {teacherProfile.department}</p>
                </div>
              </div>

              <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <TeacherProfileField label="Teacher ID" value={teacherProfile.identifier} />
                <TeacherProfileField label="Experience" value={teacherProfile.experience} />
                <TeacherProfileField label="Email Address" value={teacherProfile.email} />
                <TeacherProfileField label="Contact Phone" value={teacherProfile.phone} />
              </div>

              <div style={{ padding: '0 30px 30px' }}>
                <h4 style={{ color: '#38bdf8', marginBottom: '14px', fontSize: '14px', textTransform: 'uppercase', fontWeight: '800' }}>Subjects Handled (6 Core Courses)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {CORE_SUBJECTS.map((sub, idx) => (
                    <span key={`handled-sub-${sub.code}-${idx}`} style={{ background: `${sub.color}25`, border: `1px solid ${sub.color}60`, color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{sub.icon}</span> {sub.name} ({sub.code})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: STUDENT REGISTRATION (DEDICATED VIEW)
        ===================================================== */}
        {teacherTab === 'register' && (
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            {recentlyAddedStudent && (
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', padding: '20px', borderRadius: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#34d399', fontSize: '16px' }}>🎉 Student Successfully Added to Class Roster!</strong>
                  <button onClick={() => setRecentlyAddedStudent(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
                <div style={{ fontSize: '14px', color: '#e2e8f0' }}>
                  Name: <strong>{recentlyAddedStudent.name}</strong> • Reg: <strong style={{ color: '#38bdf8' }}>{recentlyAddedStudent.regNo}</strong> • Dept: {recentlyAddedStudent.department}
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
                  ✅ 6 Core Subjects (OOPS, DM, DS, OS, DPCO, CN) automatically initialized with full grading sheets.
                </div>
              </div>
            )}

            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', padding: isMobile ? '24px' : '36px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 16px', color: '#fff' }}>📝 Student Enrollment Form</h2>
              <form onSubmit={handleRegisterStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={formLabelStyle}>Student Full Name</label>
                  <input
                    type="text"
                    value={newStuName}
                    onChange={(e) => setNewStuName(e.target.value)}
                    placeholder="Enter student full name"
                    required
                    style={formInputStyle}
                  />
                </div>

                <div>
                  <label style={formLabelStyle}>Register Number</label>
                  <input
                    type="text"
                    value={newStuReg}
                    onChange={(e) => setNewStuReg(e.target.value)}
                    placeholder="Enter student register number"
                    required
                    style={formInputStyle}
                  />
                </div>

                <div>
                  <label style={formLabelStyle}>Academic Department</label>
                  <select value={newStuDept} onChange={(e) => setNewStuDept(e.target.value)} style={formInputStyle}>
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="AI & Data Science">AI & Data Science (AI&DS)</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                  </select>
                </div>

                <div>
                  <label style={formLabelStyle}>Seat Quota</label>
                  <select value={newStuQuota} onChange={(e) => setNewStuQuota(e.target.value)} style={formInputStyle}>
                    <option value="Counselling">Counselling (Govt TNEA)</option>
                    <option value="Management">Management Quota</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingAction === 'register'}
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: savingAction === 'register' ? 'not-allowed' : 'pointer',
                    marginTop: '8px',
                    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {savingAction === 'register' ? 'Registering Student...' : 'Register Student & Initialize 6 Subjects'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: SEMESTER MARKS & CGPA (DEDICATED DETAIL VIEW)
        ===================================================== */}
        {teacherTab === 'marks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>📈 Semester Marks & CGPA (6 Subjects)</h2>
                <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
                  Enter realistic marks (0-100). Marks &lt; 40 indicate <span style={{ color: '#f87171', fontWeight: 'bold' }}>FAIL (U Grade / Arrear)</span>. Marks &ge; 40 indicate <span style={{ color: '#34d399', fontWeight: 'bold' }}>PASS</span>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', background: 'rgba(30, 41, 59, 0.8)', padding: '6px', borderRadius: '14px', flexWrap: 'wrap', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setSelectedSubjectFilter('ALL')}
                  style={{ background: selectedSubjectFilter === 'ALL' ? '#3b82f6' : 'transparent', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  All 6 Subjects
                </button>
                {CORE_SUBJECTS.map((sub, idx) => (
                  <button
                    key={`filter-sub-${sub.name}-${idx}`}
                    onClick={() => setSelectedSubjectFilter(sub.name)}
                    style={{ background: selectedSubjectFilter === sub.name ? sub.color : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {students.map((student, idx) => {
                const id = getStudentId(student) || `student-${idx}`;
                const marks = student.semesterMarks || {};
                const isEditing = editingMarksId === id;

                // Check fail status
                const failedSubjects = CORE_SUBJECTS.filter((sub) => (marks[sub.name] ?? 75) < 40);
                const hasArrears = failedSubjects.length > 0;

                return (
                  <div key={`marks-card-${id}-${idx}`} style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)', padding: '24px', borderRadius: '22px', border: `1px solid ${hasArrears ? '#ef444480' : 'rgba(255,255,255,0.12)'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '18px', color: '#fff' }}>{student.name}</strong>
                        <span style={{ marginLeft: '10px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>({getStudentRegNo(student)})</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                          <span style={{ fontSize: '13px', color: '#cbd5e1' }}>CGPA: <strong style={{ color: '#facc15' }}>{student.cgpa || '7.50'}</strong></span>
                          {hasArrears ? (
                            <span style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid #ef4444', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              ⚠️ {failedSubjects.length} Arrear Subject(s) ({failedSubjects.map((s) => s.name).join(', ')})
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              ✅ All 6 Subjects Passed
                            </span>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleSaveMarks(id)} disabled={savingAction === `marks-${id}`} style={saveBtnStyle}>
                            {savingAction === `marks-${id}` ? 'Saving...' : '💾 Save All 6 Marks'}
                          </button>
                          <button onClick={() => setEditingMarksId(null)} style={{ ...editBtnStyle, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingMarksId(id);
                            setTempMarks({ ...marks });
                          }}
                          style={editBtnStyle}
                        >
                          ✏️ Edit Marks
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      {CORE_SUBJECTS.map((sub, subIdx) => {
                        const val = isEditing ? (tempMarks[sub.name] ?? marks[sub.name] ?? 75) : (marks[sub.name] ?? 75);
                        const numVal = Number(val);
                        const isPass = numVal >= 40;
                        const { grade, status } = calculateGradeAndStatus(numVal, 100);

                        return (
                          <div
                            key={`marks-item-${sub.code}-${subIdx}`}
                            style={{
                              background: isPass ? 'rgba(255,255,255,0.04)' : 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${isPass ? 'rgba(255,255,255,0.08)' : 'rgba(239, 68, 68, 0.4)'}`,
                              padding: '14px',
                              borderRadius: '14px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '12px', fontWeight: '800', color: sub.color, marginBottom: '4px' }}>
                              {sub.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                              {sub.fullName.split(' ')[0]}
                            </div>

                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={val}
                                onChange={(e) => setTempMarks((prev) => ({ ...prev, [sub.name]: e.target.value }))}
                                style={{ width: '70px', padding: '6px', textAlign: 'center', background: '#0f172a', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: '800' }}
                              />
                            ) : (
                              <div style={{ fontSize: '20px', fontWeight: '900', color: isPass ? '#38bdf8' : '#f87171' }}>
                                {numVal}
                              </div>
                            )}

                            <div style={{ marginTop: '8px', fontSize: '11px', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: '700', color: '#cbd5e1' }}>Grade: {grade}</span>
                              <span>•</span>
                              <span style={{ color: isPass ? '#34d399' : '#f87171', fontWeight: '800' }}>{status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: 6-SUBJECT ATTENDANCE (DEDICATED DETAIL VIEW)
        ===================================================== */}
        {teacherTab === 'attendance' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>📋 6-Subject Attendance Register</h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
                Minimum required university eligibility threshold is <span style={{ color: '#34d399', fontWeight: 'bold' }}>75%</span>. Scores below 75% are flagged for detention risk.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {students.map((student, idx) => {
                const id = getStudentId(student) || `att-stu-${idx}`;
                const att = student.attendance || student.attendanceMap || {};
                const isEditing = editingAttendanceId === id;

                return (
                  <div key={`att-card-${id}-${idx}`} style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)', padding: '24px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '18px', color: '#fff' }}>{student.name}</strong>
                        <span style={{ marginLeft: '10px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>({getStudentRegNo(student)})</span>
                      </div>

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleSaveAttendance(id)} disabled={savingAction === `att-${id}`} style={saveBtnStyle}>
                            {savingAction === `att-${id}` ? 'Saving...' : '💾 Save Attendance'}
                          </button>
                          <button onClick={() => setEditingAttendanceId(null)} style={{ ...editBtnStyle, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingAttendanceId(id);
                            setTempAttendance({ ...att });
                          }}
                          style={editBtnStyle}
                        >
                          ✏️ Update Attendance
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      {CORE_SUBJECTS.map((sub, subIdx) => {
                        const val = isEditing ? (tempAttendance[sub.name] ?? att[sub.name] ?? 85) : (att[sub.name] ?? 85);
                        const numVal = Number(val);
                        const isSafe = numVal >= 75;

                        return (
                          <div
                            key={`att-item-${sub.code}-${subIdx}`}
                            style={{
                              background: isSafe ? 'rgba(255,255,255,0.04)' : 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${isSafe ? 'rgba(255,255,255,0.08)' : 'rgba(239, 68, 68, 0.4)'}`,
                              padding: '14px',
                              borderRadius: '14px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '12px', fontWeight: '800', color: sub.color, marginBottom: '6px' }}>
                              {sub.name}
                            </div>

                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={val}
                                onChange={(e) => setTempAttendance((prev) => ({ ...prev, [sub.name]: e.target.value }))}
                                style={{ width: '65px', padding: '6px', textAlign: 'center', background: '#0f172a', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: '800' }}
                              />
                            ) : (
                              <div style={{ fontSize: '20px', fontWeight: '900', color: isSafe ? '#34d399' : '#f87171' }}>
                                {numVal}%
                              </div>
                            )}

                            <div style={{ marginTop: '6px', fontSize: '11px', color: isSafe ? '#6ee7b7' : '#fca5a5', fontWeight: '700' }}>
                              {isSafe ? 'Eligible' : 'Shortage'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: CA1 ASSESSMENT MARKS (DEDICATED DETAIL VIEW)
        ===================================================== */}
        {teacherTab === 'ca1' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>📝 Continuous Assessment CA1 (Out of 60)</h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
                CA1 Midterm Theory Assessment. Pass requirement: &ge; 24 / 60.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {students.map((student, idx) => {
                const id = getStudentId(student) || `ca1-stu-${idx}`;
                const marks = student.ca1Marks || {};
                const isEditing = editingCA1Id === id;

                return (
                  <div key={`ca1-card-${id}-${idx}`} style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)', padding: '24px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '18px', color: '#fff' }}>{student.name}</strong>
                        <span style={{ marginLeft: '10px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>({getStudentRegNo(student)})</span>
                      </div>

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleSaveCA1(id)} disabled={savingAction === `ca1-${id}`} style={saveBtnStyle}>
                            {savingAction === `ca1-${id}` ? 'Saving...' : '💾 Save CA1 Marks'}
                          </button>
                          <button onClick={() => setEditingCA1Id(null)} style={{ ...editBtnStyle, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCA1Id(id);
                            setTempCA1({ ...marks });
                          }}
                          style={editBtnStyle}
                        >
                          ✏️ Enter CA1 Marks
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      {CORE_SUBJECTS.map((sub, subIdx) => {
                        const val = isEditing ? (tempCA1[sub.name] ?? marks[sub.name] ?? 40) : (marks[sub.name] ?? 40);
                        const numVal = Number(val);
                        const isPass = numVal >= 24;

                        return (
                          <div
                            key={`ca1-item-${sub.code}-${subIdx}`}
                            style={{
                              background: isPass ? 'rgba(255,255,255,0.04)' : 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${isPass ? 'rgba(255,255,255,0.08)' : 'rgba(239, 68, 68, 0.4)'}`,
                              padding: '14px',
                              borderRadius: '14px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '12px', fontWeight: '800', color: sub.color, marginBottom: '6px' }}>
                              {sub.name}
                            </div>

                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="60"
                                value={val}
                                onChange={(e) => setTempCA1((prev) => ({ ...prev, [sub.name]: e.target.value }))}
                                style={{ width: '65px', padding: '6px', textAlign: 'center', background: '#0f172a', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: '800' }}
                              />
                            ) : (
                              <div style={{ fontSize: '20px', fontWeight: '900', color: isPass ? '#38bdf8' : '#f87171' }}>
                                {numVal} <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ 60</span>
                              </div>
                            )}

                            <div style={{ marginTop: '6px', fontSize: '11px', color: isPass ? '#34d399' : '#f87171', fontWeight: '700' }}>
                              {isPass ? 'Pass' : 'Fail'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: CA2 ASSESSMENT MARKS (DEDICATED DETAIL VIEW)
        ===================================================== */}
        {teacherTab === 'ca2' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>📈 Continuous Assessment CA2 (Out of 60)</h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
                CA2 Model Examination Assessment. Pass requirement: &ge; 24 / 60.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {students.map((student, idx) => {
                const id = getStudentId(student) || `ca2-stu-${idx}`;
                const marks = student.ca2Marks || {};
                const isEditing = editingCA2Id === id;

                return (
                  <div key={`ca2-card-${id}-${idx}`} style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)', padding: '24px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '18px', color: '#fff' }}>{student.name}</strong>
                        <span style={{ marginLeft: '10px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '14px', fontWeight: '700' }}>({getStudentRegNo(student)})</span>
                      </div>

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleSaveCA2(id)} disabled={savingAction === `ca2-${id}`} style={saveBtnStyle}>
                            {savingAction === `ca2-${id}` ? 'Saving...' : '💾 Save CA2 Marks'}
                          </button>
                          <button onClick={() => setEditingCA2Id(null)} style={{ ...editBtnStyle, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCA2Id(id);
                            setTempCA2({ ...marks });
                          }}
                          style={editBtnStyle}
                        >
                          ✏️ Enter CA2 Marks
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      {CORE_SUBJECTS.map((sub, subIdx) => {
                        const val = isEditing ? (tempCA2[sub.name] ?? marks[sub.name] ?? 42) : (marks[sub.name] ?? 42);
                        const numVal = Number(val);
                        const isPass = numVal >= 24;

                        return (
                          <div
                            key={`ca2-item-${sub.code}-${subIdx}`}
                            style={{
                              background: isPass ? 'rgba(255,255,255,0.04)' : 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${isPass ? 'rgba(255,255,255,0.08)' : 'rgba(239, 68, 68, 0.4)'}`,
                              padding: '14px',
                              borderRadius: '14px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '12px', fontWeight: '800', color: sub.color, marginBottom: '6px' }}>
                              {sub.name}
                            </div>

                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="60"
                                value={val}
                                onChange={(e) => setTempCA2((prev) => ({ ...prev, [sub.name]: e.target.value }))}
                                style={{ width: '65px', padding: '6px', textAlign: 'center', background: '#0f172a', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: '800' }}
                              />
                            ) : (
                              <div style={{ fontSize: '20px', fontWeight: '900', color: isPass ? '#38bdf8' : '#f87171' }}>
                                {numVal} <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ 60</span>
                              </div>
                            )}

                            <div style={{ marginTop: '6px', fontSize: '11px', color: isPass ? '#34d399' : '#f87171', fontWeight: '700' }}>
                              {isPass ? 'Pass' : 'Fail'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: STUDENT FEE MANAGEMENT (DEDICATED DETAIL VIEW)
        ===================================================== */}
        {teacherTab === 'fees' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>💰 Student Tuition & Fee Ledger</h2>
              <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>
                Audit and update semester fee balances, concessions and paid dues.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {students.map((student, idx) => {
                const id = getStudentId(student) || `fee-stu-${idx}`;
                const isEditing = editingFeeId === id;
                const paid = Number(student.paidFees || 0);
                const pending = Number(student.pendingFees || 0);
                const total = paid + pending;

                return (
                  <div key={`fee-row-${id}-${idx}`} style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%)', padding: '22px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '17px', color: '#fff' }}>{student.name}</strong>
                      <span style={{ marginLeft: '10px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700' }}>({getStudentRegNo(student)})</span>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Quota: <strong>{student.quota || 'Counselling'}</strong> • Dept: {student.department}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Fee</div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>₹{total.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Paid Fee</div>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempPaidFee}
                            onChange={(e) => setTempPaidFee(e.target.value)}
                            style={{ width: '90px', padding: '6px', background: '#0f172a', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', fontSize: '14px', fontWeight: '800' }}
                          />
                        ) : (
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#34d399' }}>₹{paid.toLocaleString('en-IN')}</div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Balance Pending</div>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempBalanceFee}
                            onChange={(e) => setTempBalanceFee(e.target.value)}
                            style={{ width: '90px', padding: '6px', background: '#0f172a', border: '1px solid #f87171', color: '#f87171', borderRadius: '8px', fontSize: '14px', fontWeight: '800' }}
                          />
                        ) : (
                          <div style={{ fontSize: '15px', fontWeight: '700', color: pending > 0 ? '#f87171' : '#34d399' }}>₹{pending.toLocaleString('en-IN')}</div>
                        )}
                      </div>

                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleSaveFee(id)} disabled={savingAction === `fee-${id}`} style={saveBtnStyle}>
                            {savingAction === `fee-${id}` ? 'Saving...' : '💾 Save'}
                          </button>
                          <button onClick={() => setEditingFeeId(null)} style={{ ...editBtnStyle, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingFeeId(id);
                            setTempPaidFee(paid);
                            setTempBalanceFee(pending);
                          }}
                          style={editBtnStyle}
                        >
                          ✏️ Update
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            TAB: DEPARTMENT NOTICES (DEDICATED DETAIL VIEW)
        ===================================================== */}
        {teacherTab === 'notices' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)', padding: isMobile ? '20px' : '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 16px', color: '#fff' }}>📢 Publish Official Announcement</h2>
              <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={formLabelStyle}>Circular Title</label>
                  <input
                    type="text"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    placeholder="Enter circular title"
                    required
                    style={formInputStyle}
                  />
                </div>

                <div>
                  <label style={formLabelStyle}>Message Body / Instructions</label>
                  <textarea
                    rows={4}
                    value={newNoticeMsg}
                    onChange={(e) => setNewNoticeMsg(e.target.value)}
                    placeholder="Provide full schedule, hall tickets details, and submission guidelines..."
                    required
                    style={{ ...formInputStyle, resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingAction === 'notice'}
                  style={{
                    padding: '14px',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: savingAction === 'notice' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  {savingAction === 'notice' ? 'Publishing...' : '📢 Broadcast Announcement to All Students'}
                </button>
              </form>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', color: '#fff' }}>Recent Circulars</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {notices.map((n, i) => (
                <div key={`teacher-notice-${n._id || n.id || i}-${i}`} style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '16px', color: '#38bdf8' }}>{n.title}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(n.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5' }}>{n.message}</p>
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

function TeacherProfileField({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{value}</div>
    </div>
  );
}

const formInputStyle = {
  width: '100%',
  padding: '13px 16px',
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '14px',
  color: '#fff',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const formLabelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#cbd5e1',
  fontWeight: '700',
  marginBottom: '6px',
};

const editBtnStyle = {
  padding: '9px 16px',
  background: 'rgba(59, 130, 246, 0.2)',
  border: '1px solid #3b82f6',
  color: '#93c5fd',
  borderRadius: '12px',
  fontWeight: '800',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const saveBtnStyle = {
  padding: '9px 18px',
  background: 'linear-gradient(135deg, #059669, #10b981)',
  border: 'none',
  color: '#fff',
  borderRadius: '12px',
  fontWeight: '800',
  fontSize: '12px',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
};

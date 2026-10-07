import React, { useState } from 'react';
import RoleSelection from './RoleSelection';
import SignIn from './SignIn';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

export default function App() {
  const [selectedRole, setSelectedRole] = useState(
    () => localStorage.getItem('selectedRole') || null
  );
  const [authToken, setAuthToken] = useState(
    () => localStorage.getItem('authToken') || ''
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    () =>
      Boolean(
        localStorage.getItem('authToken') &&
        localStorage.getItem('selectedRole')
      )
  );

  const [currentStudentRegNo, setCurrentStudentRegNo] = useState(
    () => localStorage.getItem('studentRegNo') || ''
  );

  const [currentStudentName, setCurrentStudentName] = useState(
    () => localStorage.getItem('studentName') || ''
  );

  const [teacherName, setTeacherName] = useState(
    () => localStorage.getItem('teacherName') || ''
  );

  const [studentView, setStudentView] = useState('home');

  // --------------------------------------------------
  // ROLE SELECTION
  // --------------------------------------------------
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setIsLoggedIn(false);

    localStorage.setItem('selectedRole', role);

    // Remove old session when changing role
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentRegNo');
    localStorage.removeItem('studentName');
    localStorage.removeItem('teacherName');

    setAuthToken('');
    setCurrentStudentRegNo('');
    setCurrentStudentName('');
    setTeacherName('');
  };

  // --------------------------------------------------
  // LOGIN SUCCESS
  // --------------------------------------------------
  const handleLoginSuccess = (identifier, enteredName, token) => {
    if (!token) {
      console.error('Login succeeded without an auth token.');
      return;
    }

    setIsLoggedIn(true);
    setAuthToken(token);
    localStorage.setItem('authToken', token);

    if (selectedRole === 'student') {
      const regNo = identifier.trim();
      const sName = enteredName?.trim() || regNo;

      setCurrentStudentRegNo(regNo);
      setCurrentStudentName(sName);

      localStorage.setItem('studentRegNo', regNo);
      localStorage.setItem('studentName', sName);

      localStorage.removeItem('teacherName');
      setTeacherName('');
    }

    if (selectedRole === 'teacher') {
      const teacherId = identifier.trim();
      const tName = enteredName?.trim() || teacherId;

      setTeacherName(tName);
      localStorage.setItem('teacherName', tName);

      localStorage.removeItem('studentRegNo');
      localStorage.removeItem('studentName');
      setCurrentStudentRegNo('');
      setCurrentStudentName('');
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  const handleLogout = () => {
    const sessionKeys = [
      'authToken',
      'selectedRole',
      'studentRegNo',
      'studentName',
      'teacherName',
    ];

    sessionKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    setSelectedRole(null);
    setIsLoggedIn(false);
    setAuthToken('');
    setCurrentStudentRegNo('');
    setCurrentStudentName('');
    setTeacherName('');
    setStudentView('home');
  };

  // --------------------------------------------------
  // 1. ROLE SELECTION
  // --------------------------------------------------
  if (!selectedRole) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  // --------------------------------------------------
  // 2. LOGIN
  // --------------------------------------------------
  if (!isLoggedIn || !authToken) {
    return (
      <SignIn
        role={selectedRole}
        onLogin={handleLoginSuccess}
        onBack={handleLogout}
      />
    );
  }

  // --------------------------------------------------
  // 3. DASHBOARD (Teacher / Student)
  // --------------------------------------------------
  return (
    <div>
      {selectedRole === 'teacher' ? (
        <TeacherDashboard
          authToken={authToken}
          teacherName={teacherName}
          onLogout={handleLogout}
        />
      ) : (
        <StudentDashboard
          view={studentView}
          registerNo={currentStudentRegNo}
          studentName={currentStudentName}
          authToken={authToken}
          onLogout={handleLogout}
          onViewChange={setStudentView}
        />
      )}
    </div>
  );
}

// src/Api.jsx
// Comprehensive API handler with 6 Core Subjects, diverse realistic pass/fail marks, unique ID generation, and persistent storage.

const REMOTE_URL = 'https://backend-app-eychdrlc.onslate.in/api';

export const CORE_SUBJECTS = [
  { code: 'CS3301', name: 'OOPS', fullName: 'Object Oriented Programming', icon: '💻', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { code: 'MA3354', name: 'DM', fullName: 'Discrete Mathematics', icon: '📐', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  { code: 'CS3351', name: 'DS', fullName: 'Data Structures', icon: '🌲', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { code: 'CS3451', name: 'OS', fullName: 'Operating System', icon: '⚙️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { code: 'CS3352', name: 'DPCO', fullName: 'Digital Principles & Computer Org', icon: '⚡', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  { code: 'CS3591', name: 'CN', fullName: 'Computer Networks', icon: '🌐', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
];

export const DEFAULT_STUDENTS = [
  {
    _id: 'stu-cs101',
    id: 'stu-cs101',
    role: 'student',
    identifier: 'CS101',
    regNo: 'CS101',
    name: 'Arun Kumar',
    department: 'Computer Science & Engineering',
    quota: 'Counselling',
    totalFees: 100000,
    paidFees: 85000,
    pendingFees: 15000,
    cgpa: 8.70,
    attendance: { OOPS: 94, DM: 90, DS: 96, OS: 88, DPCO: 92, CN: 95 },
    attendanceMap: { OOPS: 94, DM: 90, DS: 96, OS: 88, DPCO: 92, CN: 95 },
    semesterMarks: { OOPS: 88, DM: 84, DS: 92, OS: 82, DPCO: 86, CN: 90 },
    semesterGrades: { OOPS: 'A+', DM: 'A', DS: 'O', OS: 'A', DPCO: 'A+', CN: 'O' },
    semesterStatus: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Marks: { OOPS: 48, DM: 44, DS: 52, OS: 42, DPCO: 46, CN: 50 },
    ca1Grades: { OOPS: 'A', DM: 'B+', DS: 'O', OS: 'B+', DPCO: 'A', CN: 'O' },
    ca1Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Assignments: { OOPS: 19, DM: 18, DS: 20, OS: 17, DPCO: 19, CN: 20 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 50, DM: 46, DS: 54, OS: 45, DPCO: 48, CN: 52 },
    ca2Grades: { OOPS: 'O', DM: 'A', DS: 'O', OS: 'A', DPCO: 'A', CN: 'O' },
    ca2Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca2Assignments: { OOPS: 20, DM: 19, DS: 20, OS: 18, DPCO: 19, CN: 20 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
  {
    _id: 'stu-cs102',
    id: 'stu-cs102',
    role: 'student',
    identifier: 'CS102',
    regNo: 'CS102',
    name: 'Priya Dharshini',
    department: 'Computer Science & Engineering',
    quota: 'Counselling',
    totalFees: 100000,
    paidFees: 90000,
    pendingFees: 10000,
    cgpa: 6.03,
    attendance: { OOPS: 88, DM: 76, DS: 84, OS: 80, DPCO: 78, CN: 82 },
    attendanceMap: { OOPS: 88, DM: 76, DS: 84, OS: 80, DPCO: 78, CN: 82 },
    semesterMarks: { OOPS: 72, DM: 54, DS: 68, OS: 48, DPCO: 62, CN: 58 },
    semesterGrades: { OOPS: 'A', DM: 'B', DS: 'B+', OS: 'C', DPCO: 'B+', CN: 'B' },
    semesterStatus: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Marks: { OOPS: 42, DM: 30, DS: 39, OS: 27, DPCO: 36, CN: 33 },
    ca1Grades: { OOPS: 'B+', DM: 'C', DS: 'B', OS: 'C', DPCO: 'B', CN: 'C' },
    ca1Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Assignments: { OOPS: 18, DM: 15, DS: 17, OS: 14, DPCO: 16, CN: 15 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 44, DM: 33, DS: 41, OS: 29, DPCO: 38, CN: 35 },
    ca2Grades: { OOPS: 'A', DM: 'C', DS: 'B+', OS: 'C', DPCO: 'B', CN: 'B' },
    ca2Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca2Assignments: { OOPS: 18, DM: 16, DS: 18, OS: 15, DPCO: 17, CN: 16 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
  {
    _id: 'stu-cs103',
    id: 'stu-cs103',
    role: 'student',
    identifier: 'CS103',
    regNo: 'CS103',
    name: 'Karthik Raja',
    department: 'Computer Science & Engineering',
    quota: 'Management',
    totalFees: 140000,
    paidFees: 140000,
    pendingFees: 0,
    cgpa: 5.23,
    attendance: { OOPS: 92, DM: 70, DS: 88, OS: 66, DPCO: 78, CN: 74 },
    attendanceMap: { OOPS: 92, DM: 70, DS: 88, OS: 66, DPCO: 78, CN: 74 },
    semesterMarks: { OOPS: 82, DM: 34, DS: 78, OS: 28, DPCO: 52, CN: 40 },
    semesterGrades: { OOPS: 'A', DM: 'U', DS: 'A', OS: 'U', DPCO: 'B', CN: 'C' },
    semesterStatus: { OOPS: 'Pass', DM: 'Fail', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
    ca1Marks: { OOPS: 46, DM: 18, DS: 44, OS: 15, DPCO: 29, CN: 24 },
    ca1Grades: { OOPS: 'A', DM: 'Fail', DS: 'A', OS: 'Fail', DPCO: 'C', CN: 'C' },
    ca1Status: { OOPS: 'Pass', DM: 'Fail', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
    ca1Assignments: { OOPS: 19, DM: 10, DS: 18, OS: 8, DPCO: 14, CN: 12 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 48, DM: 20, DS: 46, OS: 17, DPCO: 31, CN: 25 },
    ca2Grades: { OOPS: 'A', DM: 'Fail', DS: 'A', OS: 'Fail', DPCO: 'C', CN: 'C' },
    ca2Status: { OOPS: 'Pass', DM: 'Fail', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
    ca2Assignments: { OOPS: 20, DM: 11, DS: 19, OS: 9, DPCO: 15, CN: 13 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
  {
    _id: 'stu-it101',
    id: 'stu-it101',
    role: 'student',
    identifier: 'IT101',
    regNo: 'IT101',
    name: 'Divya Sri',
    department: 'Information Technology',
    quota: 'Counselling',
    totalFees: 100000,
    paidFees: 75000,
    pendingFees: 25000,
    cgpa: 5.63,
    attendance: { OOPS: 86, DM: 80, DS: 88, OS: 82, DPCO: 70, CN: 84 },
    attendanceMap: { OOPS: 86, DM: 80, DS: 88, OS: 82, DPCO: 70, CN: 84 },
    semesterMarks: { OOPS: 65, DM: 48, DS: 70, OS: 55, DPCO: 38, CN: 62 },
    semesterGrades: { OOPS: 'B+', DM: 'C', DS: 'A', OS: 'B', DPCO: 'U', CN: 'B+' },
    semesterStatus: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Fail', CN: 'Pass' },
    ca1Marks: { OOPS: 37, DM: 26, DS: 40, OS: 31, DPCO: 21, CN: 35 },
    ca1Grades: { OOPS: 'B', DM: 'C', DS: 'B+', OS: 'C', DPCO: 'Fail', CN: 'B' },
    ca1Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Fail', CN: 'Pass' },
    ca1Assignments: { OOPS: 17, DM: 13, DS: 18, OS: 15, DPCO: 11, CN: 16 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 39, DM: 28, DS: 42, OS: 33, DPCO: 22, CN: 37 },
    ca2Grades: { OOPS: 'B+', DM: 'C', DS: 'A', OS: 'C', DPCO: 'Fail', CN: 'B+' },
    ca2Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Fail', CN: 'Pass' },
    ca2Assignments: { OOPS: 18, DM: 14, DS: 19, OS: 16, DPCO: 12, CN: 17 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
  {
    _id: 'stu-it102',
    id: 'stu-it102',
    role: 'student',
    identifier: 'IT102',
    regNo: 'IT102',
    name: 'Vijay Suresh',
    department: 'Information Technology',
    quota: 'Management',
    totalFees: 140000,
    paidFees: 100000,
    pendingFees: 40000,
    cgpa: 3.78,
    attendance: { OOPS: 75, DM: 68, DS: 80, OS: 72, DPCO: 74, CN: 66 },
    attendanceMap: { OOPS: 75, DM: 68, DS: 80, OS: 72, DPCO: 74, CN: 66 },
    semesterMarks: { OOPS: 42, DM: 30, DS: 48, OS: 35, DPCO: 40, CN: 32 },
    semesterGrades: { OOPS: 'C', DM: 'U', DS: 'C', OS: 'U', DPCO: 'C', CN: 'U' },
    semesterStatus: { OOPS: 'Pass', DM: 'Fail', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Fail' },
    ca1Marks: { OOPS: 24, DM: 16, DS: 27, OS: 19, DPCO: 23, CN: 17 },
    ca1Grades: { OOPS: 'C', DM: 'Fail', DS: 'C', OS: 'Fail', DPCO: 'C', CN: 'Fail' },
    ca1Status: { OOPS: 'Pass', DM: 'Fail', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Fail' },
    ca1Assignments: { OOPS: 13, DM: 8, DS: 14, OS: 10, DPCO: 12, CN: 9 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 25, DM: 17, DS: 29, OS: 20, DPCO: 24, CN: 18 },
    ca2Grades: { OOPS: 'C', DM: 'Fail', DS: 'C', OS: 'Fail', DPCO: 'C', CN: 'Fail' },
    ca2Status: { OOPS: 'Pass', DM: 'Fail', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Fail' },
    ca2Assignments: { OOPS: 14, DM: 9, DS: 15, OS: 11, DPCO: 13, CN: 10 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
  {
    _id: 'stu-ec101',
    id: 'stu-ec101',
    role: 'student',
    identifier: 'EC101',
    regNo: 'EC101',
    name: 'Anitha Ramesh',
    department: 'Electronics & Communication',
    quota: 'Counselling',
    totalFees: 100000,
    paidFees: 100000,
    pendingFees: 0,
    cgpa: 9.43,
    attendance: { OOPS: 96, DM: 98, DS: 94, OS: 97, DPCO: 99, CN: 95 },
    attendanceMap: { OOPS: 96, DM: 98, DS: 94, OS: 97, DPCO: 99, CN: 95 },
    semesterMarks: { OOPS: 95, DM: 98, DS: 91, OS: 94, DPCO: 96, CN: 92 },
    semesterGrades: { OOPS: 'O', DM: 'O', DS: 'O', OS: 'O', DPCO: 'O', CN: 'O' },
    semesterStatus: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Marks: { OOPS: 56, DM: 59, DS: 53, OS: 55, DPCO: 58, CN: 54 },
    ca1Grades: { OOPS: 'O', DM: 'O', DS: 'O', OS: 'O', DPCO: 'O', CN: 'O' },
    ca1Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Assignments: { OOPS: 20, DM: 20, DS: 20, OS: 20, DPCO: 20, CN: 20 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 58, DM: 60, DS: 55, OS: 57, DPCO: 59, CN: 56 },
    ca2Grades: { OOPS: 'O', DM: 'O', DS: 'O', OS: 'O', DPCO: 'O', CN: 'O' },
    ca2Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca2Assignments: { OOPS: 20, DM: 20, DS: 20, OS: 20, DPCO: 20, CN: 20 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
  {
    _id: 'stu-ad101',
    id: 'stu-ad101',
    role: 'student',
    identifier: 'AD101',
    regNo: 'AD101',
    name: 'Rahul Dravid',
    department: 'AI & Data Science',
    quota: 'Management',
    totalFees: 150000,
    paidFees: 120000,
    pendingFees: 30000,
    cgpa: 7.87,
    attendance: { OOPS: 90, DM: 85, DS: 92, OS: 84, DPCO: 86, CN: 88 },
    attendanceMap: { OOPS: 90, DM: 85, DS: 92, OS: 84, DPCO: 86, CN: 88 },
    semesterMarks: { OOPS: 84, DM: 76, DS: 89, OS: 68, DPCO: 74, CN: 81 },
    semesterGrades: { OOPS: 'A', DM: 'B+', DS: 'A+', OS: 'B+', DPCO: 'B+', CN: 'A' },
    semesterStatus: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Marks: { OOPS: 47, DM: 42, DS: 50, OS: 38, DPCO: 41, CN: 45 },
    ca1Grades: { OOPS: 'A', DM: 'B+', DS: 'O', OS: 'B', DPCO: 'B+', CN: 'A' },
    ca1Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca1Assignments: { OOPS: 19, DM: 17, DS: 20, OS: 16, DPCO: 18, CN: 19 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 49, DM: 44, DS: 52, OS: 40, DPCO: 43, CN: 47 },
    ca2Grades: { OOPS: 'A', DM: 'A', DS: 'O', OS: 'B+', DPCO: 'A', CN: 'A' },
    ca2Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Pass', DPCO: 'Pass', CN: 'Pass' },
    ca2Assignments: { OOPS: 20, DM: 18, DS: 20, OS: 17, DPCO: 19, CN: 19 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
  {
    _id: 'stu-me101',
    id: 'stu-me101',
    role: 'student',
    identifier: 'ME101',
    regNo: 'ME101',
    name: 'Sanjay Varma',
    department: 'Mechanical Engineering',
    quota: 'Counselling',
    totalFees: 95000,
    paidFees: 70000,
    pendingFees: 25000,
    cgpa: 3.83,
    attendance: { OOPS: 62, DM: 58, DS: 71, OS: 64, DPCO: 70, CN: 68 },
    attendanceMap: { OOPS: 62, DM: 58, DS: 71, OS: 64, DPCO: 70, CN: 68 },
    semesterMarks: { OOPS: 38, DM: 42, DS: 35, OS: 40, DPCO: 30, CN: 45 },
    semesterGrades: { OOPS: 'U', DM: 'C', DS: 'U', OS: 'C', DPCO: 'U', CN: 'C' },
    semesterStatus: { OOPS: 'Fail', DM: 'Pass', DS: 'Fail', OS: 'Pass', DPCO: 'Fail', CN: 'Pass' },
    ca1Marks: { OOPS: 22, DM: 25, DS: 20, OS: 24, DPCO: 17, CN: 26 },
    ca1Grades: { OOPS: 'Fail', DM: 'C', DS: 'Fail', OS: 'C', DPCO: 'Fail', CN: 'C' },
    ca1Status: { OOPS: 'Fail', DM: 'Pass', DS: 'Fail', OS: 'Pass', DPCO: 'Fail', CN: 'Pass' },
    ca1Assignments: { OOPS: 11, DM: 12, DS: 10, OS: 12, DPCO: 9, CN: 13 },
    ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    ca2Marks: { OOPS: 23, DM: 26, DS: 21, OS: 25, DPCO: 18, CN: 27 },
    ca2Grades: { OOPS: 'Fail', DM: 'C', DS: 'Fail', OS: 'C', DPCO: 'Fail', CN: 'C' },
    ca2Status: { OOPS: 'Fail', DM: 'Pass', DS: 'Fail', OS: 'Pass', DPCO: 'Fail', CN: 'Pass' },
    ca2Assignments: { OOPS: 12, DM: 13, DS: 11, OS: 13, DPCO: 10, CN: 14 },
    ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
  },
];

export const DEFAULT_TEACHER = {
  _id: 'teacher-t101',
  role: 'teacher',
  identifier: 'T101',
  name: 'Dr. S. Ramanathan',
  department: 'Computer Science & Engineering',
  designation: 'Professor & Head',
  experience: '16 Years',
  phone: '+91 98765 43210',
  email: 'ramanathan@campusledger.edu',
  subjectsHandled: ['OOPS', 'DM', 'DS', 'OS', 'DPCO', 'CN'],
};

export const DEFAULT_NOTICES = [
  {
    _id: 'not-1',
    title: 'Mid-Term Continuous Assessment 2 (CA2) Schedule',
    message: 'The schedule for Continuous Assessment 2 (CA2) across OOPS, DM, DS, OS, DPCO and CN has been finalized. Review subject portals for seating arrangements.',
    createdByName: 'Dr. S. Ramanathan',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'not-2',
    title: 'End Semester Laboratory & Project Submissions',
    message: 'All students are reminded to submit assignments and lab reports for Data Structures (DS) and Computer Networks (CN) prior to the cutoff date.',
    createdByName: 'Academic Dean',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'not-3',
    title: 'Tuition Fee Balance Clearance Notice',
    message: 'Students with pending fee balances are requested to clear the dues at the administrative accounts office before semester hall tickets are generated.',
    createdByName: 'Finance Office',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const STORAGE_VERSION_KEY = 'cl_version_v4_unique_keys';

export const generateUniqueId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

function deduplicateById(items, idField = '_id') {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items.filter((item) => {
    const id = item?.[idField] || item?.id || item?.identifier;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function getStoredData(key, fallback) {
  try {
    const version = localStorage.getItem('cl_version');
    if (version !== STORAGE_VERSION_KEY && (key === 'students' || key === 'notices')) {
      localStorage.setItem('cl_version', STORAGE_VERSION_KEY);
      localStorage.setItem(`cl_${key}`, JSON.stringify(fallback));
      return fallback;
    }
    const val = localStorage.getItem(`cl_${key}`);
    if (!val) return fallback;
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? deduplicateById(parsed) : parsed;
  } catch {
    return fallback;
  }
}

function setStoredData(key, data) {
  try {
    const cleanData = Array.isArray(data) ? deduplicateById(data) : data;
    localStorage.setItem(`cl_${key}`, JSON.stringify(cleanData));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

function makeDefaultSubjectMap(value = 0) {
  const res = {};
  CORE_SUBJECTS.forEach((sub) => {
    res[sub.name] = value;
  });
  return res;
}

export function calculateGradeAndStatus(score, maxScore = 100) {
  if (maxScore === 100) {
    if (score >= 90) return { grade: 'O', status: 'Pass' };
    if (score >= 80) return { grade: 'A+', status: 'Pass' };
    if (score >= 70) return { grade: 'A', status: 'Pass' };
    if (score >= 60) return { grade: 'B+', status: 'Pass' };
    if (score >= 50) return { grade: 'B', status: 'Pass' };
    if (score >= 40) return { grade: 'C', status: 'Pass' };
    return { grade: 'U', status: 'Fail' };
  } else {
    // For CA1/CA2 out of 60
    if (score >= 54) return { grade: 'O', status: 'Pass' };
    if (score >= 48) return { grade: 'A+', status: 'Pass' };
    if (score >= 42) return { grade: 'A', status: 'Pass' };
    if (score >= 36) return { grade: 'B+', status: 'Pass' };
    if (score >= 30) return { grade: 'B', status: 'Pass' };
    if (score >= 24) return { grade: 'C', status: 'Pass' };
    return { grade: 'Fail', status: 'Fail' };
  }
}

// Local mock handler
function handleLocalApi(cleanPath, method, body) {
  const students = getStoredData('students', DEFAULT_STUDENTS);
  const notices = getStoredData('notices', DEFAULT_NOTICES);

  // 1. POST /login
  if (cleanPath === 'login' && method === 'POST') {
    const role = (body?.role || '').trim().toLowerCase();
    const identifier = (body?.identifier || '').trim();
    const enteredName = (body?.name || '').trim();

    if (!role || !identifier) {
      throw new Error('Role and ID/Register Number are required.');
    }

    const token = `cl_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (role === 'teacher') {
      let teacher = getStoredData('teacher', DEFAULT_TEACHER);
      const name = enteredName || (identifier.toUpperCase() === 'T101' ? teacher.name : (identifier.startsWith('T') ? `Faculty (${identifier})` : identifier));
      teacher = {
        ...teacher,
        identifier,
        name,
        subjectsHandled: ['OOPS', 'DM', 'DS', 'OS', 'DPCO', 'CN'],
      };
      setStoredData('teacher', teacher);
      return { success: true, token, user: teacher };
    }

    if (role === 'student') {
      let student = students.find((s) => s.identifier.toLowerCase() === identifier.toLowerCase());
      if (!student) {
        student = {
          _id: generateUniqueId(`stu-${identifier.toLowerCase()}`),
          id: `stu-${identifier.toLowerCase()}`,
          role: 'student',
          identifier,
          regNo: identifier,
          name: enteredName || `Student (${identifier})`,
          department: 'Computer Science & Engineering',
          quota: 'Counselling',
          totalFees: 100000,
          paidFees: 75000,
          pendingFees: 25000,
          cgpa: 6.85,
          attendance: { OOPS: 85, DM: 78, DS: 88, OS: 80, DPCO: 82, CN: 84 },
          attendanceMap: { OOPS: 85, DM: 78, DS: 88, OS: 80, DPCO: 82, CN: 84 },
          semesterMarks: { OOPS: 75, DM: 40, DS: 80, OS: 34, DPCO: 70, CN: 68 },
          semesterGrades: { OOPS: 'B+', DM: 'C', DS: 'A', OS: 'U', DPCO: 'B+', CN: 'B+' },
          semesterStatus: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
          ca1Marks: { OOPS: 40, DM: 24, DS: 44, OS: 18, DPCO: 39, CN: 38 },
          ca1Grades: { OOPS: 'B+', DM: 'C', DS: 'A', OS: 'Fail', DPCO: 'B', CN: 'B' },
          ca1Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
          ca1Assignments: { OOPS: 18, DM: 14, DS: 19, OS: 11, DPCO: 17, CN: 16 },
          ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
          ca2Marks: { OOPS: 42, DM: 26, DS: 46, OS: 19, DPCO: 41, CN: 40 },
          ca2Grades: { OOPS: 'A', DM: 'C', DS: 'A+', OS: 'Fail', DPCO: 'B+', CN: 'B+' },
          ca2Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
          ca2Assignments: { OOPS: 19, DM: 15, DS: 20, OS: 12, DPCO: 18, CN: 17 },
          ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
        };
        students.push(student);
        setStoredData('students', students);
      } else if (enteredName && student.name !== enteredName) {
        student.name = enteredName;
        setStoredData('students', students);
      }
      return { success: true, token, user: student };
    }

    throw new Error('Invalid role specified.');
  }

  // 2. POST /reset-password
  if (cleanPath === 'reset-password' && method === 'POST') {
    return { success: true, message: 'Password changed successfully.' };
  }

  // 3. GET /student/profile/:regNo
  if (cleanPath.startsWith('student/profile/')) {
    const regNo = decodeURIComponent(cleanPath.replace('student/profile/', '')).trim();
    let student = students.find((s) => s.identifier.toLowerCase() === regNo.toLowerCase());
    if (!student) {
      student = students[0];
    }
    return { success: true, student };
  }

  // 4. GET /student/notices
  if (cleanPath === 'student/notices') {
    return { success: true, notices: deduplicateById(notices) };
  }

  // 5. GET /teacher/students
  if (cleanPath === 'teacher/students') {
    const teacher = getStoredData('teacher', DEFAULT_TEACHER);
    return { success: true, students: deduplicateById(students), teacher };
  }

  // 6. POST /teacher/notice
  if (cleanPath === 'teacher/notice' && method === 'POST') {
    const notice = {
      _id: generateUniqueId('not'),
      title: (body?.title || '').trim(),
      message: (body?.message || '').trim(),
      createdByName: 'Dr. S. Ramanathan',
      createdAt: new Date().toISOString(),
    };
    const updatedNotices = [notice, ...notices.filter((n) => (n._id || n.id) !== notice._id)];
    setStoredData('notices', updatedNotices);
    return { success: true, message: 'Notice published successfully.', notice };
  }

  // 7. POST /teacher/student/register
  if (cleanPath === 'teacher/student/register' && method === 'POST') {
    const regNo = (body?.regNo || '').trim().toUpperCase();
    const name = (body?.name || '').trim();

    if (!regNo || !name) {
      throw new Error('Student name and register number are required.');
    }

    const defaultSemMarks = { OOPS: 78, DM: 45, DS: 82, OS: 35, DPCO: 60, CN: 70 };
    const defaultSemGrades = { OOPS: 'A', DM: 'C', DS: 'A', OS: 'U', DPCO: 'B+', CN: 'A' };
    const defaultSemStatus = { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' };

    const newStudent = {
      _id: generateUniqueId('stu'),
      id: generateUniqueId('stu'),
      role: 'student',
      identifier: regNo,
      regNo: regNo,
      name,
      department: body?.department || 'Computer Science & Engineering',
      quota: body?.quota || 'Counselling',
      totalFees: 100000,
      paidFees: 0,
      pendingFees: 100000,
      cgpa: 6.17,
      attendance: { OOPS: 86, DM: 74, DS: 90, OS: 72, DPCO: 80, CN: 84 },
      attendanceMap: { OOPS: 86, DM: 74, DS: 90, OS: 72, DPCO: 80, CN: 84 },
      semesterMarks: defaultSemMarks,
      semesterGrades: defaultSemGrades,
      semesterStatus: defaultSemStatus,
      ca1Marks: { OOPS: 42, DM: 26, DS: 48, OS: 20, DPCO: 35, CN: 40 },
      ca1Grades: { OOPS: 'A', DM: 'C', DS: 'A+', OS: 'Fail', DPCO: 'B', CN: 'B+' },
      ca1Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
      ca1Assignments: makeDefaultSubjectMap(17),
      ca1AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
      ca2Marks: { OOPS: 44, DM: 28, DS: 50, OS: 21, DPCO: 37, CN: 42 },
      ca2Grades: { OOPS: 'A', DM: 'C', DS: 'O', OS: 'Fail', DPCO: 'B+', CN: 'A' },
      ca2Status: { OOPS: 'Pass', DM: 'Pass', DS: 'Pass', OS: 'Fail', DPCO: 'Pass', CN: 'Pass' },
      ca2Assignments: makeDefaultSubjectMap(18),
      ca2AssignmentStatus: { OOPS: 'Graded', DM: 'Graded', DS: 'Graded', OS: 'Graded', DPCO: 'Graded', CN: 'Graded' },
    };
    students.unshift(newStudent);
    setStoredData('students', students);
    return { success: true, message: 'Student registered successfully.', student: newStudent };
  }

  // 8. PUT /teacher/student/fee/:id
  if (cleanPath.startsWith('teacher/student/fee/')) {
    const id = cleanPath.replace('teacher/student/fee/', '');
    const student = students.find((s) => String(s._id) === String(id) || String(s.id) === String(id));
    if (student) {
      student.paidFees = Number(body?.paidFee) || 0;
      student.pendingFees = Number(body?.balanceFee) || 0;
      setStoredData('students', students);
    }
    return { success: true, message: 'Fee details updated successfully.', student };
  }

  // 9. PUT /teacher/student/marks/:id
  if (cleanPath.startsWith('teacher/student/marks/')) {
    const id = cleanPath.replace('teacher/student/marks/', '');
    const student = students.find((s) => String(s._id) === String(id) || String(s.id) === String(id));
    if (student) {
      student.semesterMarks = body?.semesterMarks || {};
      student.semesterGrades = {};
      student.semesterStatus = {};

      CORE_SUBJECTS.forEach((sub) => {
        const val = Number(student.semesterMarks[sub.name] ?? 0);
        const { grade, status } = calculateGradeAndStatus(val, 100);
        student.semesterGrades[sub.name] = grade;
        student.semesterStatus[sub.name] = status;
      });

      const marks = Object.values(student.semesterMarks).map(Number).filter((v) => Number.isFinite(v));
      if (marks.length > 0) {
        student.cgpa = Number(((marks.reduce((a, b) => a + b, 0) / marks.length) / 10).toFixed(2));
      }
      setStoredData('students', students);
    }
    return { success: true, message: 'Semester marks updated successfully.', student };
  }

  // 10. PUT /teacher/student/attendance/:id
  if (cleanPath.startsWith('teacher/student/attendance/')) {
    const id = cleanPath.replace('teacher/student/attendance/', '');
    const student = students.find((s) => String(s._id) === String(id) || String(s.id) === String(id));
    if (student) {
      student.attendance = body?.attendance || {};
      student.attendanceMap = body?.attendance || {};
      setStoredData('students', students);
    }
    return { success: true, message: 'Attendance updated successfully.', student };
  }

  // 11. PUT /teacher/student/ca1/:id
  if (cleanPath.startsWith('teacher/student/ca1/')) {
    const id = cleanPath.replace('teacher/student/ca1/', '');
    const student = students.find((s) => String(s._id) === String(id) || String(s.id) === String(id));
    if (student) {
      student.ca1Marks = body?.ca1Marks || {};
      student.ca1Grades = {};
      student.ca1Status = {};
      CORE_SUBJECTS.forEach((sub) => {
        const val = Number(student.ca1Marks[sub.name] ?? 0);
        const { grade, status } = calculateGradeAndStatus(val, 60);
        student.ca1Grades[sub.name] = grade;
        student.ca1Status[sub.name] = status;
      });
      setStoredData('students', students);
    }
    return { success: true, message: 'CA1 marks updated successfully.', student };
  }

  // 12. PUT /teacher/student/ca2/:id
  if (cleanPath.startsWith('teacher/student/ca2/')) {
    const id = cleanPath.replace('teacher/student/ca2/', '');
    const student = students.find((s) => String(s._id) === String(id) || String(s.id) === String(id));
    if (student) {
      student.ca2Marks = body?.ca2Marks || {};
      student.ca2Grades = {};
      student.ca2Status = {};
      CORE_SUBJECTS.forEach((sub) => {
        const val = Number(student.ca2Marks[sub.name] ?? 0);
        const { grade, status } = calculateGradeAndStatus(val, 60);
        student.ca2Grades[sub.name] = grade;
        student.ca2Status[sub.name] = status;
      });
      setStoredData('students', students);
    }
    return { success: true, message: 'CA2 marks updated successfully.', student };
  }

  return { success: true, message: 'OK' };
}

/**
 * Centralized API request helper.
 */
export async function apiFetch(path, options = {}) {
  const {
    token,
    headers: customHeaders,
    body,
    ...rest
  } = options;

  const cleanPath = String(path).replace(/^\/+/, '');
  const method = (options.method || 'GET').toUpperCase();

  // Try Remote API first
  try {
    const headers = new Headers(customHeaders || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const url = `${REMOTE_URL}/${cleanPath}`;
    const response = await fetch(url, {
      ...rest,
      method,
      headers,
      body: body === undefined || typeof body === 'string' ? body : JSON.stringify(body),
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          return data;
        }
      }
    }
  } catch (err) {
    // Remote offline/CORS error — fallback locally
  }

  return handleLocalApi(cleanPath, method, body);
}

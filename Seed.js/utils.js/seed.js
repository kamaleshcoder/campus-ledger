import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/user.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    '❌ MONGO_URI is missing.'
  );

  process.exit(1);
}

/* =========================================================
   SAMPLE STUDENTS
========================================================= */

const sampleStudents = [
  {
    identifier: 'CS101',
    name: 'Arun Kumar',
    department: 'Computer Science',

    attendance: {
      OOPs: 92,
      Maths: 90,
    },

    semesterMarks: {
      OOPs: 85,
      Maths: 88,
    },

    ca1Marks: {
      OOPs: 45,
      Maths: 43,
    },

    ca2Marks: {
      OOPs: 46,
      Maths: 44,
    },
  },

  {
    identifier: 'CS102',
    name: 'Priya Dharshini',
    department: 'Computer Science',

    attendance: {
      OOPs: 88,
      Maths: 86,
    },

    semesterMarks: {
      OOPs: 80,
      Maths: 82,
    },

    ca1Marks: {
      OOPs: 40,
      Maths: 41,
    },

    ca2Marks: {
      OOPs: 42,
      Maths: 43,
    },
  },

  {
    identifier: 'CS103',
    name: 'Karthik Raja',
    department: 'Computer Science',

    attendance: {
      OOPs: 95,
      Maths: 93,
    },

    semesterMarks: {
      OOPs: 92,
      Maths: 90,
    },

    ca1Marks: {
      OOPs: 48,
      Maths: 47,
    },

    ca2Marks: {
      OOPs: 49,
      Maths: 48,
    },
  },

  {
    identifier: 'IT101',
    name: 'Divya Sri',
    department: 'Information Technology',

    attendance: {
      OOPs: 90,
      Networks: 91,
    },

    semesterMarks: {
      OOPs: 88,
      Networks: 86,
    },

    ca1Marks: {
      OOPs: 42,
      Networks: 43,
    },

    ca2Marks: {
      OOPs: 44,
      Networks: 45,
    },
  },

  {
    identifier: 'IT102',
    name: 'Vijay Suresh',
    department: 'Information Technology',

    attendance: {
      OOPs: 85,
      Networks: 84,
    },

    semesterMarks: {
      OOPs: 75,
      Networks: 78,
    },

    ca1Marks: {
      OOPs: 38,
      Networks: 39,
    },

    ca2Marks: {
      OOPs: 40,
      Networks: 41,
    },
  },

  {
    identifier: 'EC101',
    name: 'Anitha Ramesh',
    department: 'Electronics',

    attendance: {
      Digital: 94,
      Maths: 92,
    },

    semesterMarks: {
      Digital: 90,
      Maths: 88,
    },

    ca1Marks: {
      Digital: 46,
      Maths: 45,
    },

    ca2Marks: {
      Digital: 45,
      Maths: 46,
    },
  },

  {
    identifier: 'EC102',
    name: 'Sanjay Varma',
    department: 'Electronics',

    attendance: {
      Digital: 89,
      Maths: 90,
    },

    semesterMarks: {
      Digital: 82,
      Maths: 84,
    },

    ca1Marks: {
      Digital: 41,
      Maths: 42,
    },

    ca2Marks: {
      Digital: 43,
      Maths: 44,
    },
  },

  {
    identifier: 'ME101',
    name: 'Ajith Kumar',
    department: 'Mechanical',

    attendance: {
      Mechanics: 91,
      Maths: 89,
    },

    semesterMarks: {
      Mechanics: 84,
      Maths: 82,
    },

    ca1Marks: {
      Mechanics: 44,
      Maths: 43,
    },

    ca2Marks: {
      Mechanics: 41,
      Maths: 42,
    },
  },

  {
    identifier: 'CE101',
    name: 'Deepika Mohan',
    department: 'Civil',

    attendance: {
      Structures: 96,
      Maths: 94,
    },

    semesterMarks: {
      Structures: 95,
      Maths: 92,
    },

    ca1Marks: {
      Structures: 49,
      Maths: 48,
    },

    ca2Marks: {
      Structures: 48,
      Maths: 49,
    },
  },

  {
    identifier: 'CS104',
    name: 'Rahul Dravid',
    department: 'Computer Science',

    attendance: {
      OOPs: 87,
      Maths: 85,
    },

    semesterMarks: {
      OOPs: 78,
      Maths: 80,
    },

    ca1Marks: {
      OOPs: 39,
      Maths: 40,
    },

    ca2Marks: {
      OOPs: 42,
      Maths: 41,
    },
  },
];

/* =========================================================
   CGPA HELPER
========================================================= */

const calculateCgpa = (
  semesterMarks
) => {
  const values =
    Object.values(
      semesterMarks || {}
    )
      .map(Number)
      .filter(
        (value) =>
          Number.isFinite(value)
      );

  if (!values.length) {
    return 0;
  }

  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length;

  return Number(
    Math.max(
      0,
      Math.min(
        10,
        average / 10
      )
    ).toFixed(2)
  );
};

/* =========================================================
   SEED DATABASE
========================================================= */

async function seedDatabase() {
  try {
    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      '📦 Connected to MongoDB for seeding.'
    );

    await User.deleteMany({});

    console.log(
      '🧹 Old user data cleared.'
    );

    const seedPassword =
      process.env
        .SEED_STUDENT_PASSWORD ||
      '123456';

    const hashedPassword =
      await bcrypt.hash(
        seedPassword,
        12
      );

    const students =
      sampleStudents.map(
        (student) => {
          const subjects =
            {};

          Object.keys(
            student.semesterMarks
          ).forEach(
            (subject) => {
              subjects[
                subject
              ] = subject;
            }
          );

          const ca1Assignments =
            {};

          Object.keys(
            student.ca1Marks
          ).forEach(
            (subject) => {
              ca1Assignments[
                subject
              ] = 0;
            }
          );

          const ca2Assignments =
            {};

          Object.keys(
            student.ca2Marks
          ).forEach(
            (subject) => {
              ca2Assignments[
                subject
              ] = 0;
            }
          );

          return {
            role: 'student',

            identifier:
              student.identifier,

            password:
              hashedPassword,

            name:
              student.name,

            department:
              student.department,

            quota:
              'Counselling',

            totalFees:
              100000,

            paidFees:
              75000,

            pendingFees:
              25000,

            subjects,

            attendance:
              student.attendance,

            attendanceMap:
              student.attendance,

            semesterMarks:
              student.semesterMarks,

            semesterGrades:
              {},

            semesterStatus:
              {},

            cgpa:
              calculateCgpa(
                student.semesterMarks
              ),

            ca1:
              student.ca1Marks,

            ca1Marks:
              student.ca1Marks,

            ca1Grades:
              {},

            ca1Status:
              {},

            ca1Assignments,

            ca1AssignmentStatus:
              {},

            ca2:
              student.ca2Marks,

            ca2Marks:
              student.ca2Marks,

            ca2Grades:
              {},

            ca2Status:
              {},

            ca2Assignments,

            ca2AssignmentStatus:
              {},
          };
        }
      );

    const created =
      await User.insertMany(
        students
      );

    console.log(
      `✅ ${created.length} students inserted successfully.`
    );

    console.log(
      `🔑 Seed password: ${seedPassword}`
    );
  } catch (error) {
    console.error(
      '❌ Seeding error:',
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    /* =====================================================
       BASIC USER
    ===================================================== */

    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true,
      index: true,
    },

    identifier: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    department: {
      type: String,
      trim: true,
      default: '',
      maxlength: 120,
    },

    quota: {
      type: String,
      trim: true,
      default: '',
    },

    /* =====================================================
       TEACHER PROFILE
    ===================================================== */

    designation: {
      type: String,
      trim: true,
      default: '',
    },

    experience: {
      type: String,
      trim: true,
      default: '',
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    email: {
      type: String,
      trim: true,
      default: '',
    },

    subjectsHandled: {
      type: [String],
      default: [],
    },

    /* =====================================================
       FEES
    ===================================================== */

    totalFees: {
      type: Number,
      min: 0,
      default: 0,
    },

    paidFees: {
      type: Number,
      min: 0,
      default: 0,
    },

    pendingFees: {
      type: Number,
      min: 0,
      default: 0,
    },

    /* =====================================================
       ACADEMICS
    ===================================================== */

    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    /*
      Flexible because current frontend supports both
      subject-keyed objects and subject arrays.
    */

    subjects: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    semesterMarks: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    semesterGrades: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    semesterStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =====================================================
       ATTENDANCE
    ===================================================== */

    /*
      Canonical shape:

      {
        Mathematics: 92,
        Physics: 88,
        OOPs: 95
      }
    */

    attendance: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    attendanceMap: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =====================================================
       CA1
    ===================================================== */

    ca1: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca1Marks: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca1Grades: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca1Status: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /*
      Current frontend expects subject-keyed assignment data.

      Example:
      {
        Maths: 18,
        Physics: 20
      }
    */

    ca1Assignments: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca1AssignmentStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /* =====================================================
       CA2
    ===================================================== */

    ca2: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca2Marks: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca2Grades: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca2Status: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca2Assignments: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ca2AssignmentStatus: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User =
  mongoose.model(
    'User',
    userSchema
  );
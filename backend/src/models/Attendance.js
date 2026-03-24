import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'HalfDay'],
    required: true,
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  records: [attendanceRecordSchema],
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Unique compound index to prevent double-marking a section on same day
attendanceSchema.index(
  { schoolId: 1, sectionId: 1, date: 1 },
  { unique: true },
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;

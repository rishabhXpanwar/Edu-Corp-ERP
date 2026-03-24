import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  periodNumber: {
    type: Number,
    required: false,
    min: 0,
    max: 11,
  },
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  periods: [periodSchema],
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },
  schedule: [dayScheduleSchema],
}, {
  timestamps: true,
});

// Unique compound index to ensure one timetable per section per academic year
timetableSchema.index(
  { schoolId: 1, sectionId: 1, academicYearId: 1 },
  { unique: true },
);

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;

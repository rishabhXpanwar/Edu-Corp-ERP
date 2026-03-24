import mongoose from 'mongoose';

const subjectMarkSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  obtainedMarks: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
}, { _id: false });

const marksSchema = new mongoose.Schema({
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
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subjects: [subjectMarkSchema],
  totalObtained: {
    type: Number,
    default: 0,
  },
  maxTotal: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

// Pre-save hook to calculate totalObtained, maxTotal, and percentage
marksSchema.pre('save', function () {
  if (this.subjects && this.subjects.length > 0) {
    this.totalObtained = this.subjects.reduce((sum, sub) => sum + sub.obtainedMarks, 0);
    this.maxTotal = this.subjects.reduce((sum, sub) => sum + sub.totalMarks, 0);
    this.percentage = this.maxTotal > 0 ? (this.totalObtained / this.maxTotal) * 100 : 0;
  }
});

// Indexes for efficient querying
marksSchema.index({ schoolId: 1, examId: 1, sectionId: 1, studentId: 1 }, { unique: true });

const Marks = mongoose.model('Marks', marksSchema);
export default Marks;

import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
}, { timestamps: true });

// Compound indexes as per instruction
academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });
academicYearSchema.index({ schoolId: 1, isCurrent: 1 });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
export default AcademicYear;

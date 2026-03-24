import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: Number, required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual to populate sections for this class
classSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'classId',
});

// Compound unique index as per instruction
classSchema.index({ schoolId: 1, academicYearId: 1, name: 1 }, { unique: true });

const Class = mongoose.model('Class', classSchema);
export default Class;

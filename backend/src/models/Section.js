import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
}, { timestamps: true });

// Compound unique index as per instruction
sectionSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);
export default Section;

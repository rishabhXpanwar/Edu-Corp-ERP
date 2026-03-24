import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    required: true, 
    enum: ['superAdmin', 'principal', 'financeManager', 'hrManager', 'academicManager', 'adminManager', 'teacher', 'student', 'parent'] 
  },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  avatarUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  admissionNumber: { type: String, sparse: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  subjectsTaught: [{ type: String, default: [] }],
  designation: { type: String, default: '' },
  joiningDate: { type: Date },
  salary: { type: Number, default: 0 },
  transportRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', default: null },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.index({ schoolId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ sectionId: 1 });

const User = mongoose.model('User', userSchema);
export default User;

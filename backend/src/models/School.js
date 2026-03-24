import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  logoUrl: { type: String, default: '' },
  principalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  plan: { type: String, enum: ['basic', 'standard', 'premium'], default: 'basic' },
  board: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: 'India' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

schoolSchema.index({ email: 1 }, { unique: true });

schoolSchema.virtual('status').get(function getStatus() {
  return this.isActive ? 'active' : 'suspended';
});

const School = mongoose.model('School', schoolSchema);
export default School;

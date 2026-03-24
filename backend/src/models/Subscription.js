import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
  plan: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  billing: [{
    amount: { type: Number },
    paidAt: { type: Date },
    method: { type: String },
    receiptUrl: { type: String }
  }]
}, { timestamps: true });

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Class',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['paid', 'unpaid'],
      default: 'unpaid',
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

feeSchema.index({ schoolId: 1, studentId: 1 });
feeSchema.index({ schoolId: 1, classId: 1 });
feeSchema.index({ schoolId: 1, status: 1 });

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;

import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['paid', 'unpaid', 'delayed'],
      default: 'unpaid',
    },
    paymentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

salarySchema.index({ schoolId: 1, teacherId: 1 });
salarySchema.index({ schoolId: 1, month: 1, year: 1 });

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;

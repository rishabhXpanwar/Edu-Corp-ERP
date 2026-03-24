import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  stopName: {
    type: String,
    required: true,
    trim: true,
  },
  pickUpTime: {
    type: String,
    trim: true,
  },
  dropTime: {
    type: String,
    trim: true,
  },
  feeAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
}, { _id: true });

const transportSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    routeName: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverPhone: {
      type: String,
      required: true,
      trim: true,
    },
    stops: [stopSchema],
    assignedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
transportSchema.index({ schoolId: 1, routeName: 1 });

const Transport = mongoose.model('Transport', transportSchema);

export default Transport;

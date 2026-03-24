import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued',
  },
}, { _id: true });

const libraryBookSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock'],
      default: 'available',
    },
    issues: [issueSchema],
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
libraryBookSchema.index({ schoolId: 1, title: 1 });
libraryBookSchema.index({ schoolId: 1, author: 1 });
libraryBookSchema.index({ schoolId: 1, status: 1 });

// Pre-save hook: update status based on availableCopies
libraryBookSchema.pre('save', function updateStatus() {
  if (this.availableCopies <= 0) {
    this.status = 'out_of_stock';
  } else {
    this.status = 'available';
  }
});

const LibraryBook = mongoose.model('LibraryBook', libraryBookSchema);

export default LibraryBook;

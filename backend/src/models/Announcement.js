import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxLength: 5000,
  },
  audience: {
    type: String,
    enum: ['all', 'staff', 'students'],
    required: true,
    default: 'all',
  },
}, { timestamps: true });

announcementSchema.index({ schoolId: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;

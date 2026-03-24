import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  type: { type: String, enum: ['individual', 'section', 'class'], required: true },
  message: { type: String, required: true, trim: true, maxLength: 1000 },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ schoolId: 1, sectionId: 1 });
notificationSchema.index({ senderId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

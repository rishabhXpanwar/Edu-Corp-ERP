import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Section from '../models/Section.js';
import ClassModel from '../models/Class.js';
import AppError from '../utils/AppError.js';
import { getIO } from '../socket/socketInit.js';

class NotificationService {
  async send({
    senderId,
    schoolId,
    type,
    message,
    recipientId,
    admissionNumber,
    sectionId,
    classId,
  }) {
    console.log('[NotificationService] send called', { type, schoolId });

    const trimmedMessage = String(message || '').trim();
    if (!trimmedMessage) {
      throw new AppError('Message is required', 400);
    }

    const baseDoc = {
      schoolId,
      senderId,
      type,
      message: trimmedMessage,
    };

    let notification;
    let targetRoom = null;

    if (type === 'individual') {
      // Support both admissionNumber (preferred) and recipientId (legacy)
      const trimmedAdmissionNumber = String(admissionNumber || '').trim();
      const trimmedRecipientId = String(recipientId || '').trim();

      if (!trimmedAdmissionNumber && !trimmedRecipientId) {
        throw new AppError('Admission number is required for individual notifications', 400);
      }

      let recipient;
      if (trimmedAdmissionNumber) {
        // Lookup by admission number
        recipient = await User.findOne({
          admissionNumber: trimmedAdmissionNumber,
          schoolId,
          role: 'student',
        }).select('_id');

        if (!recipient) {
          throw new AppError(`Student with admission number "${trimmedAdmissionNumber}" not found`, 404);
        }
      } else {
        // Fallback to legacy recipientId lookup
        recipient = await User.findOne({
          _id: trimmedRecipientId,
          schoolId,
        }).select('_id');

        if (!recipient) {
          throw new AppError('Recipient not found', 404);
        }
      }

      notification = await Notification.create({
        ...baseDoc,
        recipientId: recipient._id,
        sectionId: null,
        classId: null,
      });

      targetRoom = `user:${recipient._id}`;
    } else if (type === 'section') {
      if (!sectionId || !classId) {
        throw new AppError('sectionId and classId are required for section notifications', 400);
      }

      const section = await Section.findOne({
        _id: sectionId,
        schoolId,
        classId,
      }).select('_id classId');

      if (!section) {
        throw new AppError('Section not found', 404);
      }

      notification = await Notification.create({
        ...baseDoc,
        recipientId: null,
        sectionId: section._id,
        classId: section.classId,
      });

      targetRoom = `class:${section.classId}`;
    } else if (type === 'class') {
      if (!classId) {
        throw new AppError('classId is required for class notifications', 400);
      }

      const classDoc = await ClassModel.findOne({
        _id: classId,
        schoolId,
      }).select('_id');

      if (!classDoc) {
        throw new AppError('Class not found', 404);
      }

      if (sectionId) {
        const section = await Section.findOne({
          _id: sectionId,
          schoolId,
          classId: classDoc._id,
        }).select('_id');

        if (!section) {
          throw new AppError('Section not found', 404);
        }
      }

      notification = await Notification.create({
        ...baseDoc,
        recipientId: null,
        sectionId: sectionId || null,
        classId: classDoc._id,
      });

      targetRoom = `class:${classDoc._id}`;
    } else {
      throw new AppError('Invalid type', 400);
    }

    let senderName;
    const sender = await User.findById(senderId).select('name').lean();
    if (sender && sender.name) {
      senderName = sender.name;
    }

    try {
      const io = getIO();
      io.to(targetRoom).emit('notification:new', {
        notificationId: notification._id,
        message: notification.message,
        senderId: notification.senderId,
        senderName,
        type: notification.type,
        createdAt: notification.createdAt,
      });

      console.log('[NotificationService] emitted notification:new', { room: targetRoom });
    } catch (error) {
      console.log('[NotificationService] socket emit skipped', error.message);
    }

    return notification;
  }
}

export default new NotificationService();

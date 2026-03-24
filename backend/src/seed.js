import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import User from './models/User.js';
import School from './models/School.js';
import Subscription from './models/Subscription.js';
import AcademicYear from './models/AcademicYear.js';
import Class from './models/Class.js';
import Section from './models/Section.js';
import Attendance from './models/Attendance.js';
import Timetable from './models/Timetable.js';
import Exam from './models/Exam.js';
import Marks from './models/Marks.js';
import Assignment from './models/Assignment.js';
import Fee from './models/Fee.js';
import Salary from './models/Salary.js';
import LeaveRequest from './models/LeaveRequest.js';
import LibraryBook from './models/LibraryBook.js';
import Transport from './models/Transport.js';
import Notification from './models/Notification.js';
import Announcement from './models/Announcement.js';
import CalendarEvent from './models/CalendarEvent.js';
import OTP from './models/OTP.js';
import AuditLog from './models/AuditLog.js';

import { BCRYPT_ROUNDS } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV;

const isoDate = (value) => new Date(value);

const buildTimetableDay = (day, sectionName, sectionId, classId, teacherId) => ({
  day,
  periods: [
    {
      subject: `Mathematics (${sectionName})`,
      teacherId,
      startTime: '09:00',
      endTime: '09:45',
      sectionId,
      classId,
      sectionName,
    },
    {
      subject: `Science (${sectionName})`,
      teacherId,
      startTime: '10:00',
      endTime: '10:45',
      sectionId,
      classId,
      sectionName,
    },
  ],
});

const seedDatabase = async () => {
  if (NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('WARNING: You are running the seed script in production.');
    console.error('Run with --force to proceed.');
    process.exit(1);
  }

  if (!MONGO_URI) {
    console.error('MONGO_URI is missing from environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      School.deleteMany({}),
      Subscription.deleteMany({}),
      AcademicYear.deleteMany({}),
      Class.deleteMany({}),
      Section.deleteMany({}),
      Attendance.deleteMany({}),
      Timetable.deleteMany({}),
      Exam.deleteMany({}),
      Marks.deleteMany({}),
      Assignment.deleteMany({}),
      Fee.deleteMany({}),
      Salary.deleteMany({}),
      LeaveRequest.deleteMany({}),
      LibraryBook.deleteMany({}),
      Transport.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({}),
      CalendarEvent.deleteMany({}),
      OTP.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('Data cleared.');

    const hashedPassword = await bcrypt.hash('Password123!', BCRYPT_ROUNDS || 10);

    console.log('Seeding users and school...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@educorp.com',
      phone: '+10000000000',
      password: hashedPassword,
      role: 'superAdmin',
      isActive: true,
      schoolId: null,
    });

    const principal = await User.create({
      name: 'Seymour Skinner',
      email: 'principal@springfield.test',
      phone: '+18888888888',
      password: hashedPassword,
      role: 'principal',
      isActive: true,
      schoolId: null,
    });

    const school = await School.create({
      name: 'Springfield Elementary',
      address: '123 Fake St, Springfield, IL 12345, USA',
      phone: '+19999999999',
      email: 'contact@springfield.test',
      principalId: principal._id,
      isActive: true,
      plan: 'standard',
      board: 'State Board',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
    });

    principal.schoolId = school._id;
    await principal.save();

    const managerUsers = await User.insertMany([
      {
        name: 'Lenny Leonard',
        email: 'finance@springfield.test',
        phone: '+18888888881',
        password: hashedPassword,
        role: 'financeManager',
        schoolId: school._id,
        isActive: true,
      },
      {
        name: 'Carl Carlson',
        email: 'hr@springfield.test',
        phone: '+18888888882',
        password: hashedPassword,
        role: 'hrManager',
        schoolId: school._id,
        isActive: true,
      },
      {
        name: 'Edna Krabappel',
        email: 'academic@springfield.test',
        phone: '+18888888883',
        password: hashedPassword,
        role: 'academicManager',
        schoolId: school._id,
        isActive: true,
      },
      {
        name: 'Ned Flanders',
        email: 'admin@springfield.test',
        phone: '+18888888884',
        password: hashedPassword,
        role: 'adminManager',
        schoolId: school._id,
        isActive: true,
      },
    ]);

    const [financeManager, hrManager, academicManager, adminManager] = managerUsers;

    const teacher = await User.create({
      name: 'Elizabeth Hoover',
      email: 'teacher@springfield.test',
      phone: '+18888888885',
      password: hashedPassword,
      role: 'teacher',
      schoolId: school._id,
      isActive: true,
      subjectsTaught: ['Mathematics', 'Science'],
      designation: 'Class Teacher',
      joiningDate: isoDate('2024-04-10T00:00:00.000Z'),
      salary: 52000,
    });

    console.log('Seeding academic setup...');
    const academicYear = await AcademicYear.create({
      name: '2025-2026',
      startDate: isoDate('2025-04-01T00:00:00.000Z'),
      endDate: isoDate('2026-03-31T23:59:59.999Z'),
      isCurrent: true,
      schoolId: school._id,
    });

    const classFive = await Class.create({
      name: 'Class 5',
      level: 5,
      academicYearId: academicYear._id,
      schoolId: school._id,
    });

    const sectionA = await Section.create({
      name: 'A',
      classId: classFive._id,
      classTeacherId: teacher._id,
      schoolId: school._id,
    });

    const sectionB = await Section.create({
      name: 'B',
      classId: classFive._id,
      classTeacherId: teacher._id,
      schoolId: school._id,
    });

    console.log('Seeding student and parent...');
    const parent = await User.create({
      name: 'Marge Simpson',
      email: 'parent@springfield.test',
      phone: '+18888888886',
      password: hashedPassword,
      role: 'parent',
      schoolId: school._id,
      isActive: true,
    });

    const student = await User.create({
      name: 'Bart Simpson',
      email: 'student@springfield.test',
      phone: '+18888888887',
      password: hashedPassword,
      role: 'student',
      schoolId: school._id,
      isActive: true,
      admissionNumber: 'ADM-1001',
      classId: classFive._id,
      sectionId: sectionA._id,
      parentId: parent._id,
    });

    parent.studentIds = [student._id];
    await parent.save();

    console.log('Seeding subscription and billing data...');
    await Subscription.create({
      schoolId: school._id,
      plan: 'standard',
      status: 'active',
      startDate: isoDate('2025-04-01T00:00:00.000Z'),
      endDate: isoDate('2026-03-31T23:59:59.999Z'),
      billing: [
        {
          amount: 9999,
          paidAt: isoDate('2025-04-05T00:00:00.000Z'),
          method: 'bank_transfer',
          receiptUrl: 'https://example.com/receipt/subscription-2025.pdf',
        },
      ],
    });

    console.log('Seeding operational entities...');
    const feeUnpaid = await Fee.create({
      schoolId: school._id,
      studentId: student._id,
      classId: classFive._id,
      title: 'Tuition Fee - Term 1',
      amount: 4500,
      dueDate: isoDate('2026-04-15T00:00:00.000Z'),
      status: 'unpaid',
    });

    await Fee.create({
      schoolId: school._id,
      studentId: student._id,
      classId: classFive._id,
      title: 'Transport Fee - April',
      amount: 1200,
      dueDate: isoDate('2026-04-10T00:00:00.000Z'),
      status: 'paid',
      paidDate: isoDate('2026-04-09T00:00:00.000Z'),
      paymentMethod: 'cash',
    });

    const salaryUnpaid = await Salary.create({
      schoolId: school._id,
      teacherId: teacher._id,
      month: 3,
      year: 2026,
      baseSalary: 52000,
      deductions: 2000,
      totalAmount: 50000,
      status: 'unpaid',
    });

    await Salary.create({
      schoolId: school._id,
      teacherId: teacher._id,
      month: 2,
      year: 2026,
      baseSalary: 52000,
      deductions: 1000,
      totalAmount: 51000,
      status: 'paid',
      paymentDate: isoDate('2026-03-01T00:00:00.000Z'),
    });

    await LeaveRequest.insertMany([
      {
        schoolId: school._id,
        applicantId: teacher._id,
        type: 'sick',
        startDate: isoDate('2026-04-03T00:00:00.000Z'),
        endDate: isoDate('2026-04-04T00:00:00.000Z'),
        reason: 'Seasonal fever',
        status: 'pending',
      },
      {
        schoolId: school._id,
        applicantId: student._id,
        type: 'casual',
        startDate: isoDate('2026-04-07T00:00:00.000Z'),
        endDate: isoDate('2026-04-07T00:00:00.000Z'),
        reason: 'Family event',
        status: 'approved',
        reviewerId: principal._id,
        reviewNote: 'Approved for one day',
      },
    ]);

    const libraryBook = await LibraryBook.create({
      schoolId: school._id,
      title: 'Matilda',
      author: 'Roald Dahl',
      isbn: '9780142410370',
      category: 'Literature',
      totalCopies: 4,
      availableCopies: 3,
      issues: [
        {
          userId: student._id,
          issueDate: isoDate('2026-03-10T00:00:00.000Z'),
          dueDate: isoDate('2026-03-24T00:00:00.000Z'),
          status: 'issued',
        },
      ],
    });

    const transportRoute = await Transport.create({
      schoolId: school._id,
      routeName: 'North Line',
      vehicleNumber: 'IL-09-EDU-101',
      driverName: 'Otto Mann',
      driverPhone: '+18888888890',
      stops: [
        {
          stopName: 'Evergreen Terrace',
          pickUpTime: '07:40',
          dropTime: '15:40',
          feeAmount: 1200,
        },
      ],
      assignedStudents: [student._id],
    });

    student.transportRouteId = transportRoute._id;
    await student.save();

    console.log('Seeding timetable, exams, marks, attendance, assignments...');
    await Timetable.create({
      schoolId: school._id,
      sectionId: sectionA._id,
      academicYearId: academicYear._id,
      schedule: [
        buildTimetableDay('Monday', 'A', sectionA._id, classFive._id, teacher._id),
        buildTimetableDay('Tuesday', 'A', sectionA._id, classFive._id, teacher._id),
      ],
    });

    await Timetable.create({
      schoolId: school._id,
      sectionId: sectionB._id,
      academicYearId: academicYear._id,
      schedule: [
        buildTimetableDay('Monday', 'B', sectionB._id, classFive._id, teacher._id),
        buildTimetableDay('Wednesday', 'B', sectionB._id, classFive._id, teacher._id),
      ],
    });

    const exam = await Exam.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      title: 'Mid-Term Examination',
      startDate: isoDate('2026-02-10T00:00:00.000Z'),
      endDate: isoDate('2026-02-20T00:00:00.000Z'),
      classes: [classFive._id],
      dateSheet: [
        {
          classId: classFive._id,
          sectionId: sectionA._id,
          subject: 'Mathematics',
          date: isoDate('2026-02-11T00:00:00.000Z'),
          startTime: '09:00',
          endTime: '10:00',
        },
        {
          classId: classFive._id,
          sectionId: sectionA._id,
          subject: 'Science',
          date: isoDate('2026-02-12T00:00:00.000Z'),
          startTime: '09:00',
          endTime: '10:00',
        },
      ],
      status: 'completed',
    });

    await Marks.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      examId: exam._id,
      sectionId: sectionA._id,
      studentId: student._id,
      subjects: [
        {
          subjectName: 'Mathematics',
          totalMarks: 100,
          obtainedMarks: 83,
          grade: 'A',
          remarks: 'Good analytical skills',
        },
        {
          subjectName: 'Science',
          totalMarks: 100,
          obtainedMarks: 79,
          grade: 'B+',
          remarks: 'Strong concept clarity',
        },
      ],
      status: 'published',
      rank: 1,
    });

    await Attendance.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      classId: classFive._id,
      sectionId: sectionA._id,
      date: isoDate('2026-03-12T00:00:00.000Z'),
      records: [
        {
          studentId: student._id,
          status: 'Present',
          remarks: '',
        },
      ],
      markedBy: teacher._id,
    });

    await Assignment.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      title: 'Fractions Worksheet',
      description: 'Solve all questions from worksheet 5A',
      subject: 'Mathematics',
      classId: classFive._id,
      sectionId: sectionA._id,
      teacherId: teacher._id,
      dueDate: isoDate('2026-04-08T00:00:00.000Z'),
      attachments: [
        {
          name: 'worksheet-5a.pdf',
          url: 'https://example.com/assignments/worksheet-5a.pdf',
          type: 'application/pdf',
        },
      ],
    });

    console.log('Seeding communications and audit logs...');
    const announcement = await Announcement.create({
      schoolId: school._id,
      authorId: principal._id,
      title: 'Parent-Teacher Meeting',
      body: 'PTM scheduled this Saturday at 10:00 AM in the main hall.',
      audience: 'all',
    });

    const event = await CalendarEvent.create({
      schoolId: school._id,
      createdBy: principal._id,
      title: 'Science Fair',
      description: 'School-wide science exhibition and project showcase.',
      type: 'event',
      startDate: isoDate('2026-04-20T10:00:00.000Z'),
      endDate: isoDate('2026-04-20T15:00:00.000Z'),
      color: '#0B9ADB',
    });

    const notificationToParent = await Notification.create({
      schoolId: school._id,
      senderId: teacher._id,
      recipientId: parent._id,
      type: 'individual',
      message: 'Bart submitted his homework on time today. Great improvement!',
      isRead: false,
    });

    await Notification.create({
      schoolId: school._id,
      senderId: academicManager._id,
      classId: classFive._id,
      type: 'class',
      message: 'Class 5 students should report to the lab by 9:00 AM tomorrow.',
      isRead: false,
    });

    await AuditLog.insertMany([
      {
        actorId: principal._id,
        actorRole: principal.role,
        schoolId: school._id,
        action: 'CREATE_ANNOUNCEMENT',
        targetModel: 'Announcement',
        targetId: announcement._id,
        metadata: { title: announcement.title },
      },
      {
        actorId: financeManager._id,
        actorRole: financeManager.role,
        schoolId: school._id,
        action: 'CREATE_FEE',
        targetModel: 'Fee',
        targetId: feeUnpaid._id,
        metadata: { title: feeUnpaid.title, amount: feeUnpaid.amount },
      },
      {
        actorId: hrManager._id,
        actorRole: hrManager.role,
        schoolId: school._id,
        action: 'CREATE_SALARY',
        targetModel: 'Salary',
        targetId: salaryUnpaid._id,
        metadata: { month: salaryUnpaid.month, year: salaryUnpaid.year },
      },
      {
        actorId: teacher._id,
        actorRole: teacher.role,
        schoolId: school._id,
        action: 'ISSUE_BOOK',
        targetModel: 'LibraryBook',
        targetId: libraryBook._id,
        metadata: { studentId: student._id, title: libraryBook.title },
      },
      {
        actorId: adminManager._id,
        actorRole: adminManager.role,
        schoolId: school._id,
        action: 'CREATE_CALENDAR_EVENT',
        targetModel: 'CalendarEvent',
        targetId: event._id,
        metadata: { title: event.title },
      },
      {
        actorId: teacher._id,
        actorRole: teacher.role,
        schoolId: school._id,
        action: 'SEND_NOTIFICATION',
        targetModel: 'Notification',
        targetId: notificationToParent._id,
        metadata: { recipientId: parent._id },
      },
      {
        actorId: superAdmin._id,
        actorRole: superAdmin.role,
        schoolId: null,
        action: 'CREATE_SCHOOL',
        targetModel: 'School',
        targetId: school._id,
        metadata: { schoolName: school.name },
      },
    ]);

    console.log('Seed completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();

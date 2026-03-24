import Marks from '../../models/Marks.js';
import User from '../../models/User.js';
import Exam from '../../models/Exam.js';
import School from '../../models/School.js';
import Class from '../../models/Class.js';
import Section from '../../models/Section.js';
import AcademicYear from '../../models/AcademicYear.js';
import AppError from '../../utils/AppError.js';
import { createReportCardPDF } from '../../services/pdfService.js';

/**
 * Generates a PDF report card stream for a student's exam results
 * @param {string} schoolId - The school ID
 * @param {string} studentId - The student's user ID
 * @param {string} examId - The exam ID
 * @returns {PDFDocument} - PDFKit document instance (readable stream)
 */
export const generatePDFStream = async (schoolId, studentId, examId) => {
  console.log('[reportCardService] generatePDFStream — starting', { schoolId, studentId, examId });

  // 1. Find the Marks document for this student/exam
  const marks = await Marks.findOne({
    schoolId,
    studentId,
    examId,
  });

  if (!marks) {
    console.log('[reportCardService] generatePDFStream — marks not found');
    throw new AppError('Marks not found for this student and exam', 404);
  }

  // 2. Ensure marks are published
  if (marks.status !== 'published') {
    console.log('[reportCardService] generatePDFStream — marks not published');
    throw new AppError('Report card is only available for published results', 403);
  }

  // 3. Fetch student details
  const student = await User.findById(studentId).select('name email phone admissionNumber classId sectionId');
  if (!student) {
    console.log('[reportCardService] generatePDFStream — student not found');
    throw new AppError('Student not found', 404);
  }

  // 4. Fetch exam details
  const exam = await Exam.findById(examId).select('title startDate endDate');
  if (!exam) {
    console.log('[reportCardService] generatePDFStream — exam not found');
    throw new AppError('Exam not found', 404);
  }

  // 5. Fetch school details
  const school = await School.findById(schoolId).select('name address phone email logoUrl');
  if (!school) {
    console.log('[reportCardService] generatePDFStream — school not found');
    throw new AppError('School not found', 404);
  }

  // 6. Fetch class and section names
  let className = 'N/A';
  let sectionName = 'N/A';

  if (student.classId) {
    const classDoc = await Class.findById(student.classId).select('name');
    if (classDoc) {
      className = classDoc.name;
    }
  }

  if (student.sectionId) {
    const sectionDoc = await Section.findById(student.sectionId).select('name');
    if (sectionDoc) {
      sectionName = sectionDoc.name;
    }
  }

  // 7. Fetch academic year name
  let academicYearName = 'N/A';
  if (marks.academicYearId) {
    const academicYear = await AcademicYear.findById(marks.academicYearId).select('name');
    if (academicYear) {
      academicYearName = academicYear.name;
    }
  }

  // 8. Prepare data for PDF generation
  const pdfData = {
    school: {
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      logoUrl: school.logoUrl,
    },
    student: {
      name: student.name,
      admissionNumber: student.admissionNumber,
      className,
      sectionName,
    },
    exam: {
      title: exam.title,
      startDate: exam.startDate,
      endDate: exam.endDate,
    },
    marks: {
      subjects: marks.subjects,
      totalObtained: marks.totalObtained,
      maxTotal: marks.maxTotal,
      percentage: marks.percentage,
      rank: marks.rank,
      academicYearName,
    },
  };

  console.log('[reportCardService] generatePDFStream — generating PDF');

  // 9. Generate and return the PDF document
  const pdfDoc = createReportCardPDF(pdfData);

  console.log('[reportCardService] generatePDFStream — PDF stream created successfully');

  return pdfDoc;
};

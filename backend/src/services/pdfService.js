import PDFDocument from 'pdfkit';

/**
 * Creates a report card PDF document
 * @param {Object} data - Report card data
 * @param {Object} data.school - School details
 * @param {Object} data.student - Student details
 * @param {Object} data.exam - Exam details
 * @param {Object} data.marks - Marks details
 * @returns {PDFDocument} - PDFKit document instance (readable stream)
 */
export const createReportCardPDF = (data) => {
  console.log('[pdfService] createReportCardPDF — starting PDF generation');

  const { school, student, exam, marks } = data;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Helper function to draw a horizontal line
  const drawLine = (y) => {
    doc.strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(545, y)
      .stroke();
  };

  // ==================== HEADER ====================
  // School Logo (if available)
  if (school.logoUrl) {
    // Note: PDFKit can load images from URLs but it requires the image to be fetched first
    // For simplicity, we skip logo embedding if it's a URL; in production, you'd fetch and embed
    doc.fontSize(24).font('Helvetica-Bold').text(school.name, { align: 'center' });
  } else {
    doc.fontSize(24).font('Helvetica-Bold').text(school.name, { align: 'center' });
  }

  doc.fontSize(10).font('Helvetica').text(school.address, { align: 'center' });
  doc.text(`Phone: ${school.phone} | Email: ${school.email}`, { align: 'center' });
  doc.moveDown(0.5);

  // Report Card Title
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#0B9ADB').text('REPORT CARD', { align: 'center' });
  doc.fillColor('#000000');
  doc.moveDown(0.5);

  drawLine(doc.y);
  doc.moveDown(0.5);

  // ==================== STUDENT & EXAM INFO ====================
  const infoStartY = doc.y;

  // Left column - Student Info
  doc.fontSize(11).font('Helvetica-Bold').text('Student Information', 50, infoStartY);
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Name: ${student.name}`, 50);
  doc.text(`Admission No: ${student.admissionNumber || 'N/A'}`, 50);
  doc.text(`Class: ${student.className || 'N/A'}`, 50);
  doc.text(`Section: ${student.sectionName || 'N/A'}`, 50);

  // Right column - Exam Info
  doc.fontSize(11).font('Helvetica-Bold').text('Examination Details', 300, infoStartY);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Exam: ${exam.title}`, 300, infoStartY + 15);
  doc.text(`Start Date: ${new Date(exam.startDate).toLocaleDateString('en-IN')}`, 300);
  doc.text(`End Date: ${new Date(exam.endDate).toLocaleDateString('en-IN')}`, 300);
  doc.text(`Academic Year: ${marks.academicYearName || 'N/A'}`, 300);

  doc.y = Math.max(doc.y, infoStartY + 80);
  doc.moveDown(0.5);
  drawLine(doc.y);
  doc.moveDown(0.5);

  // ==================== MARKS TABLE ====================
  doc.fontSize(14).font('Helvetica-Bold').text('Subject-wise Marks', { align: 'center' });
  doc.moveDown(0.5);

  // Table header
  const tableTop = doc.y;
  const colWidths = { subject: 150, total: 80, obtained: 80, percentage: 80, grade: 80 };
  const tableLeft = 50;

  // Draw table header background
  doc.rect(tableLeft, tableTop, 495, 25).fill('#0B9ADB');
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
  doc.text('Subject', tableLeft + 10, tableTop + 7);
  doc.text('Total', tableLeft + colWidths.subject + 10, tableTop + 7);
  doc.text('Obtained', tableLeft + colWidths.subject + colWidths.total + 10, tableTop + 7);
  doc.text('Percentage', tableLeft + colWidths.subject + colWidths.total + colWidths.obtained + 10, tableTop + 7);
  doc.text('Grade', tableLeft + colWidths.subject + colWidths.total + colWidths.obtained + colWidths.percentage + 10, tableTop + 7);

  doc.fillColor('#000000');

  // Table rows
  let rowY = tableTop + 25;
  const subjects = marks.subjects || [];

  subjects.forEach((subject, index) => {
    const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
    doc.rect(tableLeft, rowY, 495, 22).fill(bgColor);

    doc.fillColor('#000000').fontSize(10).font('Helvetica');
    doc.text(subject.subjectName, tableLeft + 10, rowY + 6, { width: colWidths.subject - 20 });
    doc.text(String(subject.totalMarks), tableLeft + colWidths.subject + 10, rowY + 6);
    doc.text(String(subject.obtainedMarks), tableLeft + colWidths.subject + colWidths.total + 10, rowY + 6);

    const subjectPercentage = subject.totalMarks > 0
      ? ((subject.obtainedMarks / subject.totalMarks) * 100).toFixed(1)
      : '0.0';
    doc.text(`${subjectPercentage}%`, tableLeft + colWidths.subject + colWidths.total + colWidths.obtained + 10, rowY + 6);
    doc.text(subject.grade || 'N/A', tableLeft + colWidths.subject + colWidths.total + colWidths.obtained + colWidths.percentage + 10, rowY + 6);

    rowY += 22;
  });

  // Table border
  doc.rect(tableLeft, tableTop, 495, rowY - tableTop).stroke('#cccccc');

  doc.y = rowY;
  doc.moveDown(0.5);

  // ==================== SUMMARY ====================
  drawLine(doc.y);
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica-Bold').text('Overall Summary', { align: 'center' });
  doc.moveDown(0.3);

  const summaryStartY = doc.y;
  const summaryBoxWidth = 120;
  const summaryBoxHeight = 50;
  const summaryGap = 20;
  const summaryStartX = (595 - (summaryBoxWidth * 3 + summaryGap * 2)) / 2;

  // Total Marks Box
  doc.rect(summaryStartX, summaryStartY, summaryBoxWidth, summaryBoxHeight).fill('#f0f9ff').stroke('#0B9ADB');
  doc.fillColor('#0B9ADB').fontSize(10).font('Helvetica-Bold').text('Total Marks', summaryStartX, summaryStartY + 8, { width: summaryBoxWidth, align: 'center' });
  doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text(`${marks.totalObtained} / ${marks.maxTotal}`, summaryStartX, summaryStartY + 26, { width: summaryBoxWidth, align: 'center' });

  // Percentage Box
  doc.rect(summaryStartX + summaryBoxWidth + summaryGap, summaryStartY, summaryBoxWidth, summaryBoxHeight).fill('#f0fff4').stroke('#22C55E');
  doc.fillColor('#22C55E').fontSize(10).font('Helvetica-Bold').text('Percentage', summaryStartX + summaryBoxWidth + summaryGap, summaryStartY + 8, { width: summaryBoxWidth, align: 'center' });
  doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text(`${marks.percentage.toFixed(2)}%`, summaryStartX + summaryBoxWidth + summaryGap, summaryStartY + 26, { width: summaryBoxWidth, align: 'center' });

  // Rank Box
  doc.rect(summaryStartX + (summaryBoxWidth + summaryGap) * 2, summaryStartY, summaryBoxWidth, summaryBoxHeight).fill('#fefce8').stroke('#F59E0B');
  doc.fillColor('#F59E0B').fontSize(10).font('Helvetica-Bold').text('Class Rank', summaryStartX + (summaryBoxWidth + summaryGap) * 2, summaryStartY + 8, { width: summaryBoxWidth, align: 'center' });
  doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text(marks.rank ? `#${marks.rank}` : 'N/A', summaryStartX + (summaryBoxWidth + summaryGap) * 2, summaryStartY + 26, { width: summaryBoxWidth, align: 'center' });

  doc.y = summaryStartY + summaryBoxHeight + 20;

  // ==================== FOOTER ====================
  doc.moveDown(2);
  drawLine(doc.y);
  doc.moveDown(0.5);

  // Signatures section
  const signatureY = doc.y;
  doc.fontSize(10).font('Helvetica');
  doc.text('Class Teacher', 80, signatureY, { width: 120, align: 'center' });
  doc.text('Principal', 250, signatureY, { width: 100, align: 'center' });
  doc.text('Parent/Guardian', 400, signatureY, { width: 120, align: 'center' });

  // Signature lines
  doc.moveTo(60, signatureY - 5).lineTo(180, signatureY - 5).stroke('#000000');
  doc.moveTo(230, signatureY - 5).lineTo(350, signatureY - 5).stroke('#000000');
  doc.moveTo(380, signatureY - 5).lineTo(500, signatureY - 5).stroke('#000000');

  doc.moveDown(2);

  // Generation timestamp
  doc.fontSize(8).fillColor('#888888').text(
    `Generated on ${new Date().toLocaleString('en-IN')} | ${school.name}`,
    { align: 'center' }
  );

  console.log('[pdfService] createReportCardPDF — PDF generation complete');

  return doc;
};

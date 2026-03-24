import mongoose from 'mongoose';
import Salary from '../models/Salary.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

const ALLOWED_ROLES = ['teacher', 'financeManager', 'hrManager', 'academicManager', 'adminManager'];

class SalaryService {
  async createSalary({
    schoolId,
    teacherId,
    month,
    year,
    baseSalary,
    deductions = 0,
    totalAmount,
  }) {
    console.log('[Service] createSalary starting');

    const staff = await User.findOne({
      _id: teacherId,
      schoolId,
      role: { $in: ALLOWED_ROLES },
      isActive: true,
    }).select('_id');

    if (!staff) {
      throw new AppError('Teacher or manager not found for this school', 404);
    }

    const existingSalary = await Salary.findOne({
      schoolId,
      teacherId,
      month,
      year,
    }).select('_id');

    if (existingSalary) {
      throw new AppError('Salary record already exists for this staff member and month', 409);
    }

    const salary = await Salary.create({
      schoolId,
      teacherId,
      month,
      year,
      baseSalary,
      deductions,
      totalAmount,
      status: 'unpaid',
    });

    return salary;
  }

  async getSalaries(schoolId, { status, month, year, page, limit }) {
    console.log('[Service] getSalaries starting');

    const query = { schoolId };

    if (status) {
      query.status = status;
    }

    if (Number.isInteger(month)) {
      query.month = month;
    }

    if (Number.isInteger(year)) {
      query.year = year;
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Salary.find(query)
        .populate('teacherId', 'name email role phone designation')
        .sort({ year: -1, month: -1, createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Salary.countDocuments(query),
    ]);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
    };
  }

  async getTeacherSalaries(schoolId, teacherId) {
    console.log('[Service] getTeacherSalaries starting');

    const salaries = await Salary.find({ schoolId, teacherId })
      .populate('teacherId', 'name email role phone designation')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean();

    return salaries;
  }

  async getSalaryById(schoolId, salaryId) {
    return Salary.findOne({ _id: salaryId, schoolId });
  }

  async markSalaryPaid(salaryId) {
    console.log('[Service] markSalaryPaid starting');

    return Salary.findByIdAndUpdate(
      salaryId,
      {
        status: 'paid',
        paymentDate: new Date(),
      },
      { new: true },
    );
  }

  async markSalaryDelayed(salaryId) {
    console.log('[Service] markSalaryDelayed starting');

    return Salary.findByIdAndUpdate(
      salaryId,
      {
        status: 'delayed',
        $unset: { paymentDate: 1 },
      },
      { new: true },
    );
  }

  async markSalaryUnpaid(salaryId) {
    console.log('[Service] markSalaryUnpaid starting');

    return Salary.findByIdAndUpdate(
      salaryId,
      {
        status: 'unpaid',
        $unset: { paymentDate: 1 },
      },
      { new: true },
    );
  }

  async applyIncrement(schoolId, { incrementPercent, month, year }) {
    console.log('[Service] applyIncrement starting');

    if (!incrementPercent || incrementPercent <= 0 || incrementPercent > 100) {
      throw new AppError('Increment percent must be between 1 and 100', 400);
    }

    // Get all unique teachers with salary records in the school
    const latestSalaries = await Salary.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      { $sort: { year: -1, month: -1 } },
      {
        $group: {
          _id: '$teacherId',
          baseSalary: { $first: '$baseSalary' },
          deductions: { $first: '$deductions' },
        },
      },
    ]);

    if (!latestSalaries.length) {
      throw new AppError('No salary records found to apply increment', 404);
    }

    const multiplier = 1 + incrementPercent / 100;
    const created = [];

    for (const record of latestSalaries) {
      const existing = await Salary.findOne({
        schoolId,
        teacherId: record._id,
        month,
        year,
      });
      if (existing) continue; // skip if already created for this month

      const newBase = Math.round(record.baseSalary * multiplier);
      const newDeductions = record.deductions || 0;
      const salary = await Salary.create({
        schoolId,
        teacherId: record._id,
        month,
        year,
        baseSalary: newBase,
        deductions: newDeductions,
        totalAmount: Math.max(0, newBase - newDeductions),
        status: 'unpaid',
      });
      created.push(salary);
    }

    return { applied: created.length, incrementPercent };
  }
}

export default new SalaryService();

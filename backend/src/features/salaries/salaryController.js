import salaryService from '../../services/salaryService.js';
import asyncHandler from '../../utils/asyncHandler.js';
import AppError from '../../utils/AppError.js';

export const createSalary = async (req, res, next) => {
  console.log('[CTRL] createSalary called');

  try {
    const {
      teacherId,
      month,
      year,
      baseSalary,
      deductions,
      totalAmount,
    } = req.body;

    const salary = await salaryService.createSalary({
      schoolId: req.schoolId,
      teacherId,
      month,
      year,
      baseSalary,
      deductions,
      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: 'Salary created successfully',
      data: { salary },
    });
  } catch (error) {
    next(error);
  }
};

export const getSalaries = async (req, res, next) => {
  console.log('[CTRL] getSalaries called');

  try {
    const { page = '1', limit = '20', month, year, status } = req.query;

    const parsedMonth = month ? parseInt(month, 10) : undefined;
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const data = await salaryService.getSalaries(req.schoolId, {
      status,
      month: Number.isNaN(parsedMonth) ? undefined : parsedMonth,
      year: Number.isNaN(parsedYear) ? undefined : parsedYear,
      page: Number.isNaN(parsedPage) ? 1 : parsedPage,
      limit: Number.isNaN(parsedLimit) ? 20 : parsedLimit,
    });

    res.status(200).json({
      success: true,
      message: 'Salaries retrieved',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherSalaries = async (req, res, next) => {
  console.log('[CTRL] getTeacherSalaries called');

  try {
    const { id } = req.params;

    const salaries = await salaryService.getTeacherSalaries(req.schoolId, id);

    res.status(200).json({
      success: true,
      message: 'Teacher salaries retrieved',
      data: { salaries },
    });
  } catch (error) {
    next(error);
  }
};

export const markSalaryPaid = async (req, res, next) => {
  console.log('[CTRL] markSalaryPaid called');

  try {
    const { id } = req.params;

    const salaryExists = await salaryService.getSalaryById(req.schoolId, id);
    if (!salaryExists) {
      return next(new AppError('Salary not found', 404));
    }

    const salary = await salaryService.markSalaryPaid(id);

    res.status(200).json({
      success: true,
      message: 'Salary marked paid',
      data: { salary },
    });
  } catch (error) {
    next(error);
  }
};

export const markSalaryUnpaid = async (req, res, next) => {
  console.log('[CTRL] markSalaryUnpaid called');

  try {
    const { id } = req.params;

    const salaryExists = await salaryService.getSalaryById(req.schoolId, id);
    if (!salaryExists) {
      return next(new AppError('Salary not found', 404));
    }

    const salary = await salaryService.markSalaryUnpaid(id);

    res.status(200).json({
      success: true,
      message: 'Salary marked unpaid',
      data: { salary },
    });
  } catch (error) {
    next(error);
  }
};

export const markSalaryDelayed = asyncHandler(async (req, res) => {
  console.log('[CTRL] markSalaryDelayed called');

  const { id } = req.params;
  const salaryExists = await salaryService.getSalaryById(req.schoolId, id);
  if (!salaryExists) throw new AppError('Salary not found', 404);

  const salary = await salaryService.markSalaryDelayed(id);
  res.status(200).json({ success: true, message: 'Salary marked as delayed', data: { salary } });
});

export const applyIncrement = asyncHandler(async (req, res) => {
  console.log('[CTRL] applyIncrement called');

  const { incrementPercent, month, year } = req.body;
  const result = await salaryService.applyIncrement(req.schoolId, {
    incrementPercent: Number(incrementPercent),
    month: Number(month),
    year: Number(year),
  });
  res.status(200).json({ success: true, message: `Increment applied to ${result.applied} staff records`, data: result });
});

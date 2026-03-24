import School from '../models/School.js';

export const suspensionCheck = async (req, res, next) => {
  if (!req.schoolId) return next();
  try {
    const school = await School.findById(req.schoolId).select('isActive').lean();
    if (!school || !school.isActive) {
      return res.status(403).json({
        success: false,
        message: 'School account is suspended. Contact support.'
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};
export const scopeToSchool = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.schoolId = req.user.schoolId || null;
  next();
};
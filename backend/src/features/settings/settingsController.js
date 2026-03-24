import School from '../../models/School.js';
import AcademicYear from '../../models/AcademicYear.js';
import cloudinary from '../../config/cloudinary.js';
import AppError from '../../utils/AppError.js';
import asyncHandler from '../../utils/asyncHandler.js';

const mapSchoolForSettings = (school) => {
  if (!school) {
    return school;
  }

  return {
    ...school,
    logo: school.logoUrl || '',
  };
};

export const getSettings = asyncHandler(async (req, res) => {
  console.log('[Settings Controller] getSettings called — schoolId:', req.schoolId);

  if (!req.schoolId) {
    throw new AppError('School context missing', 400);
  }

  const school = await School.findById(req.schoolId).lean();
  if (!school) {
    throw new AppError('School not found', 404);
  }

  const currentYear = await AcademicYear.findOne({
    schoolId: req.schoolId,
    isCurrent: true,
  }).lean();

  res.status(200).json({
    success: true,
    message: 'Settings fetched',
    data: {
      school: mapSchoolForSettings(school),
      currentYear: currentYear || null,
    },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  console.log('[Settings Controller] updateSettings called — schoolId:', req.schoolId);

  if (!req.schoolId) {
    throw new AppError('School context missing', 400);
  }

  const updateData = {};

  if (req.body.name) {
    updateData.name = req.body.name;
  }

  if (req.body.address) {
    updateData.address = req.body.address;
  }

  if (req.body.phone) {
    updateData.phone = req.body.phone;
  }

  if (req.body.email) {
    updateData.email = req.body.email;
  }

  if (req.file) {
    console.log('[Cloudinary] Uploading school logo');

    const uploadSource = req.file.path || req.file.secure_url;
    if (!uploadSource) {
      throw new AppError('Logo upload failed', 500);
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: 'educore/logos',
      public_id: `school_${req.schoolId}`,
      overwrite: true,
      resource_type: 'image',
    });

    if (!result?.secure_url) {
      throw new AppError('Logo upload failed', 500);
    }

    updateData.logoUrl = result.secure_url;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No update data provided', 400);
  }

  const updated = await School.findByIdAndUpdate(
    req.schoolId,
    { $set: updateData },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw new AppError('School not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      school: mapSchoolForSettings(updated),
    },
  });
});

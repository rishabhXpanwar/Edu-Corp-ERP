import bcrypt from 'bcryptjs';
import OTP from '../models/OTP.js';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createAndStoreOTP = async (phone) => {
  const plainOtp = generateOTP();
  
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(plainOtp, salt);
  
  await OTP.deleteMany({ phone });
  
  await OTP.create({
    phone,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });
  
  return plainOtp;
};

export const verifyOTP = async (phone, plainOtp) => {
  const otpRecord = await OTP.findOne({ phone });
  if (!otpRecord) return false;
  
  const isMatch = await bcrypt.compare(plainOtp, otpRecord.otp);
  
  if (isMatch) {
    await OTP.deleteOne({ _id: otpRecord._id });
    return true;
  }
  
  return false;
};

import { Router } from 'express';
import * as authController from './auth.controller.js';
import * as validators from './auth.validation.js';
import { validate } from '../../middleware/validate.js';
import { STRICT } from '../../middleware/rateLimiter.js';

const router = Router();

router.use(STRICT);

router.post('/login/email', validate(validators.loginEmailSchema), authController.loginEmail);
router.post('/send-otp', validate(validators.sendOtpSchema), authController.sendOtp);
router.post('/login/otp', validate(validators.loginOtpSchema), authController.loginOtp);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(validators.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(validators.resetPasswordSchema), authController.resetPassword);

export default router;

export const BCRYPT_ROUNDS = 12;
export const OTP_TTL_MINUTES = 5;
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

export const ROLES = Object.freeze({
  SUPER_ADMIN:      'superAdmin',
  PRINCIPAL:        'principal',
  FINANCE_MANAGER:  'financeManager',
  HR_MANAGER:       'hrManager',
  ACADEMIC_MANAGER: 'academicManager',
  ADMIN_MANAGER:    'adminManager',
  TEACHER:          'teacher',
  STUDENT:          'student',
  PARENT:           'parent'
});

export const SUBSCRIPTION_PLANS = Object.freeze(['basic', 'standard', 'premium']);
export const PAGINATION_DEFAULT_LIMIT = 20;
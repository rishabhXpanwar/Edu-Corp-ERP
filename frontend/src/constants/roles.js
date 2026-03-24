export const ROLES = Object.freeze({
  SUPER_ADMIN:      'superAdmin',
  PRINCIPAL:        'principal',
  FINANCE_MANAGER:  'financeManager',
  HR_MANAGER:       'hrManager',
  ACADEMIC_MANAGER: 'academicManager',
  ADMIN_MANAGER:    'adminManager',
  TEACHER:          'teacher',
  STUDENT:          'student',
  PARENT:           'parent',
});

export const MANAGER_ROLES = [
  ROLES.FINANCE_MANAGER,
  ROLES.HR_MANAGER,
  ROLES.ACADEMIC_MANAGER,
  ROLES.ADMIN_MANAGER,
];

export const SCHOOL_STAFF_ROLES = [
  ROLES.PRINCIPAL,
  ROLES.FINANCE_MANAGER,
  ROLES.HR_MANAGER,
  ROLES.ACADEMIC_MANAGER,
  ROLES.ADMIN_MANAGER,
  ROLES.TEACHER,
];
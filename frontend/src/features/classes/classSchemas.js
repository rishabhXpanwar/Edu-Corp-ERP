import { z } from 'zod';

export const academicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required'),
  startDate: z.string().min(1, 'StartDate is required'),
  endDate: z.string().min(1, 'EndDate is required')
});

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  level: z.coerce.number().min(1, 'Level must be at least 1'),
  academicYearId: z.string().min(1, 'Academic Year ID is required')
});

export const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  classTeacherId: z.string().optional()
});

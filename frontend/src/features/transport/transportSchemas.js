import { z } from 'zod';

const stopSchema = z.object({
  stopName: z
    .string()
    .min(1, 'Stop name is required')
    .max(200, 'Stop name must not exceed 200 characters'),
  pickUpTime: z
    .string()
    .optional()
    .or(z.literal('')),
  dropTime: z
    .string()
    .optional()
    .or(z.literal('')),
  feeAmount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? undefined : num;
    })
    .refine((val) => val === undefined || val >= 0, 'Fee amount must be positive'),
});

export const createRouteSchema = z.object({
  routeName: z
    .string()
    .min(1, 'Route name is required')
    .max(200, 'Route name must not exceed 200 characters'),
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .max(50, 'Vehicle number must not exceed 50 characters'),
  driverName: z
    .string()
    .min(1, 'Driver name is required')
    .max(100, 'Driver name must not exceed 100 characters'),
  driverPhone: z
    .string()
    .min(1, 'Driver phone is required')
    .max(20, 'Driver phone must not exceed 20 characters'),
  stops: z.array(stopSchema).optional().default([]),
});

export const updateRouteSchema = createRouteSchema.partial();

export const assignStudentSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Please select a student'),
});

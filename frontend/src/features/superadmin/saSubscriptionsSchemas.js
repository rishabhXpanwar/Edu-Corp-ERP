import { z } from 'zod';

export const updatePlanSchema = z.object({
  plan: z.enum(['basic', 'standard', 'premium'], {
    errorMap: () => ({ message: 'Please select a valid plan' })
  })
});

export const recordBillingSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  method: z.enum(['card', 'bank_transfer', 'cash'], {
    errorMap: () => ({ message: 'Please select a valid payment method' })
  }),
  receiptUrl: z.union([z.string().url('Must be a valid URL'), z.string().length(0)]).optional()
});

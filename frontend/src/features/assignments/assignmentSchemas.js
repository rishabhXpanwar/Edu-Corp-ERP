import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description is required (min 5 chars)'),
  subject: z.string().min(2, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  dueDate: z.string().min(1, 'Due date is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      type: z.string(),
    })
  ).optional() // We can also default it to empty array during submit if needed
});

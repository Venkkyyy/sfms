const { z } = require('zod');

const createBookingSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.enum([
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00',
  ]),
  purpose: z.string().max(500).optional().default(''),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

module.exports = { createBookingSchema, updateBookingStatusSchema };

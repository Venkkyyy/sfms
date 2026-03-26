const { z } = require('zod');

const createComplaintSchema = z.object({
  category: z.enum(['Electrical', 'Plumbing', 'HVAC', 'Cleaning', 'Security', 'IT', 'General']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
});

const updateComplaintSchema = z.object({
  status: z.enum(['Pending', 'In Progress', 'Resolved']).optional(),
  resolutionNotes: z.string().max(2000).optional(),
});

const assignComplaintSchema = z.object({
  technicianId: z.string().min(1, 'Technician ID is required'),
});

module.exports = { createComplaintSchema, updateComplaintSchema, assignComplaintSchema };

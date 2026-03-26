export const COMPLAINT_CATEGORIES = [
  'Electrical', 'Plumbing', 'HVAC', 'Cleaning', 'Security', 'IT', 'General',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const COMPLAINT_STATUSES = ['Pending', 'In Progress', 'Resolved'];

export const BOOKING_STATUSES = ['pending', 'approved', 'rejected'];

export const TIME_SLOTS = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00',
];

export const RESOURCE_TYPES = ['Room', 'Equipment', 'Vehicle'];

export const PRIORITY_COLORS = {
  Low: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  High: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  Critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

export const STATUS_COLORS = {
  Pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  'In Progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
  Resolved: { bg: 'bg-green-100', text: 'text-green-700' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
};

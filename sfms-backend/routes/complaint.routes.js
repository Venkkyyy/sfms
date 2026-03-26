const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaint,
  assignComplaint,
} = require('../controllers/complaint.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createComplaintSchema,
  updateComplaintSchema,
  assignComplaintSchema,
} = require('../validators/complaint.validator');

router.use(protect);

router.post('/', authorize('user'), validate(createComplaintSchema), createComplaint);
router.get('/', getComplaints);
router.patch('/:id', authorize('technician', 'admin'), validate(updateComplaintSchema), updateComplaint);
router.patch('/:id/assign', authorize('admin'), validate(assignComplaintSchema), assignComplaint);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createBookingSchema,
  updateBookingStatusSchema,
} = require('../validators/booking.validator');

router.use(protect);

router.post('/', authorize('user'), validate(createBookingSchema), createBooking);
router.get('/', getBookings);
router.patch('/:id/status', authorize('admin'), validate(updateBookingStatusSchema), updateBookingStatus);

module.exports = router;

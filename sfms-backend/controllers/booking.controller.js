const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { resourceId, date, timeSlot, purpose } = req.validatedBody;

    // Check resource exists and is available
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (!resource.availability) {
      return res.status(400).json({ message: 'Resource is not available' });
    }

    // Check for double booking (compound unique index will also catch this)
    const existingBooking = await Booking.findOne({
      resourceId,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'rejected' },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: 'This time slot is already booked for the selected resource',
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      resourceId,
      date: new Date(date),
      timeSlot,
      purpose,
    });

    await booking.populate('userId', 'name email');
    await booking.populate('resourceId', 'name type');

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      message: `New booking request for ${resource.name} on ${new Date(date).toLocaleDateString()}`,
      type: 'booking',
      referenceId: booking._id,
    }));
    await Notification.insertMany(notifications);

    const io = req.app.get('io');
    if (io) {
      admins.forEach((admin) => {
        io.to(admin._id.toString()).emit('notification:new', {
          message: `New booking request for ${resource.name}`,
          type: 'booking',
          referenceId: booking._id,
        });
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get bookings (filtered by role)
// @route   GET /api/bookings
const getBookings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'user') {
      filter.userId = req.user._id;
    }
    // Admin sees all

    const { status, date } = req.query;
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('resourceId', 'name type location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status (admin approve/reject)
// @route   PATCH /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.validatedBody;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('resourceId', 'name type');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Notify the booking user
    await Notification.create({
      userId: booking.userId._id,
      message: `Your booking for ${booking.resourceId.name} has been ${status}`,
      type: 'booking',
      referenceId: booking._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(booking.userId._id.toString()).emit('notification:new', {
        message: `Your booking for ${booking.resourceId.name} has been ${status}`,
        type: 'booking',
        referenceId: booking._id,
      });
      io.emit('booking:updated', booking);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus };

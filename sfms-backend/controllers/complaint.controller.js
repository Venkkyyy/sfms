const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create complaint
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { category, description, priority } = req.validatedBody;

    const complaint = await Complaint.create({
      userId: req.user._id,
      category,
      description,
      priority,
    });

    await complaint.populate('userId', 'name email');

    // Notify admins about new complaint
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      message: `New ${priority} priority complaint: ${category}`,
      type: 'complaint',
      referenceId: complaint._id,
    }));
    await Notification.insertMany(notifications);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      admins.forEach((admin) => {
        io.to(admin._id.toString()).emit('notification:new', {
          message: `New ${priority} priority complaint: ${category}`,
          type: 'complaint',
          referenceId: complaint._id,
        });
      });
    }

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get complaints (filtered by role)
// @route   GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'user') {
      filter.userId = req.user._id;
    } else if (req.user.role === 'technician') {
      filter.assignedTo = req.user._id;
    }
    // Admin sees all

    const { status, priority, category } = req.query;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update complaint (technician updates status/notes)
// @route   PATCH /api/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Only assigned technician or admin can update
    if (
      req.user.role === 'technician' &&
      complaint.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    const { status, resolutionNotes } = req.validatedBody;
    if (status) complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;

    await complaint.save();
    await complaint.populate('userId', 'name email');
    await complaint.populate('assignedTo', 'name email');

    // Notify the complaint owner
    await Notification.create({
      userId: complaint.userId._id,
      message: `Your complaint has been updated to: ${complaint.status}`,
      type: 'complaint',
      referenceId: complaint._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(complaint.userId._id.toString()).emit('notification:new', {
        message: `Your complaint has been updated to: ${complaint.status}`,
        type: 'complaint',
        referenceId: complaint._id,
      });
      io.emit('complaint:updated', complaint);
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign complaint to technician
// @route   PATCH /api/complaints/:id/assign
const assignComplaint = async (req, res) => {
  try {
    const { technicianId } = req.validatedBody;

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'technician') {
      return res.status(400).json({ message: 'Invalid technician ID' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: technicianId, status: 'In Progress' },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Notify technician
    await Notification.create({
      userId: technicianId,
      message: `New complaint assigned to you: ${complaint.category}`,
      type: 'complaint',
      referenceId: complaint._id,
    });

    // Notify complaint owner
    await Notification.create({
      userId: complaint.userId._id,
      message: `Your complaint has been assigned to ${technician.name}`,
      type: 'complaint',
      referenceId: complaint._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(technicianId).emit('notification:new', {
        message: `New complaint assigned to you: ${complaint.category}`,
        type: 'complaint',
        referenceId: complaint._id,
      });
      io.to(complaint.userId._id.toString()).emit('notification:new', {
        message: `Your complaint has been assigned to ${technician.name}`,
        type: 'complaint',
        referenceId: complaint._id,
      });
      io.emit('complaint:updated', complaint);
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createComplaint, getComplaints, updateComplaint, assignComplaint };

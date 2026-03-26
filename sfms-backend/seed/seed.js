const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Resource = require('../models/Resource');
const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Complaint.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sfms.com',
      password: 'admin123',
      role: 'admin',
    });

    const tech1 = await User.create({
      name: 'John Technician',
      email: 'tech1@sfms.com',
      password: 'tech123',
      role: 'technician',
    });

    const tech2 = await User.create({
      name: 'Sarah Technician',
      email: 'tech2@sfms.com',
      password: 'tech123',
      role: 'technician',
    });

    const user1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@sfms.com',
      password: 'user123',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@sfms.com',
      password: 'user123',
      role: 'user',
    });

    const user3 = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@sfms.com',
      password: 'user123',
      role: 'user',
    });

    console.log('👤 Users created');

    // Create resources
    const resources = await Resource.insertMany([
      { name: 'Conference Room A', type: 'Room', description: 'Large conference room with projector, seats 20', location: 'Building A, Floor 2' },
      { name: 'Conference Room B', type: 'Room', description: 'Small meeting room, seats 8', location: 'Building A, Floor 3' },
      { name: 'Projector HP-X1', type: 'Equipment', description: 'HP portable projector with HDMI', location: 'IT Storage' },
      { name: 'Company Van #1', type: 'Vehicle', description: 'Ford Transit van, 8 seater', location: 'Parking Lot B' },
      { name: 'Laptop Dell-15', type: 'Equipment', description: 'Dell Latitude 15" laptop', location: 'IT Storage' },
    ]);
    console.log('📦 Resources created');

    // Create sample complaints
    const complaints = await Complaint.insertMany([
      {
        userId: user1._id,
        category: 'Electrical',
        description: 'The lights in conference room A keep flickering during meetings, making it hard to present.',
        priority: 'High',
        status: 'In Progress',
        assignedTo: tech1._id,
      },
      {
        userId: user2._id,
        category: 'Plumbing',
        description: 'Water leak detected in the second floor restroom near the main entrance.',
        priority: 'Critical',
        status: 'Pending',
      },
      {
        userId: user1._id,
        category: 'HVAC',
        description: 'Air conditioning in the open office area on Floor 3 is not working properly.',
        priority: 'Medium',
        status: 'Resolved',
        assignedTo: tech2._id,
        resolutionNotes: 'Replaced the faulty thermostat and cleaned the air filters.',
      },
      {
        userId: user3._id,
        category: 'IT',
        description: 'Network connectivity issues in Building B. WiFi keeps dropping every few minutes.',
        priority: 'High',
        status: 'In Progress',
        assignedTo: tech1._id,
      },
      {
        userId: user2._id,
        category: 'Cleaning',
        description: 'The cafeteria tables need deep cleaning. Several spills have not been addressed.',
        priority: 'Low',
        status: 'Pending',
      },
    ]);
    console.log('📝 Complaints created');

    // Create sample bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    await Booking.insertMany([
      {
        userId: user1._id,
        resourceId: resources[0]._id,
        date: tomorrow,
        timeSlot: '09:00-10:00',
        status: 'approved',
        purpose: 'Team standup meeting',
      },
      {
        userId: user2._id,
        resourceId: resources[0]._id,
        date: tomorrow,
        timeSlot: '14:00-15:00',
        status: 'pending',
        purpose: 'Client presentation',
      },
      {
        userId: user3._id,
        resourceId: resources[3]._id,
        date: dayAfter,
        timeSlot: '08:00-09:00',
        status: 'pending',
        purpose: 'Office supply pickup',
      },
    ]);
    console.log('📅 Bookings created');

    // Create sample notifications
    await Notification.insertMany([
      { userId: admin._id, message: 'New critical complaint: Plumbing issue on Floor 2', type: 'complaint', referenceId: complaints[1]._id },
      { userId: tech1._id, message: 'New complaint assigned to you: Electrical issue', type: 'complaint', referenceId: complaints[0]._id },
      { userId: user1._id, message: 'Your HVAC complaint has been resolved', type: 'complaint', referenceId: complaints[2]._id, readStatus: true },
    ]);
    console.log('🔔 Notifications created');

    console.log('\n✅ Seed completed successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:      admin@sfms.com    / admin123');
    console.log('Technician: tech1@sfms.com    / tech123');
    console.log('Technician: tech2@sfms.com    / tech123');
    console.log('User:       alice@sfms.com    / user123');
    console.log('User:       bob@sfms.com      / user123');
    console.log('User:       charlie@sfms.com  / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();

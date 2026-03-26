const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: ['Room', 'Equipment', 'Vehicle'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.index({ type: 1 });

module.exports = mongoose.model('Resource', resourceSchema);

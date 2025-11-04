const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true  // This already creates an index
  },
  qrSlug: {
    type: String,
    required: true,
    unique: true  // This already creates an index
  },
  activeSessionId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// REMOVE THESE LINES - duplicate indexes
// tableSchema.index({ qrSlug: 1 });
// tableSchema.index({ number: 1 });

module.exports = mongoose.model('Table', tableSchema);

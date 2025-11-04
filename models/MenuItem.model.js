const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  availability: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  popularity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

menuItemSchema.index({ categoryId: 1, name: 1 });
menuItemSchema.index({ name: 'text', tags: 'text' });
menuItemSchema.index({ availability: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);

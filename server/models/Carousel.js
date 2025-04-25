const mongoose = require('mongoose');

const CarouselItemSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CarouselItem', CarouselItemSchema);
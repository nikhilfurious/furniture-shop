const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for tenure options (subdocument)
const TenureOptionSchema = new Schema({
  months: {
    type: String,
    required: [true, 'Tenure months is required']
  },
  price: {
    type: Number,
    required: [true, 'Tenure price is required'],
    min: [0, 'Price cannot be negative']
  }
});

// Main product schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  images: {
    type: [{type: String, required: true}],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  refundableDeposit: {
    type: Number,
    required: [true, 'Refundable deposit is required'],
    min: [0, 'Deposit cannot be negative']
  },
  brand:{
    type:String,
    trim:true
  },
  dimensions:{
    type:String,
    trim:true
  },
  color:{
    type:String,
    trim:true
  },

/*   tenureOptions: {
    type: [TenureOptionSchema],
    validate: {
      validator: function(options) {
        return options && options.length > 0;
      },
      message: 'At least one tenure option is required'
    }
  }, */
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  location:[
    {type:String,
    required:false}
  ]
}, { 
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for generating a slug (for URLs)
ProductSchema.virtual('slug').get(function() {
  return this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
});

// Pre-save middleware to update the updatedAt field
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound text index for search
ProductSchema.index({
  name: 'text',
  description: 'text',
  category: 'text'
});

module.exports = mongoose.model('Product', ProductSchema);
import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    image: {
      type: String,
      required: [true, 'Image URL is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Starters', 'Main Course', 'Desserts', 'Beverages'],
        message: 'Invalid category'
      }
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters']
    }
  },
  {
    timestamps: true
  }
);

// Index for category filtering
menuSchema.index({ category: 1, isAvailable: 1 });

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;

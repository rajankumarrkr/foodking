import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
    },
    address: {
      type: String,
      required: [true, 'Please provide your delivery address'],
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required']
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required']
      }
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Index for faster queries
userSchema.index({ phone: 1 });

const User = mongoose.model('User', userSchema);

export default User;

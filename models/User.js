const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // optional field
        // Indian phone number format: 10 digits, optionally with +91 prefix
        return /^(\+?91)?[6-9]\d{9}$/.test(v);
      },
      message: 'Please provide a valid 10-digit Indian phone number'
    }
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin'
    },
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profilePicture: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        // Only allow relative paths to prevent external URLs
        return /^\/images\/.*\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Invalid profile picture path'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds updatedAt
});

// ✅ Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', userSchema);
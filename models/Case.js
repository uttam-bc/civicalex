const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Case type is required'],
    enum: {
      values: ['Civil', 'Criminal', 'Family', 'Constitutional', 'Commercial', 'Labor', 'Tax', 'Property', 'Other'],
      message: 'Case type must be one of: Civil, Criminal, Family, Constitutional, Commercial, Labor, Tax, Property, Other'
    },
    trim: true
  },
  court: {
    type: String,
    required: [true, 'Court name is required'],
    trim: true,
    maxlength: [100, 'Court name cannot exceed 100 characters']
  },
  caseNumber: {
    type: String,
    required: [true, 'Case number is required'],
    trim: true,
    uppercase: true,
    maxlength: [50, 'Case number cannot exceed 50 characters']
  },
  parties: {
    plaintiff: { type: String, trim: true },
    defendant: { type: String, trim: true }
  },
  filingDate: {
    type: Date
  },
  nextHearing: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Closed', 'Upcoming', 'Active'],
      message: 'Status must be one of: Pending, Closed, Upcoming, Active'
    },
    default: 'Pending',
    trim: true
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  timeline: [{
    date: { type: Date, default: Date.now },
    action: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  }],
  notifications: [{
    date: { type: Date, default: Date.now },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

//Indexes for performance
caseSchema.index({ userId: 1 });
caseSchema.index({ nextHearing: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ court: 1, caseNumber: 1 }, { unique: true }); // unique per court
caseSchema.index({ createdAt: -1 }); // for sorting by recency

module.exports = mongoose.model('Case', caseSchema);
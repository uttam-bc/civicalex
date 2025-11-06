const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['Civil', 'Criminal', 'Family', 'Constitutional', 'Other']
  },
  court: {
    type: String,
    required: true
  },
  caseNumber: {
    type: String,
    required: true
  },
  parties: {
    plaintiff: String,
    defendant: String
  },
  filingDate: {
    type: Date
  },
  nextHearing: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Closed', 'Upcoming'],
    default: 'Pending'
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: Date
  }],
  timeline: [{
    date: Date,
    action: String,
    description: String
  }],
  notifications: [{
    date: Date,
    message: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Case', caseSchema);
const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Petition type is required'],
    enum: {
      values: ['Civil Writ', 'Criminal Petition', 'Public Interest Petition', 'Administrative Request', 'Constitutional Petition', 'Commercial Petition'],
      message: 'Invalid petition type'
    },
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['Draft', 'Submitted', 'Approved', 'Regret', 'Under Review'],
      message: 'Invalid status'
    },
    default: 'Draft',
    trim: true
  },
  court: {
    type: String,
    trim: true,
    maxlength: [100, 'Court name cannot exceed 100 characters']
  },
  caseNumber: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Case number cannot exceed 50 characters']
  },
  filingDate: {
    type: Date
  },
  nextHearing: {
    type: Date
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ✅ Indexes for performance
petitionSchema.index({ userId: 1 });
petitionSchema.index({ status: 1 });
petitionSchema.index({ type: 1 });
petitionSchema.index({ nextHearing: 1 });
petitionSchema.index({ caseId: 1 });
petitionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Petition', petitionSchema);
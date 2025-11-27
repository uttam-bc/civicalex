const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  petitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Petition'
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [200, 'File name cannot exceed 200 characters']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
    //Internal-only path, never exposed to client
    validate: {
      validator: function(v) {
        // Ensure path doesn't contain directory traversal
        return !v.includes('../') && !v.includes('..\\');
      },
      message: 'Invalid file path'
    }
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: {
      values: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ],
      message: 'Unsupported file type'
    }
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be greater than 0 bytes'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB
  },
  fileType: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['Evidence', 'Affidavit', 'Notice', 'Order', 'Petition', 'Judgment', 'Contract', 'Agreement', 'Other'],
      message: 'Invalid document category'
    },
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1']
  },
  accessLevel: {
    type: String,
    enum: {
      values: ['Private', 'Shared', 'Public'],
      message: 'Invalid access level'
    },
    default: 'Private'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sha256Hash: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[a-fA-F0-9]{64}$/.test(v); // SHA256 hash format
      },
      message: 'Invalid SHA256 hash format'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validation: Must belong to case OR petition (at least one)
documentSchema.pre('validate', function(next) {
  if (!this.caseId && !this.petitionId) {
    this.invalidate('caseId', 'Document must be linked to a case or petition');
    this.invalidate('petitionId', 'Document must be linked to a case or petition');
  }
  next();
});
documentSchema.add({
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Change queries to exclude deleted
documentSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Indexes for performance
documentSchema.index({ userId: 1 });
documentSchema.index({ caseId: 1 });
documentSchema.index({ petitionId: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ userId: 1, caseId: 1 });
documentSchema.index({ userId: 1, petitionId: 1 });

module.exports = mongoose.model('Document', documentSchema);
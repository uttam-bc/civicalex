const mongoose = require('mongoose');

const petitionSchema = new mongoose.Schema({
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
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Civil Writ', 'Criminal Petition', 
      'Public Interest Petition', 'Administrative Request'
    ]
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Regret'],
    default: 'Draft'
  },
  court: {
    type: String
  },
  caseNumber: {
    type: String
  },
  filingDate: {
    type: Date
  },
  nextHearing: {
    type: Date
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Petition', petitionSchema);
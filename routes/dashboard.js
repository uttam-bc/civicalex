const express = require('express');
const { authenticateSession } = require('../middleware/auth'); // Updated middleware name
const User = require('../models/user');
const Petition = require('../models/petition');
const Case = require('../models/case'); // Fixed lowercase filename
const Document = require('../models/document'); // Fixed lowercase filename
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure secure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Store files outside public/ directory
    cb(null, path.join(__dirname, '../private_uploads/'));
  },
  filename: (req, file, cb) => {
    // ✅ Generate unique filename with timestamp
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // ✅ Validate file types for security
  const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif$/i;
  if (allowedTypes.test(path.extname(file.originalname)) && allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, TXT, JPG, PNG, and GIF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Dashboard home
router.get('/', authenticateSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Fetch user data
    const user = await User.findById(userId).select('-password -__v');
    
    // Get user stats
    const totalCases = await Case.countDocuments({ userId });
    const totalPetitions = await Petition.countDocuments({ userId });
    
    const pendingCases = await Case.countDocuments({ userId, status: 'Pending' });
    const closedCases = await Case.countDocuments({ userId, status: 'Closed' });
    const upcomingCases = await Case.countDocuments({ 
      userId, 
      nextHearing: { $gte: new Date() } 
    });
    
    const draftedPetitions = await Petition.countDocuments({ userId, status: 'Draft' });
    const submittedPetitions = await Petition.countDocuments({ userId, status: 'Submitted' });
    const approvedPetitions = await Petition.countDocuments({ userId, status: 'Approved' });
    
    // Get recent items for dashboard
    const recentCases = await Case.find({ userId }).sort({ createdAt: -1 }).limit(5);
    const recentPetitions = await Petition.find({ userId }).sort({ createdAt: -1 }).limit(5);
    const recentDocuments = await Document.find({ userId }).sort({ createdAt: -1 }).limit(5);
    
    res.render('dashboard', {
      title: 'Dashboard - CivicaLex',
      user,
      stats: {
        totalCases,
        totalPetitions,
        pendingCases,
        closedCases,
        upcomingCases,
        draftedPetitions,
        submittedPetitions,
        approvedPetitions
      },
      cases: recentCases,
      petitions: recentPetitions,
      documents: recentDocuments,
      // Add upcoming hearings for calendar
      upcomingHearings: recentCases.filter(c => c.nextHearing && c.nextHearing >= new Date()).slice(0, 5)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error loading dashboard' 
    });
  }
});

// Add new case
router.post('/add-case', authenticateSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // ✅ Validate required fields
    const { title, description, type, court, caseNumber, plaintiff, defendant, filingDate, nextHearing } = req.body;
    
    if (!title || !type || !court || !caseNumber) {
      return res.status(400).render('error', { 
        title: 'Error', 
        message: 'Required fields missing' 
      });
    }

    const newCase = new Case({
      userId,
      title: title.trim(),
      description: description ? description.trim() : undefined,
      type,
      court: court.trim(),
      caseNumber: caseNumber.trim().toUpperCase(),
      parties: {
        plaintiff: plaintiff ? plaintiff.trim() : undefined,
        defendant: defendant ? defendant.trim() : undefined
      },
      filingDate: filingDate ? new Date(filingDate) : undefined,
      nextHearing: nextHearing ? new Date(nextHearing) : undefined
    });
    
    await newCase.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Add case error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error adding case' 
    });
  }
});

// Add new petition
router.post('/add-petition', authenticateSession, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // ✅ Validate required fields
    const { title, description, type, court, caseNumber, filingDate } = req.body;
    
    if (!title || !description || !type) {
      return res.status(400).render('error', { 
        title: 'Error', 
        message: 'Required fields missing' 
      });
    }

    const newPetition = new Petition({
      userId,
      title: title.trim(),
      description: description.trim(),
      type,
      court: court ? court.trim() : undefined,
      caseNumber: caseNumber ? caseNumber.trim().toUpperCase() : undefined,
      filingDate: filingDate ? new Date(filingDate) : undefined
    });
    
    await newPetition.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Add petition error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error adding petition' 
    });
  }
});

// Upload document
router.post('/upload-document', authenticateSession, upload.single('document'), async (req, res) => {
  try {
    const userId = req.session.userId;
    const { caseId, petitionId, category, description } = req.body;

    // ✅ Validate required fields
    if (!req.file) {
      return res.status(400).render('error', { 
        title: 'Error', 
        message: 'No file uploaded' 
      });
    }

    // ✅ Validate that document is linked to either case or petition
    if (!caseId && !petitionId) {
      return res.status(400).render('error', { 
        title: 'Error', 
        message: 'Document must be linked to a case or petition' 
      });
    }

    // ✅ Verify user owns the linked case/petition
    if (caseId) {
      const linkedCase = await Case.findOne({ _id: caseId, userId });
      if (!linkedCase) {
        return res.status(403).render('error', { 
          title: 'Error', 
          message: 'Invalid case ID or access denied' 
        });
      }
    }
    
    if (petitionId) {
      const linkedPetition = await Petition.findOne({ _id: petitionId, userId });
      if (!linkedPetition) {
        return res.status(403).render('error', { 
          title: 'Error', 
          message: 'Invalid petition ID or access denied' 
        });
      }
    }

    // ✅ Create document record
    const document = new Document({
      userId,
      caseId: caseId || undefined,
      petitionId: petitionId || undefined,
      fileName: req.file.originalname,
      filePath: req.file.filename, // Store only filename, not full path
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      category,
      description: description ? description.trim() : undefined
    });

    await document.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error uploading document' 
    });
  }
});

module.exports = router;
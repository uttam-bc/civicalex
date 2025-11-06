const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/user');
const Petition = require('../models/petition');
const Case = require('../models/Case');
const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Dashboard home
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
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
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error loading dashboard' 
    });
  }
});

// Add new case
router.post('/add-case', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, court, caseNumber, plaintiff, defendant, filingDate } = req.body;
    const userId = req.user.userId;
    
    const newCase = new Case({
      userId,
      title,
      description,
      type,
      court,
      caseNumber,
      parties: {
        plaintiff,
        defendant
      },
      filingDate: filingDate ? new Date(filingDate) : undefined
    });
    
    await newCase.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error adding case' 
    });
  }
});

// Add new petition
router.post('/add-petition', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, court, caseNumber } = req.body;
    const userId = req.user.userId;
    
    const newPetition = new Petition({
      userId,
      title,
      description,
      type,
      court,
      caseNumber
    });
    
    await newPetition.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error adding petition' 
    });
  }
});

// Upload document
router.post('/upload-document', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    const { caseId, petitionId, category, description } = req.body;
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
    
    const document = new Document({
      userId,
      caseId: caseId || undefined,
      petitionId: petitionId || undefined,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      category,
      description
    });
    
    await document.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error uploading document' 
    });
  }
});

module.exports = router;
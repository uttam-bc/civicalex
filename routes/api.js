const express = require('express');
const { authenticateSession } = require('../middleware/auth');
const Case = require('../models/case');
const Petition = require('../models/petition');
const router = express.Router();

// Get user's cases
router.get('/cases', authenticateSession, async (req, res) => {
  try {
    const cases = await Case.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's petitions
router.get('/petitions', authenticateSession, async (req, res) => {
  try {
    const petitions = await Petition.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(petitions);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
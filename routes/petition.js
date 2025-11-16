const express = require('express');
const { authenticateSession } = require('../middleware/auth');
const Petition = require('../models/petition');
const Document = require('../models/document');
const router = express.Router();

// GET petition detail
router.get('/:id', authenticateSession, async (req, res) => {
  try {
    const petition = await Petition.findOne({
      _id: req.params.id,
      userId: req.session.userId
    });
    
    if (!petition) {
      return res.status(404).render('error', {
        title: 'Petition Not Found',
        message: 'The requested petition could not be found'
      });
    }
    
    const documents = await Document.find({
      petitionId: req.params.id,
      userId: req.session.userId
    });
    
    res.render('petition-detail', {
      title: `${petition.title} - CivicaLex`,
      petition,
      documents
    });
  } catch (error) {
    console.error('Petition detail error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading petition details'
    });
  }
});

// POST change petition status
router.post('/:id/change-status', authenticateSession, async (req, res) => {
  try {
    const { status } = req.body;
    
    await Petition.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { status }
    );
    
    res.redirect(`/petitions/${req.params.id}`);
  } catch (error) {
    console.error('Change status error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error changing petition status'
    });
  }
});

// POST submit petition
router.post('/:id/submit', authenticateSession, async (req, res) => {
  try {
    await Petition.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId, status: 'Draft' },
      { 
        status: 'Submitted',
        filingDate: new Date()
      }
    );
    
    res.redirect(`/petitions/${req.params.id}`);
  } catch (error) {
    console.error('Submit petition error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error submitting petition'
    });
  }
});

// POST delete petition
router.post('/:id/delete', authenticateSession, async (req, res) => {
  try {
    await Petition.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId
    });
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Delete petition error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error deleting petition'
    });
  }
});

module.exports = router;
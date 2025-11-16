const express = require('express');
const { authenticateSession } = require('../middleware/auth');
const Case = require('../models/cases');
const Document = require('../models/document');
const router = express.Router();

// GET case detail
router.get('/:id', authenticateSession, async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      userId: req.session.userId
    });
    
    if (!caseData) {
      return res.status(404).render('error', {
        title: 'Case Not Found',
        message: 'The requested case could not be found'
      });
    }
    
    const documents = await Document.find({
      caseId: req.params.id,
      userId: req.session.userId
    });
    
    res.render('case-detail', {
      title: `${caseData.title} - CivicaLex`,
      caseData,
      documents
    });
  } catch (error) {
    console.error('Case detail error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading case details'
    });
  }
});

// POST add timeline event
router.post('/:id/add-event', authenticateSession, async (req, res) => {
  try {
    const { action, description, date } = req.body;
    
    await Case.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      {
        $push: {
          timeline: {
            date: new Date(date),
            action,
            description
          }
        }
      }
    );
    
    res.redirect(`/cases/${req.params.id}`);
  } catch (error) {
    console.error('Add event error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error adding timeline event'
    });
  }
});

// POST change case status
router.post('/:id/change-status', authenticateSession, async (req, res) => {
  try {
    const { status } = req.body;
    
    await Case.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { status }
    );
    
    res.redirect(`/cases/${req.params.id}`);
  } catch (error) {
    console.error('Change status error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error changing case status'
    });
  }
});

// POST delete case
router.post('/:id/delete', authenticateSession, async (req, res) => {
  try {
    await Case.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId
    });
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error deleting case'
    });
  }
});

module.exports = router;
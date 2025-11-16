const express = require('express');
const router = express.Router();

// Services landing page
router.get('/', (req, res) => {
  res.render('services', { 
    title: 'Our Services - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// Legal Awareness page
router.get('/awareness', (req, res) => {
  res.render('services/awareness', { 
    title: 'Legal Awareness - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// Legal Aid page
router.get('/aid', (req, res) => {
  res.render('services/aid', { 
    title: 'Legal Aid - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// Litigation page
router.get('/litigation', (req, res) => {
  res.render('services/litigation', { 
    title: 'Litigation - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// Legal Research page
router.get('/research', (req, res) => {
  res.render('services/research', { 
    title: 'Legal Research - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

module.exports = router;
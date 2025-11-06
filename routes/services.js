const express = require('express');
const router = express.Router();

// Legal Awareness page
router.get('/awareness', (req, res) => {
  res.render('services/awareness', { 
    title: 'Legal Awareness - CivicaLex' 
  });
});

// Legal Aid page
router.get('/aid', (req, res) => {
  res.render('services/aid', { 
    title: 'Legal Aid - CivicaLex' 
  });
});

// Litigation page
router.get('/litigation', (req, res) => {
  res.render('services/litigation', { 
    title: 'Litigation - CivicaLex' 
  });
});

// Legal Research page
router.get('/research', (req, res) => {
  res.render('services/research', { 
    title: 'Legal Research - CivicaLex' 
  });
});

module.exports = router;
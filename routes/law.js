const express = require('express');
const router = express.Router();
// Add at the beginning
router.get('/', (req, res) => {
  res.render('law/index', { 
    title: 'Areas of Law - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});
// Constitutional law page
router.get('/constitutional', (req, res) => {
  res.render('law/constitutional', { 
    title: 'Constitutional Law - CivicaLex' 
  });
});

// Company law page
router.get('/company', (req, res) => {
  res.render('law/company', { 
    title: 'Company Law - CivicaLex' 
  });
});

// Intellectual Property law page
router.get('/ip', (req, res) => {
  res.render('law/ip', { 
    title: 'Intellectual Property - CivicaLex' 
  });
});

// Criminal law page
router.get('/criminal', (req, res) => {
  res.render('law/criminal', { 
    title: 'Criminal Law - CivicaLex' 
  });
});

// Labour law page
router.get('/labour', (req, res) => {
  res.render('law/labour', { 
    title: 'Labour Law - CivicaLex' 
  });
});

// Business law page
router.get('/business', (req, res) => {
  res.render('law/business', { 
    title: 'Business Law - CivicaLex' 
  });
});

// Tax law page (GST and Income Tax)
router.get('/tax', (req, res) => {
  res.render('law/tax', { 
    title: 'Tax Law - CivicaLex' 
  });
});

// Arbitration and Conciliation law page
router.get('/arbitration', (req, res) => {
  res.render('law/arbitration', { 
    title: 'Arbitration & Conciliation - CivicaLex' 
  });
});

// Personal law page
router.get('/personal', (req, res) => {
  res.render('law/personal', { 
    title: 'Personal Law - CivicaLex' 
  });
});

module.exports = router;
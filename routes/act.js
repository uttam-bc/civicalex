const express = require('express');
const router = express.Router();

// Load acts data
const centralActs = require('../data/acts.json').central;
const stateActs = require('../data/acts.json').state;

// Central Acts list
router.get('/central', (req, res) => {
  res.render('act/central', { 
    title: 'Central Acts - CivicaLex',
    acts: centralActs
  });
});

// State Acts list
router.get('/state', (req, res) => {
  res.render('act/state', { 
    title: 'State Acts - CivicaLex',
    acts: stateActs
  });
});

module.exports = router;
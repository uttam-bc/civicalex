const express = require('express');
const router = express.Router();

// Load acts data
const actsData = require('../data/acts.json');
const centralActs = actsData.central;
const stateActs = actsData.state;

// Central Acts list
router.get('/central', (req, res) => {
  res.render('act/central', { 
    title: 'Central Acts - CivicaLex',
    acts: centralActs,
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// State Acts list
router.get('/state', (req, res) => {
  res.render('act/state', { 
    title: 'State Acts - CivicaLex',
    acts: stateActs,
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// Central Act detail
router.get('/central/:id', (req, res) => {
  const actId = parseInt(req.params.id);
  const act = centralActs.find(a => a.id === actId);
  
  if (!act) {
    return res.status(404).render('error', {
      title: 'Act Not Found',
      message: 'The requested act could not be found'
    });
  }
  
  // Extended act details (in production, fetch from database)
  const actDetails = {
    ...act,
    type: 'Central Act',
    jurisdiction: 'All India',
    status: 'Active',
    description: `The ${act.name} is an important legislation enacted in ${act.year}.`,
    longTitle: `An Act to provide for ${act.name.toLowerCase()}`,
    content: '<p>Full text of the act would be displayed here...</p>',
    sections: [],
    amendments: [],
    relatedActs: [],
    sourceUrl: 'https://legislative.gov.in'
  };
  
  res.render('act/detail', { 
    title: `${act.name} - CivicaLex`,
    act: actDetails,
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// State Act detail
router.get('/state/:id', (req, res) => {
  const actId = parseInt(req.params.id);
  const act = stateActs.find(a => a.id === actId);
  
  if (!act) {
    return res.status(404).render('error', {
      title: 'Act Not Found',
      message: 'The requested act could not be found'
    });
  }
  
  const actDetails = {
    ...act,
    type: 'State Act',
    jurisdiction: act.state,
    status: 'Active',
    description: `The ${act.name} is a state legislation enacted in ${act.year}.`,
    longTitle: `An Act to provide for ${act.name.toLowerCase()}`,
    content: '<p>Full text of the act would be displayed here...</p>',
    sections: [],
    amendments: [],
    relatedActs: [],
    sourceUrl: `https://${act.state.toLowerCase()}.gov.in`
  };
  
  res.render('act/detail', { 
    title: `${act.name} - CivicaLex`,
    act: actDetails,
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

module.exports = router;
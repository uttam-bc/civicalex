const express = require('express');
const Case = require('../models/case');
const Petition = require('../models/petition');
const actsData = require('../data/acts.json');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    const filters = req.query.type ? (Array.isArray(req.query.type) ? req.query.type : [req.query.type]) : [];
    
    if (!query) {
      return res.render('search', {
        title: 'Search - CivicaLex',
        query: '',
        results: { items: [], total: 0 },
        filters: [],
        user: req.session.userId ? { _id: req.session.userId } : null
      });
    }
    
    const results = [];
    
    // Search acts
    if (filters.length === 0 || filters.includes('acts')) {
      const matchingActs = [...actsData.central, ...actsData.state].filter(act =>
        act.name.toLowerCase().includes(query.toLowerCase())
      );
      
      matchingActs.forEach(act => {
        results.push({
          title: act.name,
          type: 'Act',
          snippet: `Act ${act.number} of ${act.year}`,
          url: act.state ? `/act/state/${act.id}` : `/act/central/${act.id}`,
          date: new Date(act.year, 0, 1),
          relevance: 85
        });
      });
    }
    
    // Search user's cases (if logged in)
    if (req.session.userId && (filters.length === 0 || filters.includes('cases'))) {
      const matchingCases = await Case.find({
        userId: req.session.userId,
        $or: [
          { title: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') },
          { caseNumber: new RegExp(query, 'i') }
        ]
      }).limit(10);
      
      matchingCases.forEach(caseItem => {
        results.push({
          title: caseItem.title,
          type: 'Case',
          snippet: caseItem.description || `Case ${caseItem.caseNumber}`,
          url: `/cases/${caseItem._id}`,
          date: caseItem.createdAt,
          relevance: 90
        });
      });
    }
    
    // Search user's petitions (if logged in)
    if (req.session.userId && (filters.length === 0 || filters.includes('petitions'))) {
      const matchingPetitions = await Petition.find({
        userId: req.session.userId,
        $or: [
          { title: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') }
        ]
      }).limit(10);
      
      matchingPetitions.forEach(petition => {
        results.push({
          title: petition.title,
          type: 'Petition',
          snippet: petition.description.substring(0, 150) + '...',
          url: `/petitions/${petition._id}`,
          date: petition.createdAt,
          relevance: 88
        });
      });
    }
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    res.render('search', {
      title: `Search: ${query} - CivicaLex`,
      query,
      results: {
        items: results,
        total: results.length
      },
      filters,
      user: req.session.userId ? { _id: req.session.userId } : null
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).render('error', {
      title: 'Search Error',
      message: 'An error occurred while searching'
    });
  }
});

module.exports = router;
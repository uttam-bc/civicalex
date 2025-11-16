const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('about', { 
    title: 'About CivicaLex - Making Legal Information Accessible',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// GET contact page
router.get('/', (req, res) => {
  res.render('contact', { 
    title: 'Contact Us - CivicaLex',
    user: req.session.userId ? { _id: req.session.userId } : null
  });
});

// POST contact form
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().matches(/^(\+?91)?[6-9]\d{9}$/).withMessage('Invalid phone number'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).render('contact', {
      title: 'Contact Us - CivicaLex',
      errors: errors.array(),
      user: req.session.userId ? { _id: req.session.userId } : null
    });
  }

  try {
    const { name, email, phone, subject, message, urgent } = req.body;
    
    // TODO: Send email notification
    // TODO: Save to database for tracking
    
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      urgent: urgent === 'on',
      timestamp: new Date()
    });
    
    res.render('contact', {
      title: 'Contact Us - CivicaLex',
      success: 'Thank you for contacting us! We will respond within 24-48 hours.',
      user: req.session.userId ? { _id: req.session.userId } : null
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).render('contact', {
      title: 'Contact Us - CivicaLex',
      error: 'An error occurred. Please try again later.',
      user: req.session.userId ? { _id: req.session.userId } : null
    });
  }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  const features = [
    { title: 'Case Management', description: 'Track and manage your legal cases efficiently' },
    { title: 'Petition Module', description: 'Draft and submit legal petitions with ease' },
    { title: 'Store Documents', description: 'Securely store and organize legal documents' },
    { title: 'Court Calendar', description: 'Schedule and track court hearings' },
    { title: 'AI Legal Draft Assistant', description: 'Generate legal documents with AI assistance' },
    { title: 'Create Petitions', description: 'Create various types of legal petitions' },
    { title: 'Legal Research', description: 'Access comprehensive legal research tools' },
    { title: 'List of Laws and Acts', description: 'Browse all Indian laws and legal acts' }
  ];
  res.render('home', { 
    title: 'CivicaLex - Trusted Legal Platform',
    features 
  });
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login - CivicaLex',
    csrfToken: req.csrfToken() 
   });
});

// Register page
router.get('/register', (req, res) => {
  // ensure csurf middleware is applied in your app so req.csrfToken exists
  const csrfToken = req.csrfToken ? req.csrfToken() : null;
  res.render('register', { 
    title: 'Register - CivicaLex',
    csrfToken
  });
});


// Login POST
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array());
    return res.status(400).render('login', { 
      title: 'Login - CivicaLex',
      errors: errors.array()
    });
  }

  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).render('login', { 
        title: 'Login - CivicaLex',
        errors: [{ msg: 'Invalid email or password' }]
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).render('login', { 
        title: 'Login - CivicaLex',
        errors: [{ msg: 'Invalid email or password' }]
      });
    }

    // SESSION-BASED AUTH
    req.session.userId = user._id;
    req.session.lastLogin = new Date();
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).render('error', { 
          title: 'Error', 
          message: 'Session error during login' 
        });
      }
      console.log('Login successful for:', email);
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error during login' 
    });
  }
});

// Register POST 
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false, gmail_convert_googlemaildotcom: false }),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .customSanitizer(value => {
      if (!value) return value;
      
      return String(value).replace(/[\s\-()]/g, '');
    })
    .matches(/^[+]?[\d]{10,15}$/)
    .withMessage('Phone number must be 10–15 digits, optional leading +')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('Registration validation errors:', errors.array());
    return res.status(400).render('register', { 
      title: 'Register - CivicaLex',
      errors: errors.array()
    });
  }

  try {
    const { name, email, password, phone, address } = req.body;
    
    console.log('Registration attempt:', { name, email, phone: phone || 'none' });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).render('register', { 
        title: 'Register - CivicaLex',
        errors: [{ msg: 'User already exists with this email' }]
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      address: address ? address.trim() : undefined
    });

    await user.save();
    console.log('User registered successfully:', email);

    // SESSION-BASED AUTH
    req.session.userId = user._id;
    req.session.lastLogin = new Date();
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).render('error', { 
          title: 'Error', 
          message: 'Session error during registration' 
        });
      }
      console.log('Registration complete, redirecting to dashboard');
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        msg: err.message
      }));
      return res.status(400).render('register', { 
        title: 'Register - CivicaLex',
        errors: validationErrors
      });
    }
    
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Server error during registration' 
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).render('error', { 
        title: 'Error', 
        message: 'Error logging out' 
      });
    }
    res.redirect('/');
  });
});

module.exports = router;
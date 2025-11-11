const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

// routes/auth.js
router.get('/', (req, res) => {
  const features = [
    { title: 'Case Management', desc: 'Track and manage your legal cases efficiently' },
    { title: 'Petition Module', desc: 'Draft and submit legal petitions with ease' },
    // ... all 9 features
  ];
  res.render('home', { 
    title: 'CivicaLex - Trusted Legal Platform',
    features 
  });
});
// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login - CivicaLex' });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register - CivicaLex' });
});

// Login POST
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('login', { 
      title: 'Login - CivicaLex',
      errors: errors.array()
    });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).render('login', { 
        title: 'Login - CivicaLex',
        errors: [{ msg: 'Invalid email or password' }]
      });
    }

    // ✅ SESSION-BASED AUTH (NO JWT)
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
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').optional().matches(/^(\+?91)?[6-9]\d{9}$/).withMessage('Invalid Indian phone number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('register', { 
      title: 'Register - CivicaLex',
      errors: errors.array()
    });
  }

  try {
    const { name, email, password, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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

    // ✅ SESSION-BASED AUTH (NO JWT)
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
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Registration error:', error);
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
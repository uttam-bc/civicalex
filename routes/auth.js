const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('home', { title: 'CivicaLex - Trusted Legal Platform' });
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
    
    if (!user) {
      return res.status(400).render('login', { 
        title: 'Login - CivicaLex',
        error: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('login', { 
        title: 'Login - CivicaLex',
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'civicalex_jwt_secret',
      { expiresIn: '7d' }
    );

    req.session.token = token;
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
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
  body('phone').optional().isMobilePhone('en-IN')
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
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('register', { 
        title: 'Register - CivicaLex',
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'civicalex_jwt_secret',
      { expiresIn: '7d' }
    );

    req.session.token = token;
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
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
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
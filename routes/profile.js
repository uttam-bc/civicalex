const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticateSession } = require('../middleware/auth');
const User = require('../models/user');
const router = express.Router();

// GET profile page
router.get('/', authenticateSession, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    res.render('profile', {
      title: 'My Profile - CivicaLex',
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading profile'
    });
  }
});

// POST update profile
router.post('/update', authenticateSession, [
  body('name').trim().isLength({ min: 2 }),
  body('phone').optional({ checkFalsy: true }),
  body('address').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const user = await User.findById(req.session.userId).select('-password');
    return res.status(400).render('profile', {
      title: 'My Profile - CivicaLex',
      user,
      errors: errors.array()
    });
  }

  try {
    const { name, phone, address } = req.body;
    
    await User.findByIdAndUpdate(req.session.userId, {
      name: name.trim(),
      phone: phone ? phone.trim() : undefined,
      address: address ? address.trim() : undefined
    });
    
    const user = await User.findById(req.session.userId).select('-password');
    res.render('profile', {
      title: 'My Profile - CivicaLex',
      user,
      success: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    const user = await User.findById(req.session.userId).select('-password');
    res.status(500).render('profile', {
      title: 'My Profile - CivicaLex',
      user,
      error: 'Error updating profile'
    });
  }
});

// POST change password
router.post('/change-password', authenticateSession, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword)
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const user = await User.findById(req.session.userId).select('-password');
    return res.status(400).render('profile', {
      title: 'My Profile - CivicaLex',
      user,
      errors: errors.array()
    });
  }

  try {
    const user = await User.findById(req.session.userId);
    const { currentPassword, newPassword } = req.body;
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const userWithoutPass = await User.findById(req.session.userId).select('-password');
      return res.status(400).render('profile', {
        title: 'My Profile - CivicaLex',
        user: userWithoutPass,
        error: 'Current password is incorrect'
      });
    }
    
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = new Date();
    await user.save();
    
    const userWithoutPass = await User.findById(req.session.userId).select('-password');
    res.render('profile', {
      title: 'My Profile - CivicaLex',
      user: userWithoutPass,
      success: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    const user = await User.findById(req.session.userId).select('-password');
    res.status(500).render('profile', {
      title: 'My Profile - CivicaLex',
      user,
      error: 'Error changing password'
    });
  }
});

module.exports = router;
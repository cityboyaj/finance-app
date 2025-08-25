const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateRegister, validateLogin } = require('../middleware/validation');
require('dotenv').config();

// Register new user
router.post('/register', validateRegister, async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Someone already has this email address' 
      });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hash });
    
    res.status(201).json({ 
      success: true,
      message: 'Account created successfully!', 
      userId: user.id 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Could not create account. Please try again.'
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or password is wrong' 
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or password is wrong' 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      success: true,
      message: 'Logged in successfully!', 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.'
    });
  }
});

module.exports = router;
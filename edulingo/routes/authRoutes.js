const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Dang nhap va tra ve thong tin user voi cac truong chi dinh
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    // Tim user theo email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Kiem tra mat khau
    const isMatch = await user.isPasswordMatch(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Kiem tra trang thai user
    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account is not active'
      });
    }

    // Tao JWT token
    // Kiem tra JWT_SECRET trong environment variable
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Tra ve thong bao thanh cong, role va token
    res.json({
      message: 'Đã login thành công',
      role: user.role || 'learner',
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Failed to login',
      error: error.message
    });
  }
});


// POST /users/logout
router.post('/logout', (req, res) => {
  // Xóa token khỏi client (ví dụ: xóa cookie hoặc localStorage)
  res.json({
    message: 'Đã logout thành công'
  });
});

module.exports = router;


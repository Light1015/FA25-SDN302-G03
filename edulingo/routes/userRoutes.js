const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Lay thong tin profile cua user tu token (khong can admin)
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    _id: req.user._id,
    full_name: req.user.full_name || req.user.name,
    email: req.user.email,
    role: req.user.role,
    gender: req.user.gender,
    status: req.user.status,
    created_at: req.user.createdAt
  });
});

// ========== CRUD USER - CHI ADMIN ==========

// GET /api/users - Lay danh sach tat ca users (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password -password_hash -__v');
    res.json({
      message: 'Success',
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// POST /api/users/create - Tao user moi (Admin only)
router.post('/create', authMiddleware, adminMiddleware, async (req, res) => {
  const { full_name, email, password, role, gender, status } = req.body;

  // Validation
  if (!full_name || !email || !password) {
    return res.status(400).json({ 
      message: 'full_name, email, and password are required' 
    });
  }

  // Kiem tra email da ton tai
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Tao user moi
    const userData = {
      full_name,
      email: email.toLowerCase(),
      password, // Se duoc hash tu dong boi pre-save hook
      role: role || 'learner',
      gender: gender || null,
      status: status || 'active'
    };

    const user = new User(userData);
    await user.save();

    // Tra ve user (khong co password)
    const userResponse = await User.findById(user._id).select('-password -password_hash -__v');

    res.status(201).json({
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to create user', 
      error: error.message 
    });
  }
});

// GET /api/users/:id - Lay thong tin chi tiet 1 user (Admin only)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Kiem tra ID co hop le khong
    if (!id || id.trim() === '') {
      return res.status(400).json({ 
        message: 'User ID is required',
        error: 'ID parameter is missing or empty'
      });
    }

    // Kiem tra format ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        error: `ID "${id}" is not a valid MongoDB ObjectId`
      });
    }

    const user = await User.findById(id).select('-password -password_hash -__v');

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: `User with ID "${id}" does not exist`
      });
    }

    res.json({
      message: 'Success',
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch user', 
      error: error.message 
    });
  }
});

// PUT /api/users/:id/update - Cap nhat user (Admin only)
router.put('/:id/update', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, role, gender, status } = req.body;

    // Kiem tra ID co hop le khong
    if (!id || id.trim() === '') {
      return res.status(400).json({ 
        message: 'User ID is required',
        error: 'ID parameter is missing or empty'
      });
    }

    // Kiem tra format ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        error: `ID "${id}" is not a valid MongoDB ObjectId`
      });
    }
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cap nhat cac truong
    if (full_name) user.full_name = full_name;
    if (email) {
      // Kiem tra email da ton tai (tru chinh user hien tai)
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email.toLowerCase();
    }
    if (password) user.password = password; // Se duoc hash tu dong
    if (role) user.role = role;
    if (gender !== undefined) user.gender = gender;
    if (status) user.status = status;

    await user.save();

    // Tra ve user da cap nhat (khong co password)
    const updatedUser = await User.findById(id).select('-password -password_hash -__v');

    res.json({
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    // Neu loi la validation hoac cast error
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid user ID or data',
        error: error.message 
      });
    }
    res.status(500).json({ 
      message: 'Failed to update user', 
      error: error.message 
    });
  }
});

// DELETE /api/users/:id/delete - Xoa user (Admin only)
router.delete('/:id/delete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Kiem tra ID co hop le khong
    if (!id || id.trim() === '') {
      return res.status(400).json({ 
        message: 'User ID is required',
        error: 'ID parameter is missing or empty'
      });
    }

    // Kiem tra format ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        error: `ID "${id}" is not a valid MongoDB ObjectId`
      });
    }
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Khong cho phep xoa chinh minh
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    // Neu loi la validation hoac cast error
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid user ID',
        error: error.message 
      });
    }
    res.status(500).json({ 
      message: 'Failed to delete user', 
      error: error.message 
    });
  }
});

module.exports = router;

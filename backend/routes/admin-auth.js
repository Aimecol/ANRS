const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');

const router = express.Router();

// Rate limiting for admin authentication
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin registration key (should be in environment variables)
const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || 'ANRS_ADMIN_2024';

// Validation middleware
const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateAdminRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('adminKey')
    .notEmpty()
    .withMessage('Admin registration key is required')
];

// Generate JWT token for admin
function generateAdminToken(admin) {
  return jwt.sign(
    { 
      adminId: admin.id, 
      email: admin.email, 
      role: admin.role,
      type: 'admin'
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/admin-login - Admin login
router.post('/admin-login', adminAuthLimiter, validateAdminLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await admin.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate token
    const token = generateAdminToken(admin);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: admin.toSafeJSON()
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/admin-register - Admin registration
router.post('/admin-register', adminAuthLimiter, validateAdminRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, adminKey } = req.body;

    // Verify admin registration key
    if (adminKey !== ADMIN_REGISTRATION_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin registration key'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: 'admin'
    });

    // Generate token
    const token = generateAdminToken(admin);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      admin: admin.toSafeJSON()
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/verify-admin - Verify admin token
router.get('/verify-admin', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        valid: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Check if it's an admin token
      if (decoded.type !== 'admin') {
        return res.status(401).json({
          valid: false,
          message: 'Invalid token type'
        });
      }

      // Verify admin still exists and is active
      const admin = await Admin.findById(decoded.adminId);
      if (!admin || !admin.is_active) {
        return res.status(401).json({
          valid: false,
          message: 'Admin not found or inactive'
        });
      }

      res.json({
        valid: true,
        admin: admin.toSafeJSON()
      });

    } catch (jwtError) {
      return res.status(401).json({
        valid: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      valid: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/admin-logout - Admin logout
router.post('/admin-logout', (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // In a production environment, you might want to implement token blacklisting
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/admin-profile - Get admin profile
router.get('/admin-profile', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found or inactive'
      });
    }

    res.json({
      success: true,
      admin: admin.toJSON()
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

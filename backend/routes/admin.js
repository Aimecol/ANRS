const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { adminAuth, superAdminAuth, requireRole, canActOnAdmin, preventSelfDeactivation } = require('../middleware/admin-auth');

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// Validation middleware
const validateAdminUpdate = [
  param('id').isInt({ min: 1 }).withMessage('Invalid admin ID'),
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('role').optional().isIn(['admin', 'super_admin']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];

const validatePasswordUpdate = [
  param('id').isInt({ min: 1 }).withMessage('Invalid admin ID'),
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// GET /api/admin/admins - Get all admins (super admin only)
router.get('/admins', superAdminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 255 }).withMessage('Search term too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await Admin.getAll(page, limit, search);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins'
    });
  }
});

// GET /api/admin/admins/:id - Get specific admin
router.get('/admins/:id', [
  param('id').isInt({ min: 1 }).withMessage('Invalid admin ID')
], canActOnAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin: admin.toJSON()
    });

  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin'
    });
  }
});

// PUT /api/admin/admins/:id - Update admin
router.put('/admins/:id', validateAdminUpdate, canActOnAdmin, preventSelfDeactivation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== admin.email) {
      const existingAdmin = await Admin.findByEmail(req.body.email);
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Only super admins can change roles
    if (req.body.role && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can change roles'
      });
    }

    const updatedAdmin = await admin.update(req.body);

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: updatedAdmin.toJSON()
    });

  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin'
    });
  }
});

// PUT /api/admin/admins/:id/password - Update admin password
router.put('/admins/:id/password', validatePasswordUpdate, canActOnAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isValidPassword = await admin.verifyPassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await admin.updatePassword(newPassword);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});

// PATCH /api/admin/admins/:id/toggle-status - Toggle admin status (super admin only)
router.patch('/admins/:id/toggle-status', [
  param('id').isInt({ min: 1 }).withMessage('Invalid admin ID')
], superAdminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const adminId = parseInt(req.params.id);

    // Prevent self-deactivation
    if (adminId === req.admin.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const updatedAdmin = await admin.toggleStatus();

    res.json({
      success: true,
      message: `Admin ${updatedAdmin.is_active ? 'activated' : 'deactivated'} successfully`,
      admin: updatedAdmin.toJSON()
    });

  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle admin status'
    });
  }
});

// DELETE /api/admin/admins/:id - Delete admin (super admin only)
router.delete('/admins/:id', [
  param('id').isInt({ min: 1 }).withMessage('Invalid admin ID')
], superAdminAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const adminId = parseInt(req.params.id);

    // Prevent self-deletion
    if (adminId === req.admin.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    await admin.delete();

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin'
    });
  }
});

// GET /api/admin/stats - Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Admin.getStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
});

module.exports = router;

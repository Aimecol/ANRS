const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Admin authentication middleware
 * Verifies JWT token and ensures user is an admin
 */
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied', 
        message: 'No token provided or invalid format' 
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied', 
        message: 'Invalid token type' 
      });
    }
    
    // Get admin from database
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied', 
        message: 'Admin not found' 
      });
    }

    // Check if admin is active
    if (!admin.is_active) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied', 
        message: 'Admin account is deactivated' 
      });
    }

    // Add admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied', 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied', 
        message: 'Token expired' 
      });
    }

    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Authentication failed' 
    });
  }
};

/**
 * Super admin authentication middleware
 * Requires super admin role
 */
const superAdminAuth = async (req, res, next) => {
  try {
    // First run admin auth
    await new Promise((resolve, reject) => {
      adminAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if admin has super admin role
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Super admin privileges required'
      });
    }

    next();
  } catch (error) {
    // Error already handled by adminAuth
    return;
  }
};

/**
 * Optional admin authentication middleware
 * Adds admin info if token is valid, but doesn't require authentication
 */
const optionalAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      if (decoded.type === 'admin') {
        const admin = await Admin.findById(decoded.adminId);

        if (admin && admin.is_active) {
          req.admin = admin;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Role-based access control middleware
 * @param {string|Array} allowedRoles - Single role or array of allowed roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: `Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Check if admin can perform action on target admin
 * Super admins can act on any admin, regular admins can only act on themselves
 */
const canActOnAdmin = (req, res, next) => {
  const targetAdminId = parseInt(req.params.id || req.params.adminId);
  const currentAdminId = req.admin.id;
  const currentAdminRole = req.admin.role;

  // Super admins can act on any admin
  if (currentAdminRole === 'super_admin') {
    return next();
  }

  // Regular admins can only act on themselves
  if (currentAdminId === targetAdminId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied',
    message: 'You can only modify your own account'
  });
};

/**
 * Prevent self-deactivation for super admins
 */
const preventSelfDeactivation = (req, res, next) => {
  const targetAdminId = parseInt(req.params.id || req.params.adminId);
  const currentAdminId = req.admin.id;
  const isDeactivating = req.body.is_active === false;

  if (currentAdminId === targetAdminId && isDeactivating) {
    return res.status(400).json({
      success: false,
      error: 'Bad request',
      message: 'You cannot deactivate your own account'
    });
  }

  next();
};

module.exports = {
  adminAuth,
  superAdminAuth,
  optionalAdminAuth,
  requireRole,
  canActOnAdmin,
  preventSelfDeactivation
};

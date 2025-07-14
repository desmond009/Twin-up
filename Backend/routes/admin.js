const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const { adminAuth, requirePermission, requireAnyPermission } = require('../middleware/auth');
const validate = require('../middleware/validate');
const adminController = require('../controllers/adminController');

// Admin authentication middleware for all routes
router.use(adminAuth);

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public (no adminAuth middleware)
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
], adminController.login);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview
// @access  Private (Admin)
router.get('/dashboard', requirePermission('view_analytics'), adminController.getDashboard);

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin)
router.get('/users', [
  requirePermission('manage_users'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
  query('status')
    .optional()
    .isIn(['all', 'active', 'banned', 'unverified'])
    .withMessage('Invalid status filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], adminController.getUsers);

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Private (Admin)
router.get('/users/:id', requirePermission('manage_users'), adminController.getUser);

// @route   PUT /api/admin/users/:id
// @desc    Update user (ban/unban, verify, etc.)
// @access  Private (Admin)
router.put('/users/:id', [
  requirePermission('manage_users'),
  body('isBanned')
    .optional()
    .isBoolean()
    .withMessage('isBanned must be a boolean'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
  body('banReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ban reason cannot be more than 500 characters'),
  validate
], adminController.updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Private (Admin)
router.delete('/users/:id', requirePermission('manage_users'), adminController.deleteUser);

// @route   GET /api/admin/swaps
// @desc    Get all swap requests with filters
// @access  Private (Admin)
router.get('/swaps', [
  requirePermission('manage_swaps'),
  query('status')
    .optional()
    .isIn(['all', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'])
    .withMessage('Invalid status filter'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], adminController.getSwaps);

// @route   GET /api/admin/swaps/:id
// @desc    Get specific swap details
// @access  Private (Admin)
router.get('/swaps/:id', requirePermission('manage_swaps'), adminController.getSwap);

// @route   DELETE /api/admin/swaps/:id
// @desc    Delete swap request
// @access  Private (Admin)
router.delete('/swaps/:id', requirePermission('manage_swaps'), adminController.deleteSwap);

// @route   GET /api/admin/feedback
// @desc    Get all feedback with filters
// @access  Private (Admin)
router.get('/feedback', [
  requirePermission('manage_feedback'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
], adminController.getFeedback);

// @route   DELETE /api/admin/feedback/:id
// @desc    Delete feedback
// @access  Private (Admin)
router.delete('/feedback/:id', requirePermission('manage_feedback'), adminController.deleteFeedback);

// @route   POST /api/admin/notifications/send
// @desc    Send notification to users
// @access  Private (Admin)
router.post('/notifications/send', [
  requirePermission('send_notifications'),
  body('type')
    .isIn(['admin_message', 'system'])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('userIds')
    .optional()
    .isArray()
    .withMessage('User IDs must be an array'),
  body('sendToAll')
    .optional()
    .isBoolean()
    .withMessage('sendToAll must be a boolean'),
  validate
], adminController.sendNotification);

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admin)
router.get('/analytics', [
  requirePermission('view_analytics'),
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Invalid period'),
  validate
], adminController.getAnalytics);

// @route   GET /api/admin/reports
// @desc    Get platform reports
// @access  Private (Admin)
router.get('/reports', [
  requirePermission('view_reports'),
  query('type')
    .optional()
    .isIn(['users', 'swaps', 'feedback', 'revenue'])
    .withMessage('Invalid report type'),
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Invalid format'),
  validate
], adminController.getReports);

// @route   GET /api/admin/admins
// @desc    Get all admin users
// @access  Private (Super Admin)
router.get('/admins', requirePermission('manage_admins'), adminController.getAdmins);

// @route   POST /api/admin/admins
// @desc    Create new admin user
// @access  Private (Super Admin)
router.post('/admins', [
  requirePermission('manage_admins'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .isIn(['admin', 'moderator'])
    .withMessage('Invalid role'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  validate
], adminController.createAdmin);

// @route   PUT /api/admin/admins/:id
// @desc    Update admin user
// @access  Private (Super Admin)
router.put('/admins/:id', [
  requirePermission('manage_admins'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'moderator'])
    .withMessage('Invalid role'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
], adminController.updateAdmin);

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin user
// @access  Private (Super Admin)
router.delete('/admins/:id', requirePermission('manage_admins'), adminController.deleteAdmin);

module.exports = router; 
const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadProfilePhoto } = require('../middleware/upload');
const userController = require('../controllers/userController');

// @route   GET /api/users/search
// @desc    Search users by skills, location, etc.
// @access  Public
router.get('/search', [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
  query('skillsOffered')
    .optional()
    .isArray()
    .withMessage('Skills offered must be an array'),
  query('skillsWanted')
    .optional()
    .isArray()
    .withMessage('Skills wanted must be an array'),
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Location must not be empty'),
  query('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validate
], userController.searchUsers);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', userController.getUserProfile);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, userController.getMyProfile);

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot be more than 100 characters'),
  body('skillsOffered')
    .optional()
    .isArray()
    .withMessage('Skills offered must be an array'),
  body('skillsOffered.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  body('skillsWanted')
    .optional()
    .isArray()
    .withMessage('Skills wanted must be an array'),
  body('skillsWanted.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  body('availability')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  validate
], userController.updateProfile);

// @route   POST /api/users/me/photo
// @desc    Upload profile photo
// @access  Private
router.post('/me/photo', protect, uploadProfilePhoto, userController.uploadProfilePhoto);

// @route   DELETE /api/users/me/photo
// @desc    Remove profile photo
// @access  Private
router.delete('/me/photo', protect, userController.removeProfilePhoto);

// @route   GET /api/users/me/feedback
// @desc    Get user's feedback
// @access  Private
router.get('/me/feedback', [
  protect,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  validate
], userController.getMyFeedback);

// @route   GET /api/users/:id/feedback
// @desc    Get user's public feedback
// @access  Public
router.get('/:id/feedback', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  validate
], userController.getUserFeedback);

// @route   POST /api/users/me/availability
// @desc    Update availability status
// @access  Private
router.post('/me/availability', [
  protect,
  body('availability')
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Invalid availability status'),
  validate
], userController.updateAvailability);

// @route   DELETE /api/users/me
// @desc    Delete user account
// @access  Private
router.delete('/me', protect, userController.deleteAccount);

module.exports = router; 
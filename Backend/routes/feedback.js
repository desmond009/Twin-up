const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const feedbackController = require('../controllers/feedbackController');

// @route   POST /api/feedback
// @desc    Submit feedback for a completed swap
// @access  Private
router.post('/', [
  protect,
  body('swapId')
    .isMongoId()
    .withMessage('Valid swap ID is required'),
  body('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  validate
], feedbackController.submitFeedback);

// @route   GET /api/feedback/swap/:swapId
// @desc    Get feedback for a specific swap
// @access  Private
router.get('/swap/:swapId', protect, feedbackController.getSwapFeedback);

// @route   GET /api/feedback/user/:userId
// @desc    Get feedback for a specific user
// @access  Public
router.get('/user/:userId', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  validate
], feedbackController.getUserFeedback);

// @route   PUT /api/feedback/:id
// @desc    Update feedback (only within 24 hours)
// @access  Private
router.put('/:id', [
  protect,
  body('stars')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  validate
], feedbackController.updateFeedback);

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (only within 24 hours)
// @access  Private
router.delete('/:id', protect, feedbackController.deleteFeedback);

// @route   GET /api/feedback/pending
// @desc    Get pending feedback for completed swaps
// @access  Private
router.get('/pending', [
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
], feedbackController.getPendingFeedback);

module.exports = router; 
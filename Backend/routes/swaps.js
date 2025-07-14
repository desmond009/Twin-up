const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const swapController = require('../controllers/swapController');

// @route   POST /api/swaps
// @desc    Create a new swap request
// @access  Private
router.post('/', [
  protect,
  body('toUser')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('skillsOffered')
    .isArray({ min: 1 })
    .withMessage('At least one skill offered is required'),
  body('skillsOffered.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  body('skillsRequested')
    .isArray({ min: 1 })
    .withMessage('At least one skill requested is required'),
  body('skillsRequested.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  validate
], swapController.createSwapRequest);

// @route   GET /api/swaps
// @desc    Get user's swap requests (sent and received)
// @access  Private
router.get('/', [
  protect,
  query('type')
    .optional()
    .isIn(['all', 'sent', 'received'])
    .withMessage('Type must be all, sent, or received'),
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  validate
], swapController.getSwapRequests);

// @route   GET /api/swaps/inbox
// @desc    Get received swap requests (alias for type=received)
// @access  Private
router.get('/inbox', [
  protect,
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  validate
], swapController.getInbox);

// @route   GET /api/swaps/:id
// @desc    Get specific swap request
// @access  Private
router.get('/:id', protect, swapController.getSwapRequest);

// @route   POST /api/swaps/:id/accept
// @desc    Accept a swap request
// @access  Private
router.post('/:id/accept', protect, swapController.acceptSwapRequest);

// @route   POST /api/swaps/:id/reject
// @desc    Reject a swap request
// @access  Private
router.post('/:id/reject', [
  protect,
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot be more than 500 characters'),
  validate
], swapController.rejectSwapRequest);

// @route   POST /api/swaps/:id/cancel
// @desc    Cancel a swap request (only sender can cancel)
// @access  Private
router.post('/:id/cancel', [
  protect,
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot be more than 500 characters'),
  validate
], swapController.cancelSwapRequest);

// @route   POST /api/swaps/:id/complete
// @desc    Mark swap as completed
// @access  Private
router.post('/:id/complete', protect, swapController.completeSwap);

// @route   DELETE /api/swaps/:id
// @desc    Delete a swap request (only sender can delete)
// @access  Private
router.delete('/:id', protect, swapController.deleteSwapRequest);

// @route   GET /api/swaps/stats/overview
// @desc    Get swap statistics for current user
// @access  Private
router.get('/stats/overview', protect, swapController.getSwapStats);

module.exports = router; 
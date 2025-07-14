const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', [
  protect,
  query('type')
    .optional()
    .isIn(['all', 'swap_request', 'swap_accepted', 'swap_rejected', 'swap_cancelled', 'swap_completed', 'feedback_received', 'admin_message', 'system'])
    .withMessage('Invalid notification type'),
  query('read')
    .optional()
    .isBoolean()
    .withMessage('Read must be a boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validate
], notificationController.getNotifications);

// @route   GET /api/notifications/unread
// @desc    Get unread notifications count
// @access  Private
router.get('/unread', protect, notificationController.getUnreadCount);

// @route   POST /api/notifications/mark-read
// @desc    Mark notifications as read
// @access  Private
router.post('/mark-read', [
  protect,
  query('notificationIds')
    .optional()
    .isArray()
    .withMessage('Notification IDs must be an array'),
  validate
], notificationController.markAsRead);

// @route   POST /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.post('/mark-all-read', protect, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, notificationController.deleteNotification);

// @route   DELETE /api/notifications
// @desc    Delete multiple notifications
// @access  Private
router.delete('/', [
  protect,
  query('notificationIds')
    .isArray()
    .withMessage('Notification IDs are required'),
  validate
], notificationController.deleteMultipleNotifications);

// @route   POST /api/notifications/settings
// @desc    Update notification settings
// @access  Private
router.post('/settings', protect, notificationController.updateSettings);

// @route   GET /api/notifications/settings
// @desc    Get notification settings
// @access  Private
router.get('/settings', protect, notificationController.getSettings);

module.exports = router; 
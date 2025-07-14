const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { type, read, page = 1, limit = 20 } = req.query;

    let query = { user: req.user.id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.getUserNotifications(
      req.user.id,
      parseInt(page),
      parseInt(limit),
      read === 'false'
    );

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count'
    });
  }
};

// @desc    Mark notifications as read
// @route   POST /api/notifications/mark-read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.query;

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await Notification.markAsRead(req.user.id, notificationIds);
    } else {
      // Mark all notifications as read
      await Notification.markAsRead(req.user.id);
    }

    res.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read'
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
};

// @desc    Delete multiple notifications
// @route   DELETE /api/notifications
// @access  Private
const deleteMultipleNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.query;

    if (!notificationIds || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs are required'
      });
    }

    // Verify all notifications belong to the user
    const notifications = await Notification.find({
      _id: { $in: notificationIds },
      user: req.user.id
    });

    if (notifications.length !== notificationIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Some notifications are not authorized for deletion'
      });
    }

    await Notification.deleteMany({
      _id: { $in: notificationIds },
      user: req.user.id
    });

    res.json({
      success: true,
      message: `${notifications.length} notification(s) deleted successfully`
    });
  } catch (error) {
    console.error('Delete multiple notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications'
    });
  }
};

// @desc    Update notification settings
// @route   POST /api/notifications/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    // This would typically involve updating user notification preferences
    // For now, we'll return a success message
    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings'
    });
  }
};

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    // This would typically involve getting user notification preferences
    // For now, we'll return default settings
    res.json({
      success: true,
      data: {
        settings: {
          emailNotifications: true,
          pushNotifications: true,
          swapRequests: true,
          feedback: true,
          adminMessages: true,
          systemUpdates: false
        }
      }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  updateSettings,
  getSettings
}; 
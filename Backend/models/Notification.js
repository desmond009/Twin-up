const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'swap_cancelled', 'swap_completed', 'feedback_received', 'admin_message', 'system'],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedSwap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest'
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = function(notificationData) {
  return this.create(notificationData);
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, page = 1, limit = 20, unreadOnly = false) {
  const skip = (page - 1) * limit;
  
  let query = { user: userId };
  
  if (unreadOnly) {
    query.read = false;
  }
  
  return this.find(query)
    .populate('relatedUser', 'name profilePhoto')
    .populate('relatedSwap', 'skillsOffered skillsRequested status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds = null) {
  let query = { user: userId };
  
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, { read: true });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true
  });
};

// Pre-save middleware to ensure data consistency
notificationSchema.pre('save', function(next) {
  // Auto-generate title if not provided
  if (!this.title) {
    switch (this.type) {
      case 'swap_request':
        this.title = 'New Swap Request';
        break;
      case 'swap_accepted':
        this.title = 'Swap Request Accepted';
        break;
      case 'swap_rejected':
        this.title = 'Swap Request Rejected';
        break;
      case 'swap_cancelled':
        this.title = 'Swap Request Cancelled';
        break;
      case 'swap_completed':
        this.title = 'Swap Completed';
        break;
      case 'feedback_received':
        this.title = 'New Feedback Received';
        break;
      case 'admin_message':
        this.title = 'Admin Message';
        break;
      case 'system':
        this.title = 'System Notification';
        break;
      default:
        this.title = 'Notification';
    }
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema); 
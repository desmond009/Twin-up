const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'From user is required']
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'To user is required']
  },
  skillsOffered: [{
    type: String,
    required: [true, 'At least one skill offered is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  }],
  skillsRequested: [{
    type: String,
    required: [true, 'At least one skill requested is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  }],
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  feedbackSubmitted: {
    fromUser: {
      type: Boolean,
      default: false
    },
    toUser: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
swapRequestSchema.index({ fromUser: 1, status: 1 });
swapRequestSchema.index({ toUser: 1, status: 1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to prevent self-swap requests
swapRequestSchema.pre('save', function(next) {
  if (this.fromUser.toString() === this.toUser.toString()) {
    return next(new Error('Cannot send swap request to yourself'));
  }
  next();
});

// Method to accept swap request
swapRequestSchema.methods.accept = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Method to reject swap request
swapRequestSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Method to cancel swap request
swapRequestSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Method to complete swap
swapRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Static method to get user's swap requests
swapRequestSchema.statics.getUserSwaps = function(userId, type = 'all', page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  let query = {};
  
  if (type === 'sent') {
    query.fromUser = userId;
  } else if (type === 'received') {
    query.toUser = userId;
  } else {
    query.$or = [{ fromUser: userId }, { toUser: userId }];
  }
  
  return this.find(query)
    .populate('fromUser', 'name email profilePhoto')
    .populate('toUser', 'name email profilePhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get swap requests by status
swapRequestSchema.statics.getSwapsByStatus = function(userId, status, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    $or: [{ fromUser: userId }, { toUser: userId }],
    status: status
  };
  
  return this.find(query)
    .populate('fromUser', 'name email profilePhoto')
    .populate('toUser', 'name email profilePhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Virtual for checking if user can submit feedback
swapRequestSchema.virtual('canSubmitFeedback').get(function() {
  return this.status === 'completed' && 
         (this.feedbackSubmitted.fromUser === false || this.feedbackSubmitted.toUser === false);
});

module.exports = mongoose.model('SwapRequest', swapRequestSchema); 
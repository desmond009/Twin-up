const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Submit feedback for a completed swap
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { swapId, stars, comment } = req.body;

    // Find the swap request
    const swapRequest = await SwapRequest.findById(swapId);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in the swap
    if (swapRequest.fromUser.toString() !== req.user.id && 
        swapRequest.toUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this swap'
      });
    }

    // Check if swap is completed
    if (swapRequest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed swaps'
      });
    }

    // Check if user has already submitted feedback
    const isFromUser = swapRequest.fromUser.toString() === req.user.id;
    const hasSubmitted = isFromUser ? swapRequest.feedbackSubmitted.fromUser : swapRequest.feedbackSubmitted.toUser;
    
    if (hasSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this swap'
      });
    }

    // Determine the target user (the other person in the swap)
    const targetUserId = isFromUser ? swapRequest.toUser : swapRequest.fromUser;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    // Add feedback to target user
    const feedbackData = {
      from: req.user.id,
      comment,
      stars
    };

    await targetUser.addFeedback(feedbackData);

    // Update swap request to mark feedback as submitted
    if (isFromUser) {
      swapRequest.feedbackSubmitted.fromUser = true;
    } else {
      swapRequest.feedbackSubmitted.toUser = true;
    }
    await swapRequest.save();

    // Create notification for the user who received feedback
    await Notification.create({
      user: targetUserId,
      type: 'feedback_received',
      title: 'New Feedback Received',
      message: `${req.user.name} left you ${stars} star${stars > 1 ? 's' : ''} feedback`,
      relatedUser: req.user.id,
      relatedSwap: swapRequest._id
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedback: feedbackData,
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          averageRating: targetUser.averageRating
        }
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
};

// @desc    Get feedback for a specific swap
// @route   GET /api/feedback/swap/:swapId
// @access  Private
const getSwapFeedback = async (req, res) => {
  try {
    const { swapId } = req.params;

    const swapRequest = await SwapRequest.findById(swapId);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in the swap
    if (swapRequest.fromUser.toString() !== req.user.id && 
        swapRequest.toUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view feedback for this swap'
      });
    }

    // Get feedback from both users
    const fromUser = await User.findById(swapRequest.fromUser).select('feedback');
    const toUser = await User.findById(swapRequest.toUser).select('feedback');

    const swapFeedback = [];

    // Find feedback related to this swap
    fromUser.feedback.forEach(feedback => {
      if (feedback.from.toString() === swapRequest.toUser.toString()) {
        swapFeedback.push({
          from: 'fromUser',
          ...feedback.toObject()
        });
      }
    });

    toUser.feedback.forEach(feedback => {
      if (feedback.from.toString() === swapRequest.fromUser.toString()) {
        swapFeedback.push({
          from: 'toUser',
          ...feedback.toObject()
        });
      }
    });

    res.json({
      success: true,
      data: {
        feedback: swapFeedback,
        feedbackSubmitted: swapRequest.feedbackSubmitted
      }
    });
  } catch (error) {
    console.error('Get swap feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap feedback'
    });
  }
};

// @desc    Get feedback for a specific user
// @route   GET /api/feedback/user/:userId
// @access  Public
const getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate('feedback.from', 'name profilePhoto')
      .select('feedback');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const feedback = user.feedback
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: user.feedback.length,
          pages: Math.ceil(user.feedback.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user feedback'
    });
  }
};

// @desc    Update feedback (only within 24 hours)
// @route   PUT /api/feedback/:id
// @access  Private
const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { stars, comment } = req.body;

    // Find user who has this feedback
    const user = await User.findOne({
      'feedback._id': id
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Find the specific feedback
    const feedback = user.feedback.id(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user is the one who submitted the feedback
    if (feedback.from.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }

    // Check if feedback is within 24 hours
    const hoursSinceCreation = (Date.now() - feedback.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be updated within 24 hours'
      });
    }

    // Update feedback
    if (stars !== undefined) {
      // Update user's total rating
      user.rating = user.rating - feedback.stars + stars;
      feedback.stars = stars;
    }

    if (comment !== undefined) {
      feedback.comment = comment;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: { feedback }
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback'
    });
  }
};

// @desc    Delete feedback (only within 24 hours)
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user who has this feedback
    const user = await User.findOne({
      'feedback._id': id
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Find the specific feedback
    const feedback = user.feedback.id(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user is the one who submitted the feedback
    if (feedback.from.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }

    // Check if feedback is within 24 hours
    const hoursSinceCreation = (Date.now() - feedback.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be deleted within 24 hours'
      });
    }

    // Update user's total rating
    user.rating -= feedback.stars;
    user.totalRatings -= 1;

    // Remove feedback
    user.feedback.pull(id);
    await user.save();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback'
    });
  }
};

// @desc    Get pending feedback for completed swaps
// @route   GET /api/feedback/pending
// @access  Private
const getPendingFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find completed swaps where user hasn't submitted feedback
    const swaps = await SwapRequest.find({
      $or: [
        { fromUser: req.user.id },
        { toUser: req.user.id }
      ],
      status: 'completed'
    }).populate('fromUser', 'name profilePhoto')
      .populate('toUser', 'name profilePhoto');

    const pendingFeedback = swaps.filter(swap => {
      const isFromUser = swap.fromUser._id.toString() === req.user.id;
      const hasSubmitted = isFromUser ? swap.feedbackSubmitted.fromUser : swap.feedbackSubmitted.toUser;
      return !hasSubmitted;
    });

    const paginatedSwaps = pendingFeedback.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        swaps: paginatedSwaps,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: pendingFeedback.length,
          pages: Math.ceil(pendingFeedback.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending feedback'
    });
  }
};

module.exports = {
  submitFeedback,
  getSwapFeedback,
  getUserFeedback,
  updateFeedback,
  deleteFeedback,
  getPendingFeedback
}; 
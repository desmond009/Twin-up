const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create swap request
// @route   POST /api/swaps
// @access  Private
const createSwapRequest = async (req, res) => {
  try {
    const { toUser, skillsOffered, skillsRequested, message } = req.body;

    // Check if target user exists and is public
    const targetUser = await User.findById(toUser);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    if (!targetUser.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send swap request to private profile'
      });
    }

    if (targetUser.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send swap request to banned user'
      });
    }

    // Check if there's already a pending swap request
    const existingSwap = await SwapRequest.findOne({
      fromUser: req.user.id,
      toUser: toUser,
      status: 'pending'
    });

    if (existingSwap) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending swap request with this user'
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      fromUser: req.user.id,
      toUser,
      skillsOffered,
      skillsRequested,
      message
    });

    // Populate user details
    await swapRequest.populate('fromUser', 'name email profilePhoto');
    await swapRequest.populate('toUser', 'name email profilePhoto');

    // Create notification for target user
    await Notification.create({
      user: toUser,
      type: 'swap_request',
      title: 'New Swap Request',
      message: `${req.user.name} wants to swap skills with you`,
      relatedUser: req.user.id,
      relatedSwap: swapRequest._id
    });

    res.status(201).json({
      success: true,
      message: 'Swap request sent successfully',
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating swap request'
    });
  }
};

// @desc    Get swap requests
// @route   GET /api/swaps
// @access  Private
const getSwapRequests = async (req, res) => {
  try {
    const { type = 'all', status, page = 1, limit = 10 } = req.query;

    let swaps;
    let total;

    if (status) {
      swaps = await SwapRequest.getSwapsByStatus(req.user.id, status, parseInt(page), parseInt(limit));
      total = await SwapRequest.countDocuments({
        $or: [{ fromUser: req.user.id }, { toUser: req.user.id }],
        status: status
      });
    } else {
      swaps = await SwapRequest.getUserSwaps(req.user.id, type, parseInt(page), parseInt(limit));
      total = await SwapRequest.countDocuments({
        $or: [{ fromUser: req.user.id }, { toUser: req.user.id }]
      });
    }

    res.json({
      success: true,
      data: {
        swaps,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap requests'
    });
  }
};

// @desc    Get inbox (received swap requests)
// @route   GET /api/swaps/inbox
// @access  Private
const getInbox = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let swaps;
    let total;

    if (status) {
      swaps = await SwapRequest.getSwapsByStatus(req.user.id, status, parseInt(page), parseInt(limit));
      total = await SwapRequest.countDocuments({
        toUser: req.user.id,
        status: status
      });
    } else {
      swaps = await SwapRequest.getUserSwaps(req.user.id, 'received', parseInt(page), parseInt(limit));
      total = await SwapRequest.countDocuments({ toUser: req.user.id });
    }

    res.json({
      success: true,
      data: {
        swaps,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inbox'
    });
  }
};

// @desc    Get specific swap request
// @route   GET /api/swaps/:id
// @access  Private
const getSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('fromUser', 'name email profilePhoto')
      .populate('toUser', 'name email profilePhoto');

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is authorized to view this swap
    if (swapRequest.fromUser._id.toString() !== req.user.id && 
        swapRequest.toUser._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this swap request'
      });
    }

    res.json({
      success: true,
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Get swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap request'
    });
  }
};

// @desc    Accept swap request
// @route   POST /api/swaps/:id/accept
// @access  Private
const acceptSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the recipient
    if (swapRequest.toUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this swap request'
      });
    }

    if (swapRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap request is not pending'
      });
    }

    // Accept the swap
    await swapRequest.accept();

    // Create notification for sender
    await Notification.create({
      user: swapRequest.fromUser,
      type: 'swap_accepted',
      title: 'Swap Request Accepted',
      message: `${req.user.name} accepted your swap request`,
      relatedUser: req.user.id,
      relatedSwap: swapRequest._id
    });

    // Populate user details for response
    await swapRequest.populate('fromUser', 'name email profilePhoto');
    await swapRequest.populate('toUser', 'name email profilePhoto');

    res.json({
      success: true,
      message: 'Swap request accepted successfully',
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Accept swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting swap request'
    });
  }
};

// @desc    Reject swap request
// @route   POST /api/swaps/:id/reject
// @access  Private
const rejectSwapRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the recipient
    if (swapRequest.toUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this swap request'
      });
    }

    if (swapRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap request is not pending'
      });
    }

    // Reject the swap
    await swapRequest.reject();

    // Create notification for sender
    await Notification.create({
      user: swapRequest.fromUser,
      type: 'swap_rejected',
      title: 'Swap Request Rejected',
      message: `${req.user.name} rejected your swap request${reason ? `: ${reason}` : ''}`,
      relatedUser: req.user.id,
      relatedSwap: swapRequest._id
    });

    // Populate user details for response
    await swapRequest.populate('fromUser', 'name email profilePhoto');
    await swapRequest.populate('toUser', 'name email profilePhoto');

    res.json({
      success: true,
      message: 'Swap request rejected successfully',
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Reject swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting swap request'
    });
  }
};

// @desc    Cancel swap request
// @route   POST /api/swaps/:id/cancel
// @access  Private
const cancelSwapRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the sender
    if (swapRequest.fromUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this swap request'
      });
    }

    if (swapRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap request is not pending'
      });
    }

    // Cancel the swap
    await swapRequest.cancel();

    // Create notification for recipient
    await Notification.create({
      user: swapRequest.toUser,
      type: 'swap_cancelled',
      title: 'Swap Request Cancelled',
      message: `${req.user.name} cancelled their swap request${reason ? `: ${reason}` : ''}`,
      relatedUser: req.user.id,
      relatedSwap: swapRequest._id
    });

    // Populate user details for response
    await swapRequest.populate('fromUser', 'name email profilePhoto');
    await swapRequest.populate('toUser', 'name email profilePhoto');

    res.json({
      success: true,
      message: 'Swap request cancelled successfully',
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Cancel swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling swap request'
    });
  }
};

// @desc    Complete swap
// @route   POST /api/swaps/:id/complete
// @access  Private
const completeSwap = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

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
        message: 'Not authorized to complete this swap'
      });
    }

    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Swap must be accepted before completion'
      });
    }

    // Complete the swap
    await swapRequest.complete();

    // Create notifications for both users
    const otherUserId = swapRequest.fromUser.toString() === req.user.id 
      ? swapRequest.toUser 
      : swapRequest.fromUser;

    await Notification.create({
      user: otherUserId,
      type: 'swap_completed',
      title: 'Swap Completed',
      message: `${req.user.name} marked the swap as completed`,
      relatedUser: req.user.id,
      relatedSwap: swapRequest._id
    });

    // Populate user details for response
    await swapRequest.populate('fromUser', 'name email profilePhoto');
    await swapRequest.populate('toUser', 'name email profilePhoto');

    res.json({
      success: true,
      message: 'Swap completed successfully',
      data: { swapRequest }
    });
  } catch (error) {
    console.error('Complete swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing swap'
    });
  }
};

// @desc    Delete swap request
// @route   DELETE /api/swaps/:id
// @access  Private
const deleteSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Check if user is the sender
    if (swapRequest.fromUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this swap request'
      });
    }

    // Only allow deletion of pending or cancelled swaps
    if (!['pending', 'cancelled'].includes(swapRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete swap request in current status'
      });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Swap request deleted successfully'
    });
  } catch (error) {
    console.error('Delete swap request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting swap request'
    });
  }
};

// @desc    Get swap statistics
// @route   GET /api/swaps/stats/overview
// @access  Private
const getSwapStats = async (req, res) => {
  try {
    const stats = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { fromUser: req.user._id },
            { toUser: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0
    };

    stats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: { stats: statsMap }
    });
  } catch (error) {
    console.error('Get swap stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap statistics'
    });
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getInbox,
  getSwapRequest,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  completeSwap,
  deleteSwapRequest,
  getSwapStats
}; 
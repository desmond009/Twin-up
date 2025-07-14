const Admin = require('../models/Admin');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Notification = require('../models/Notification');
const { generateToken } = require('../middleware/auth');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists and password is correct
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive'
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts'
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// @desc    Get admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res) => {
  try {
    // Get basic statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isBanned: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalSwaps = await SwapRequest.countDocuments();
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentSwaps = await SwapRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fromUser', 'name')
      .populate('toUser', 'name')
      .select('status createdAt');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          bannedUsers,
          totalSwaps,
          pendingSwaps,
          completedSwaps
        },
        recentActivity: {
          users: recentUsers,
          swaps: recentSwaps
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Apply search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply status filter
    if (status === 'active') {
      query.isBanned = false;
    } else if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'unverified') {
      query.isVerified = false;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get specific user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('feedback.from', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's swap statistics
    const swapStats = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { fromUser: user._id },
            { toUser: user._id }
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

    res.json({
      success: true,
      data: {
        user,
        swapStats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// @desc    Update user (ban/unban, verify, etc.)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { isBanned, isVerified, banReason } = req.body;

    const updateFields = {};
    if (isBanned !== undefined) updateFields.isBanned = isBanned;
    if (isVerified !== undefined) updateFields.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create notification for user if banned
    if (isBanned) {
      await Notification.create({
        user: user._id,
        type: 'admin_message',
        title: 'Account Suspended',
        message: `Your account has been suspended${banReason ? `: ${banReason}` : ''}`,
        data: { banReason }
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's swap requests
    await SwapRequest.deleteMany({
      $or: [
        { fromUser: user._id },
        { toUser: user._id }
      ]
    });

    // Delete user's notifications
    await Notification.deleteMany({ user: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get all swap requests with filters
// @route   GET /api/admin/swaps
// @access  Private (Admin)
const getSwaps = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const swaps = await SwapRequest.find(query)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SwapRequest.countDocuments(query);

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
    console.error('Get swaps error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swaps'
    });
  }
};

// @desc    Get specific swap details
// @route   GET /api/admin/swaps/:id
// @access  Private (Admin)
const getSwap = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('fromUser', 'name email location')
      .populate('toUser', 'name email location');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    res.json({
      success: true,
      data: { swap }
    });
  } catch (error) {
    console.error('Get swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap details'
    });
  }
};

// @desc    Delete swap request
// @route   DELETE /api/admin/swaps/:id
// @access  Private (Admin)
const deleteSwap = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Swap request deleted successfully'
    });
  } catch (error) {
    console.error('Delete swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting swap request'
    });
  }
};

// @desc    Get all feedback with filters
// @route   GET /api/admin/feedback
// @access  Private (Admin)
const getFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({ 'feedback.0': { $exists: true } })
      .populate('feedback.from', 'name email')
      .select('name email feedback')
      .sort({ 'feedback.createdAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({ 'feedback.0': { $exists: true } });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback'
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private (Admin)
const deleteFeedback = async (req, res) => {
  try {
    const user = await User.findOne({ 'feedback._id': req.params.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    const feedback = user.feedback.id(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update user's total rating
    user.rating -= feedback.stars;
    user.totalRatings -= 1;

    // Remove feedback
    user.feedback.pull(req.params.id);
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

// @desc    Send notification to users
// @route   POST /api/admin/notifications/send
// @access  Private (Admin)
const sendNotification = async (req, res) => {
  try {
    const { type, title, message, userIds, sendToAll } = req.body;

    let targetUsers = [];

    if (sendToAll) {
      targetUsers = await User.find({ isBanned: false }).select('_id');
    } else if (userIds && userIds.length > 0) {
      targetUsers = await User.find({ _id: { $in: userIds }, isBanned: false }).select('_id');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either sendToAll or userIds must be provided'
      });
    }

    // Create notifications for all target users
    const notifications = targetUsers.map(user => ({
      user: user._id,
      type,
      title,
      message,
      data: { adminMessage: true }
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Notification sent to ${targetUsers.length} user(s)`,
      data: { sentCount: targetUsers.length }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification'
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get analytics data
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    const newSwaps = await SwapRequest.countDocuments({
      createdAt: { $gte: startDate }
    });

    const completedSwaps = await SwapRequest.countDocuments({
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    // Get top skills
    const topSkillsOffered = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topSkillsWanted = await User.aggregate([
      { $unwind: '$skillsWanted' },
      { $group: { _id: '$skillsWanted', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        period,
        stats: {
          newUsers,
          newSwaps,
          completedSwaps
        },
        topSkills: {
          offered: topSkillsOffered,
          wanted: topSkillsWanted
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

// @desc    Get platform reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;

    let reportData;

    switch (type) {
      case 'users':
        reportData = await User.find().select('-password');
        break;
      case 'swaps':
        reportData = await SwapRequest.find()
          .populate('fromUser', 'name email')
          .populate('toUser', 'name email');
        break;
      case 'feedback':
        reportData = await User.find({ 'feedback.0': { $exists: true } })
          .populate('feedback.from', 'name email')
          .select('name email feedback');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvData = reportData.map(item => JSON.stringify(item)).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      res.send(csvData);
    } else {
      res.json({
        success: true,
        data: {
          type,
          count: reportData.length,
          data: reportData
        }
      });
    }
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
};

// @desc    Get all admin users
// @route   GET /api/admin/admins
// @access  Private (Super Admin)
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');

    res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins'
    });
  }
};

// @desc    Create new admin user
// @route   POST /api/admin/admins
// @access  Private (Super Admin)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this email'
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role,
      permissions
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin'
    });
  }
};

// @desc    Update admin user
// @route   PUT /api/admin/admins/:id
// @access  Private (Super Admin)
const updateAdmin = async (req, res) => {
  try {
    const { name, role, permissions, isActive } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (role !== undefined) updateFields.role = role;
    if (permissions !== undefined) updateFields.permissions = permissions;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin'
    });
  }
};

// @desc    Delete admin user
// @route   DELETE /api/admin/admins/:id
// @access  Private (Super Admin)
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent deletion of super admin
    if (admin.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete super admin'
      });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin'
    });
  }
};

module.exports = {
  login,
  getDashboard,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getSwaps,
  getSwap,
  deleteSwap,
  getFeedback,
  deleteFeedback,
  sendNotification,
  getAnalytics,
  getReports,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
}; 
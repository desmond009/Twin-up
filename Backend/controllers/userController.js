const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const {
      q,
      skillsOffered,
      skillsWanted,
      location,
      availability,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {};
    if (skillsOffered) filters.skillsOffered = skillsOffered;
    if (skillsWanted) filters.skillsWanted = skillsWanted;
    if (location) filters.location = location;
    if (availability) filters.availability = availability;

    const users = await User.searchUsers(q, filters, parseInt(page), parseInt(limit));
    const total = await User.countDocuments({ isPublic: true, isBanned: false });

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
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('feedback.from', 'name profilePhoto');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isPublic && (!req.user || req.user.id !== user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Profile is private'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          location: user.location,
          profilePhoto: user.profilePhoto,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          rating: user.rating,
          totalRatings: user.totalRatings,
          averageRating: user.averageRating,
          feedback: user.feedback.slice(0, 5), // Show only recent feedback
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('feedback.from', 'name profilePhoto');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          profilePhoto: user.profilePhoto,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isPublic: user.isPublic,
          rating: user.rating,
          totalRatings: user.totalRatings,
          averageRating: user.averageRating,
          feedback: user.feedback,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      location,
      skillsOffered,
      skillsWanted,
      availability,
      isPublic
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (location !== undefined) updateFields.location = location;
    if (skillsOffered !== undefined) updateFields.skillsOffered = skillsOffered;
    if (skillsWanted !== undefined) updateFields.skillsWanted = skillsWanted;
    if (availability !== undefined) updateFields.availability = availability;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/me/photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old photo if exists
    if (user.profilePhoto) {
      await deleteFromCloudinary(user.profilePhoto);
    }

    // Upload new photo to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'profile-photos');

    // Update user profile
    user.profilePhoto = result.secure_url;
    await user.save();

    // Delete file from server
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: result.secure_url
      }
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    
    // Clean up uploaded file if exists
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading profile photo'
    });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/users/me/photo
// @access  Private
const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profilePhoto) {
      await deleteFromCloudinary(user.profilePhoto);
      user.profilePhoto = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Profile photo removed successfully'
    });
  } catch (error) {
    console.error('Remove profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing profile photo'
    });
  }
};

// @desc    Get user's feedback
// @route   GET /api/users/me/feedback
// @access  Private
const getMyFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .populate({
        path: 'feedback.from',
        select: 'name profilePhoto'
      })
      .select('feedback');

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
    console.error('Get my feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback'
    });
  }
};

// @desc    Get user's public feedback
// @route   GET /api/users/:id/feedback
// @access  Public
const getUserFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: 'feedback.from',
        select: 'name profilePhoto'
      })
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

// @desc    Update availability
// @route   POST /api/users/me/availability
// @access  Private
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { availability },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability: user.availability }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/me
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.profilePhoto) {
      await deleteFromCloudinary(user.profilePhoto);
    }

    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  getMyProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  getMyFeedback,
  getUserFeedback,
  updateAvailability,
  deleteAccount
}; 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'moderator'
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_swaps',
      'manage_feedback',
      'view_analytics',
      'send_notifications',
      'manage_admins',
      'view_reports',
      'ban_users',
      'delete_content'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1, isActive: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Method to check permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Method to check multiple permissions
adminSchema.methods.hasAnyPermission = function(permissions) {
  if (this.role === 'super_admin') return true;
  return permissions.some(permission => this.permissions.includes(permission));
};

// Static method to get default permissions by role
adminSchema.statics.getDefaultPermissions = function(role) {
  switch (role) {
    case 'super_admin':
      return [
        'manage_users',
        'manage_swaps',
        'manage_feedback',
        'view_analytics',
        'send_notifications',
        'manage_admins',
        'view_reports',
        'ban_users',
        'delete_content'
      ];
    case 'admin':
      return [
        'manage_users',
        'manage_swaps',
        'manage_feedback',
        'view_analytics',
        'send_notifications',
        'view_reports',
        'ban_users'
      ];
    case 'moderator':
      return [
        'view_analytics',
        'send_notifications',
        'view_reports'
      ];
    default:
      return [];
  }
};

// Pre-save middleware to set default permissions
adminSchema.pre('save', function(next) {
  if (this.isModified('role') && this.permissions.length === 0) {
    this.permissions = this.constructor.getDefaultPermissions(this.role);
  }
  next();
});

module.exports = mongoose.model('Admin', adminSchema); 
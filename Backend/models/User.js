const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
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
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  profilePhoto: {
    type: String,
    default: null
  },
  skillsOffered: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  }],
  skillsWanted: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  }],
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  feedback: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: [true, 'Feedback comment is required'],
      maxlength: [500, 'Feedback comment cannot be more than 500 characters']
    },
    stars: {
      type: Number,
      required: [true, 'Rating stars are required'],
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
userSchema.virtual('averageRating').get(function() {
  if (this.totalRatings === 0) return 0;
  return (this.rating / this.totalRatings).toFixed(1);
});

// Index for search functionality
userSchema.index({ 
  name: 'text', 
  skillsOffered: 'text', 
  skillsWanted: 'text',
  location: 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update rating
userSchema.methods.updateRating = function(newRating) {
  this.totalRatings += 1;
  this.rating += newRating;
  return this.save();
};

// Method to add feedback
userSchema.methods.addFeedback = function(feedbackData) {
  this.feedback.push(feedbackData);
  return this.save();
};

// Static method to search users
userSchema.statics.searchUsers = function(query, filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  let searchQuery = { isPublic: true, isBanned: false };
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Apply filters
  if (filters.skillsOffered && filters.skillsOffered.length > 0) {
    searchQuery.skillsOffered = { $in: filters.skillsOffered };
  }
  
  if (filters.skillsWanted && filters.skillsWanted.length > 0) {
    searchQuery.skillsWanted = { $in: filters.skillsWanted };
  }
  
  if (filters.availability) {
    searchQuery.availability = filters.availability;
  }
  
  if (filters.location) {
    searchQuery.location = { $regex: filters.location, $options: 'i' };
  }
  
  return this.find(searchQuery)
    .select('name email location profilePhoto skillsOffered skillsWanted availability rating totalRatings')
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('feedback.from', 'name profilePhoto');
};

module.exports = mongoose.model('User', userSchema); 
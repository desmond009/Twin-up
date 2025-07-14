# Skill Swap Platform Backend

A comprehensive Node.js backend API for a skill swapping platform where users can exchange skills with each other. Built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based authentication with email/password
- **User Profiles**: Complete profile management with skills, location, and availability
- **Skill Discovery**: Advanced search and filtering by skills, location, and availability
- **Swap System**: Complete swap request lifecycle (propose, accept, reject, cancel, complete)
- **Feedback & Ratings**: Post-swap feedback system with star ratings
- **Notifications**: Real-time notifications for all platform activities
- **Admin Dashboard**: Comprehensive admin panel with analytics and user management

### Technical Features
- **RESTful API**: Well-structured REST endpoints
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **File Upload**: Image upload support with Cloudinary integration
- **Email Notifications**: Automated email notifications using Nodemailer
- **Rate Limiting**: API rate limiting for security
- **Security**: Helmet.js for security headers, CORS configuration
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh mechanism

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skill-swap-platform-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/skill_swap_platform

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   EMAIL_FROM=noreply@skillswap.com

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # File Upload
   MAX_FILE_SIZE=5242880
   ```

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "location": "New York",
  "skillsOffered": ["JavaScript", "React"],
  "skillsWanted": ["Python", "Machine Learning"]
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Management Endpoints

#### Search Users
```http
GET /api/users/search?q=javascript&location=New York&page=1&limit=10
```

#### Get User Profile
```http
GET /api/users/:id
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "location": "Los Angeles",
  "skillsOffered": ["JavaScript", "React", "Node.js"],
  "availability": "available"
}
```

#### Upload Profile Photo
```http
POST /api/users/me/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

profilePhoto: <file>
```

### Swap Management Endpoints

#### Create Swap Request
```http
POST /api/swaps
Authorization: Bearer <token>
Content-Type: application/json

{
  "toUser": "user_id",
  "skillsOffered": ["JavaScript", "React"],
  "skillsRequested": ["Python", "Machine Learning"],
  "message": "I'd love to learn Python and can teach you JavaScript!"
}
```

#### Get Swap Requests
```http
GET /api/swaps?type=all&status=pending&page=1&limit=10
Authorization: Bearer <token>
```

#### Accept Swap Request
```http
POST /api/swaps/:id/accept
Authorization: Bearer <token>
```

#### Reject Swap Request
```http
POST /api/swaps/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "I'm too busy right now"
}
```

### Feedback Endpoints

#### Submit Feedback
```http
POST /api/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "swapId": "swap_id",
  "stars": 5,
  "comment": "Great experience! Learned a lot."
}
```

#### Get User Feedback
```http
GET /api/feedback/user/:userId?page=1&limit=10
```

### Notification Endpoints

#### Get Notifications
```http
GET /api/notifications?type=all&read=false&page=1&limit=20
Authorization: Bearer <token>
```

#### Mark Notifications as Read
```http
POST /api/notifications/mark-read?notificationIds[]=id1&notificationIds[]=id2
Authorization: Bearer <token>
```

### Admin Endpoints

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@skillswap.com",
  "password": "adminpassword"
}
```

#### Get Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get Users (Admin)
```http
GET /api/admin/users?search=john&status=active&page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Update User (Admin)
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isBanned": false,
  "isVerified": true
}
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  location: String,
  profilePhoto: String (URL),
  skillsOffered: [String],
  skillsWanted: [String],
  availability: String (enum: available, busy, unavailable),
  isPublic: Boolean,
  rating: Number,
  totalRatings: Number,
  feedback: [{
    from: ObjectId (User),
    comment: String,
    stars: Number,
    createdAt: Date
  }],
  isVerified: Boolean,
  isBanned: Boolean,
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SwapRequest Model
```javascript
{
  fromUser: ObjectId (User),
  toUser: ObjectId (User),
  skillsOffered: [String],
  skillsRequested: [String],
  message: String,
  status: String (enum: pending, accepted, rejected, cancelled, completed),
  acceptedAt: Date,
  completedAt: Date,
  feedbackSubmitted: {
    fromUser: Boolean,
    toUser: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  user: ObjectId (User),
  type: String (enum: swap_request, swap_accepted, swap_rejected, swap_cancelled, swap_completed, feedback_received, admin_message, system),
  title: String,
  message: String,
  read: Boolean,
  data: Object,
  relatedUser: ObjectId (User),
  relatedSwap: ObjectId (SwapRequest),
  emailSent: Boolean,
  createdAt: Date
}
```

### Admin Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (enum: super_admin, admin, moderator),
  permissions: [String],
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/skill_swap_platform |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `EMAIL_HOST` | SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | Required |
| `EMAIL_PASS` | SMTP password | Required |
| `EMAIL_FROM` | From email address | noreply@skillswap.com |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Required |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `MAX_FILE_SIZE` | Max file upload size | 5242880 (5MB) |

## 🚀 Deployment

### Production Setup

1. **Set environment variables for production**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_secure_jwt_secret
   ```

2. **Install dependencies**
   ```bash
   npm install --production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t skill-swap-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 --env-file .env skill-swap-backend
   ```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
skill-swap-platform-backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── swapController.js
│   ├── feedbackController.js
│   ├── notificationController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── validate.js
│   └── upload.js
├── models/
│   ├── User.js
│   ├── SwapRequest.js
│   ├── Notification.js
│   └── Admin.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── swaps.js
│   ├── feedback.js
│   ├── notifications.js
│   └── admin.js
├── utils/
│   ├── email.js
│   └── cloudinary.js
├── uploads/
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper CORS setup for frontend integration
- **Security Headers**: Helmet.js for security headers
- **File Upload Security**: File type and size validation
- **Admin Role-Based Access**: Role-based permissions for admin functions

## 📊 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalid value"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@skillswap.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and profiles
  - Skill swap system
  - Feedback and ratings
  - Notifications
  - Admin dashboard 
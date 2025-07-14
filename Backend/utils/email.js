const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Skill Swap Platform!';
  const message = `
    Hi ${user.name},
    
    Welcome to Skill Swap Platform! We're excited to have you join our community.
    
    Here's what you can do:
    - Complete your profile with your skills
    - Search for other users to swap skills with
    - Start building your network
    
    If you have any questions, feel free to reach out to our support team.
    
    Best regards,
    The Skill Swap Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Skill Swap Platform!</h2>
      <p>Hi ${user.name},</p>
      <p>Welcome to Skill Swap Platform! We're excited to have you join our community.</p>
      <h3>Here's what you can do:</h3>
      <ul>
        <li>Complete your profile with your skills</li>
        <li>Search for other users to swap skills with</li>
        <li>Start building your network</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The Skill Swap Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const subject = 'Password Reset Request';
  const message = `
    Hi ${user.name},
    
    You requested a password reset for your Skill Swap Platform account.
    
    Please click the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 10 minutes.
    
    If you didn't request this password reset, please ignore this email.
    
    Best regards,
    The Skill Swap Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset for your Skill Swap Platform account.</p>
      <p>Please click the following button to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Skill Swap Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Send swap request notification email
const sendSwapRequestEmail = async (user, fromUser, swapRequest) => {
  const subject = 'New Swap Request';
  const message = `
    Hi ${user.name},
    
    ${fromUser.name} wants to swap skills with you!
    
    Skills offered: ${swapRequest.skillsOffered.join(', ')}
    Skills requested: ${swapRequest.skillsRequested.join(', ')}
    Message: ${swapRequest.message}
    
    Log in to your account to accept or reject this request.
    
    Best regards,
    The Skill Swap Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Swap Request</h2>
      <p>Hi ${user.name},</p>
      <p><strong>${fromUser.name}</strong> wants to swap skills with you!</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p><strong>Skills offered:</strong> ${swapRequest.skillsOffered.join(', ')}</p>
        <p><strong>Skills requested:</strong> ${swapRequest.skillsRequested.join(', ')}</p>
        <p><strong>Message:</strong> ${swapRequest.message}</p>
      </div>
      <p>Log in to your account to accept or reject this request.</p>
      <p>Best regards,<br>The Skill Swap Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Send feedback notification email
const sendFeedbackEmail = async (user, fromUser, feedback) => {
  const subject = 'New Feedback Received';
  const message = `
    Hi ${user.name},
    
    ${fromUser.name} left you feedback after your skill swap!
    
    Rating: ${feedback.stars} stars
    Comment: ${feedback.comment}
    
    Log in to your account to view all your feedback.
    
    Best regards,
    The Skill Swap Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Feedback Received</h2>
      <p>Hi ${user.name},</p>
      <p><strong>${fromUser.name}</strong> left you feedback after your skill swap!</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p><strong>Rating:</strong> ${feedback.stars} stars</p>
        <p><strong>Comment:</strong> ${feedback.comment}</p>
      </div>
      <p>Log in to your account to view all your feedback.</p>
      <p>Best regards,<br>The Skill Swap Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSwapRequestEmail,
  sendFeedbackEmail
}; 
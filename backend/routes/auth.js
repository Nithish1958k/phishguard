const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const protect = require('../middleware/auth');

// ─── Helper: Send tokens in response ─────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = user.getSignedJwtToken();
const refreshToken = crypto.randomBytes(40).toString('hex');

  // Store refresh token hash in DB
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  // Cookie options (httpOnly = not accessible by JS = XSS safe)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, { ...cookieOptions, path: '/api/auth/refresh' })
    .json({
      success: true,
      message,
      accessToken,       // Also send in body for clients that can't use cookies
      user: user.toSafeObject(),
    });
};

// ─── Validation rules ─────────────────────────────────────────────────────
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── POST /api/auth/register ───────────────────────────────────────────────
// Creates a new user account. Password is hashed by the User model pre-save hook.
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, password } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user — password is hashed automatically in model pre-save
    const user = await User.create({ name, email, password });
    console.log(`✅ New user registered: ${email} (ID: ${user._id})`);

    sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to PhishGuard.');

  } catch (error) {
    console.error('Register error:', error);
    console.log(req.body);

    // Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
// Authenticates user with email + password. Returns JWT tokens.
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    // Fetch user WITH password field (it's excluded by default via select:false)
    const user = await User.findOne({ email }).select(
      '+password +failedLoginAttempts +lockUntil +refreshToken'
    );

    // Generic error message prevents email enumeration attacks
    const authError = {
      success: false,
      message: 'Invalid email or password.',
    };

    if (!user) return res.status(401).json(authError);

    // Check if account is locked
    if (user.isLocked) {
      const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed attempts. Try again in ${lockMinutes} minute(s).`,
      });
    }

    // Compare entered password with bcrypt hash
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment failed attempts (locks after 5)
      await user.incLoginAttempts();
      return res.status(401).json(authError);
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // Login successful — reset failed attempts counter
    await user.resetLoginAttempts();

    console.log(`✅ User logged in: ${email} (Role: ${user.role})`);

    sendTokenResponse(user, 200, res, 'Login successful! Welcome back.');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
router.post('/logout', protect, async (req, res) => {
  try {
    // Clear refresh token from DB
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    // Clear cookies
    res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json({ success: true, message: 'Logged out successfully.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
});

// ─── POST /api/auth/refresh ────────────────────────────────────────────────
// Issue new access token using refresh token (keeps users logged in)
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked.' });
    }

    const { accessToken } = generateTokens(user._id);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      })
      .json({ success: true, accessToken });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Token refresh failed.' });
  }
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────
router.post('/forgot-password', [
  body('email').trim().isEmail().withMessage('Enter a valid email'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const user = await User.findOne({ email: req.body.email });

    // Always return success to prevent email enumeration
    const successMsg = 'If an account exists with that email, a reset link has been sent.';

    if (!user) return res.json({ success: true, message: successMsg });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In production: send email with reset link
    // const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // await sendEmail({ to: user.email, subject: 'Password Reset', resetURL });

    console.log(`🔑 Password reset token for ${user.email}: ${resetToken}`);

    res.json({ success: true, message: successMsg, resetToken }); // Remove resetToken in production!

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process request.' });
  }
});

// ─── POST /api/auth/reset-password/:token ─────────────────────────────────
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Token must not be expired
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');

  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
// Returns current logged-in user's profile
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.toSafeObject() });
});

module.exports = router;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,        // Enforces one account per email in DB
      lowercase: true,     // Always store emails in lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,       // NEVER return password in queries by default
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',    // Every new registration is a regular user
    },

    // Profile
    phone: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    avatar: { type: String, default: '' },

    // Training & Quiz tracking
    trainingProgress: {
      phishingAwareness: { type: Number, default: 0, min: 0, max: 100 },
      socialEngineering: { type: Number, default: 0, min: 0, max: 100 },
      passwordSecurity: { type: Number, default: 0, min: 0, max: 100 },
      malwareAwareness: { type: Number, default: 0, min: 0, max: 100 },
    },

    quizHistory: [
      {
        score: Number,
        totalQuestions: Number,
        percentage: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],

    // Security fields
    refreshToken: {
      type: String,
      select: false,      // Never expose refresh token in responses
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,       // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for performance ───────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ─── Virtual: account locked? ──────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─── Pre-save: Hash password BEFORE saving to database ────────────────────
// This runs automatically every time a user document is saved
userSchema.pre('save', async function () {
  // Only hash if password was changed
  if (!this.isModified('password')) return;

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// ─── Method: Compare entered password with stored hash ────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare safely compares plain text vs hashed (timing-attack safe)
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'phishguardsecret',
    { expiresIn: '7d' }
  );
};
// ─── Method: Increment failed login counter, lock after 5 attempts ────────
userSchema.methods.incLoginAttempts = async function () {
  // If lock expired, reset counter
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock for 15 minutes after 5 failed attempts
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }

  return await this.updateOne(updates);
};

// ─── Method: Reset failed attempts on successful login ────────────────────
userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { failedLoginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

// ─── Method: Generate password reset token ────────────────────────────────
userSchema.methods.createPasswordResetToken = function () {
  // Generate cryptographically secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash it before storing in DB (token sent via email stays plain)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token valid for 10 minutes only
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken; // Return plain token (for email)
};

// ─── Method: Safe user object for API response ────────────────────────────
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    city: this.city,
    avatar: this.avatar,
    trainingProgress: this.trainingProgress,
    quizHistory: this.quizHistory,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

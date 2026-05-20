const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const protect = require('../middleware/auth');

router.use(protect);

// ─── GET /api/users/profile ────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.toSafeObject() });
});

// ─── PATCH /api/users/profile ─────────────────────────────────────────────
router.patch('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().trim(),
  body('city').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, city } = req.body;
    const update = {};
    if (name) update.name = name;
    if (phone !== undefined) update.phone = phone;
    if (city !== undefined) update.city = city;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', user: user.toSafeObject() });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Profile update failed.' });
  }
});

// ─── PATCH /api/users/change-password ─────────────────────────────────────
router.patch('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Must contain uppercase, lowercase, and number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(req.body.currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = req.body.newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Password change failed.' });
  }
});

// ─── PATCH /api/users/training-progress ───────────────────────────────────
router.patch('/training-progress', async (req, res) => {
  try {
    const allowed = ['phishingAwareness', 'socialEngineering', 'passwordSecurity', 'malwareAwareness'];
    const update = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const val = parseInt(req.body[key]);
        if (val >= 0 && val <= 100) {
          update[`trainingProgress.${key}`] = val;
        }
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true });
    res.json({ success: true, trainingProgress: user.trainingProgress });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
});

// ─── POST /api/users/quiz-result ──────────────────────────────────────────
router.post('/quiz-result', [
  body('score').isInt({ min: 0 }).withMessage('Score required'),
  body('totalQuestions').isInt({ min: 1 }).withMessage('Total questions required'),
], async (req, res) => {
  try {
    const { score, totalQuestions } = req.body;
    const percentage = Math.round((score / totalQuestions) * 100);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { quizHistory: { score, totalQuestions, percentage } } },
      { new: true }
    );

    res.json({ success: true, message: 'Quiz result saved.', percentage });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save quiz result.' });
  }
});

// ─── GET /api/users (Admin only) ──────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-__v');
    res.json({ success: true, users: users.map(u => u.toSafeObject()), total: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

module.exports = router;

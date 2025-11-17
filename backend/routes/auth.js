const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper to send token
function sendToken(user, res) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  return res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}

// ⭐ REGISTER
router.post('/register', [
  body('name').notEmpty().withMessage("Name is required"),
  body('email').isEmail().withMessage("Valid email is required"),
  body('password').isLength({ min: 6 }).withMessage("Password must be 6+ chars")
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ msg: errors.array()[0].msg });

  const { name, email, password } = req.body;

  try {
    console.log("🔵 Register Request:", req.body);

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashed
    });

    await user.save();
    console.log("🟢 User saved in DB:", user);

    sendToken(user, res);

  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ⭐ LOGIN
router.post('/login', [
  body('email').isEmail().withMessage("Valid email required"),
  body('password').notEmpty().withMessage("Password required")
], async (req, res) => {

  const { email, password } = req.body;

  try {
    console.log("🟣 Login Request:", email);

    const user = await User.findOne({ email });

    console.log("🔍 User found:", user);

    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Password match:", isMatch);

    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    sendToken(user, res);

  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

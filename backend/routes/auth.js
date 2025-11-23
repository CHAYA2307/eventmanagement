const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
// JWT_SECRET is loaded from process.env because dotenv.config() runs in server.js
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to send token + user info
function sendToken(user, res) {
  try {
    // We use user._id here, which is available on the user object
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("JWT generation error:", err);
    return res.status(500).json({ msg: "Server error generating token" });
  }
}

// ===================== REGISTER =====================
router.post('/register', [
  body('name').notEmpty().withMessage("Name is required"),
  body('email').isEmail().withMessage("Valid email is required"),
  body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors during signup:", errors.array());
    return res.status(400).json({ msg: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;

  try {
    console.log("Register Request:", req.body);

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashed, role: "user" });
    await user.save();

    console.log("User saved:", user);
    sendToken(user, res);
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ===================== LOGIN =====================
router.post('/login', [
  body('email').isEmail().withMessage("Valid email required"),
  body('password').notEmpty().withMessage("Password required")
], async (req, res) => {
  try {
    console.log("========== LOGIN ATTEMPT ==========");

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors during login:", errors.array());
      return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not set!");
      return res.status(500).json({ msg: "Server misconfiguration" });
    }

    // 1. Use .select('+password') to explicitly load the password hash.
    const user = await User.findOne({ email }).select('+password').lean(); // Added .lean() for performance and clean object retrieval
    
    console.log("User found:", user ? 'User exists' : 'User not found');

    if (!user) {
      console.log("Login failed: user not found");
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // 2. DEFENSIVE CHECK: Ensure the password field is present and is a string.
    if (!user.password || typeof user.password !== 'string') {
        console.error("Login Crash Prevention: User found, but user.password is invalid or missing the hash. Database corruption suspected.");
        return res.status(400).json({ msg: "Invalid email or password" }); 
    }

    // Compare password. 
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Login failed: incorrect password");
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    console.log("Login successful, preparing token...");
    
    // Remove the password hash before sending the token
    delete user.password;

    sendToken(user, res); // Send the object without the hash

  } catch (err) {
    console.log("\n=============================================");
    console.log("🛑 CRITICAL DEBUG INFO: UNEXPECTED LOGIN CRASH");
    console.log("=============================================");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error("Full Stack Trace:", err); 
    console.log("=============================================\n");
    // Returning a generic error message for security
    res.status(500).json({ msg: "Unexpected server error" }); 
  }
});

module.exports = router;
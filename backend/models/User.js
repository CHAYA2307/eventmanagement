const express = require('express');
const router = express.Router();
const User = require('../models/User'); // your User model
const jwt = require('jsonwebtoken');

// POST /api/user/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email & Password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.password !== password) return res.status(401).json({ message: "Wrong password" });

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

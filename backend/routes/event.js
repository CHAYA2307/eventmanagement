const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const Event = require('../models/Event');

const router = express.Router();

// Create event
router.post('/', [auth, body('title').notEmpty(), body('date').notEmpty()], async (req, res) => {
  const { title, description, location, date, capacity } = req.body;
  try {
    const event = new Event({ title, description, location, date, capacity, createdBy: req.user._id });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get all events
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 1. Load environment variables at the very top.
dotenv.config(); 

// 2. Now import routes
const authRoutes = require('./routes/auth');

const app = express();

// --- Middleware Order ---

// 1. **Immediate Request Logger** (Should always fire if a connection is established)
app.use((req, res, next) => {
    console.log(`[INCOMING] Method: ${req.method}, Path: ${req.path}`);
    next();
});

// 2. **CORS** (Should always be near the top)
app.use(cors());

// 3. **Body Parsers** (Robustly configured for safety)
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 4. **Static Files**
app.use(express.static('public'));

// 5. **API routes** (Router should be hit after middleware processes the body)
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => res.send('Event Management Backend running'));

// Start server after DB connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    console.log(`JWT_SECRET is loaded successfully.`);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
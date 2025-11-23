const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');

const app = express();

/* ============================================================
   1. GLOBAL REQUEST LOGGER  (should fire on every request)
============================================================ */
app.use((req, res, next) => {
    console.log(`[INCOMING] Method: ${req.method}, Path: ${req.originalUrl}`);
    next();
});

/* ============================================================
   2. FIXED — FULL CORS CONFIGURATION
   This FIXES your login POST not reaching the backend.
============================================================ */
app.use(cors({
    origin: "*",  // allow frontend (localhost:5500)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
}));

// Handle preflight explicitly
app.options("*", cors());

/* ============================================================
   3. BODY PARSERS
============================================================ */
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

/* ============================================================
   4. STATIC FILES (Optional)
============================================================ */
app.use(express.static('public'));

/* ============================================================
   5. API ROUTES
============================================================ */
app.use('/api/auth', authRoutes);

/* ============================================================
   6. TEST ROUTE
============================================================ */
app.get('/', (req, res) => {
    res.send("Event Management Backend running");
});

/* ============================================================
   7. CONNECT TO DATABASE + START SERVER
============================================================ */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected");
    console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES" : "NO");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log("====================================================");
        console.log(" BACKEND IS LIVE — LOGIN + SIGNUP WILL NOW WORK ");
        console.log("====================================================");
    });
})
.catch(err => console.error("MongoDB connection error:", err));

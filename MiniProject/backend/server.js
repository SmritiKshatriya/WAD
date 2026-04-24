require('dotenv').config({ override: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection logic
let isDbConnected = false;
let dbConnectionError = null;

const connectDB = async () => {
    if (isDbConnected) return;
    try {
        let uri = process.env.MONGODB_URI;
        if (!uri || uri.includes('localhost')) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error("MONGODB_URI is not set or is localhost in Vercel Environment Variables!");
            }
            const { MongoMemoryServer } = require('mongodb-memory-server');
            console.log('Starting in-memory database...');
            const memoryServer = await MongoMemoryServer.create();
            uri = memoryServer.getUri();
        }
        await mongoose.connect(uri);
        isDbConnected = true;
        console.log(`Connected to MongoDB`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        dbConnectionError = err.message || err.toString();
    }
};

// We connect when the file is loaded
connectDB();

// Middleware to prevent confusing timeout errors if DB is dead
app.use((req, res, next) => {
    if (!isDbConnected && dbConnectionError) {
        return res.status(500).json({ 
            message: "Database Connection Failed", 
            error: "Vercel failed to reach MongoDB: " + dbConnectionError 
        });
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);

// Only listen locally, Vercel will process it directly
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;

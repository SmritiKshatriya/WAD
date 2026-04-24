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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);

const { MongoMemoryServer } = require('mongodb-memory-server');

// Database connection logic
let isDbConnected = false;
const connectDB = async () => {
    if (isDbConnected) return;
    try {
        let uri = process.env.MONGODB_URI;
        if (!uri || uri.includes('localhost')) {
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
    }
};

// We connect when the file is loaded
connectDB();

// Only listen locally, Vercel will process it directly
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;

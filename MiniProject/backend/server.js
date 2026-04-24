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
const startServer = async () => {
    try {
        let uri = process.env.MONGODB_URI;
        let memoryServer = null;

        // If the URL is localhost or fails, we will dynamically start an in-memory MongoDB!
        if (!uri || uri.includes('localhost')) {
            console.log('No local MongoDB detected. Starting in-memory database for testing...');
            memoryServer = await MongoMemoryServer.create();
            uri = memoryServer.getUri();
        }

        await mongoose.connect(uri);
        console.log(`Connected to MongoDB at: ${uri}`);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();

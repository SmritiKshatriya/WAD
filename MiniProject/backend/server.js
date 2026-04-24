require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topics');

const app = express();
const PORT = process.env.PORT || 5000;
const globalMongoose = global;

if (!globalMongoose.__mongooseCache) {
    globalMongoose.__mongooseCache = {
        connection: null,
        promise: null,
        error: null
    };
}

const mongooseCache = globalMongoose.__mongooseCache;

// Middleware
app.use(cors());
app.use(express.json());

const normalizeMongoUri = (rawUri) => {
    if (!rawUri) return rawUri;

    let uri = rawUri.trim().replace(/^['"]|['"]$/g, '');

    // Users often paste an HTTP-style "/api" suffix by mistake.
    if ((uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) && uri.includes('/api')) {
        try {
            const parsed = new URL(uri);
            const pathParts = parsed.pathname.split('/').filter(Boolean);

            if (pathParts.length > 1) {
                parsed.pathname = `/${pathParts[0]}`;
                uri = parsed.toString();
            }
        } catch (error) {
            uri = uri.replace(/\/api(\?.*)?$/, '$1');
        }
    }

    return uri;
};

const connectDB = async () => {
    if (mongooseCache.connection || mongoose.connection.readyState === 1) {
        mongooseCache.connection = mongoose.connection;
        mongooseCache.error = null;
        return mongooseCache.connection;
    }

    if (mongooseCache.promise) {
        return mongooseCache.promise;
    }

    try {
        let uri = normalizeMongoUri(process.env.MONGODB_URI || process.env.MONGO_URI);
        if (!uri || uri.includes('localhost')) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error("MONGODB_URI is not set or is localhost in Vercel Environment Variables!");
            }
            const { MongoMemoryServer } = require('mongodb-memory-server');
            console.log('Starting in-memory database...');
            const memoryServer = await MongoMemoryServer.create();
            uri = memoryServer.getUri();
        }

        mongooseCache.promise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000
        });

        mongooseCache.connection = await mongooseCache.promise;
        mongooseCache.error = null;
        console.log('Connected to MongoDB');
        return mongooseCache.connection;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        mongooseCache.error = err.message || err.toString();
        throw err;
    } finally {
        mongooseCache.promise = null;
    }
};

// Ensure DB is ready before handling API requests in serverless mode
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        const detailedError = mongooseCache.error || error.message || 'Unknown error';
        return res.status(500).json({ 
            message: "Database Connection Failed: Vercel failed to reach MongoDB: " + detailedError, 
            error: "Vercel failed to reach MongoDB: " + detailedError
        });
    }
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

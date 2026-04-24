const express = require('express');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Helper function to check if subject belongs to user
const checkSubjectOwnership = async (subjectId, userId) => {
    const subject = await Subject.findOne({ _id: subjectId, userId });
    return !!subject;
};

// @route GET /api/topics/:subjectId
router.get('/:subjectId', async (req, res) => {
    const { subjectId } = req.params;

    try {
        const isOwner = await checkSubjectOwnership(subjectId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized for this subject' });
        }

        const topics = await Topic.find({ subjectId }).sort({ deadline: 1, createdAt: -1 });
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route POST /api/topics
router.post('/', async (req, res) => {
    const { subjectId, topicName, description, status, deadline } = req.body;
    
    if (!subjectId || !topicName) {
        return res.status(400).json({ message: 'Subject ID and Topic name are required' });
    }

    try {
        const isOwner = await checkSubjectOwnership(subjectId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized for this subject' });
        }

        const topic = await Topic.create({
            subjectId,
            topicName,
            description,
            status: status || 'Not Started',
            deadline
        });
        
        res.status(201).json(topic);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route PUT /api/topics/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { topicName, description, status, deadline } = req.body;

    try {
        const topic = await Topic.findById(id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const isOwner = await checkSubjectOwnership(topic.subjectId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized for this topic' });
        }

        topic.topicName = topicName || topic.topicName;
        if (description !== undefined) topic.description = description;
        if (status) topic.status = status;
        if (deadline !== undefined) topic.deadline = deadline;

        const updatedTopic = await topic.save();
        
        res.json(updatedTopic);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route DELETE /api/topics/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const topic = await Topic.findById(id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const isOwner = await checkSubjectOwnership(topic.subjectId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized for this topic' });
        }

        await topic.deleteOne();
        
        res.json({ message: 'Topic removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/topics/user/all
// Gets all topics for all subjects belonging to the currently authenticated user
router.get('/user/all', async (req, res) => {
    try {
        const subjects = await Subject.find({ userId: req.user.id });
        const subjectIds = subjects.map(s => s._id);
        
        const topics = await Topic.find({ subjectId: { $in: subjectIds } })
            .populate({ path: 'subjectId', select: 'subjectName' })
            .sort({ deadline: 1 });
            
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

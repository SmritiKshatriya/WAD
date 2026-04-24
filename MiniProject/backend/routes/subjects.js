const express = require('express');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route GET /api/subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find({ userId: req.user.id }).sort({ createdAt: -1 });
        
        // Also fetch topics for these subjects to calculate progress
        const subjectIds = subjects.map(s => s._id);
        const topics = await Topic.find({ subjectId: { $in: subjectIds } });
        
        const subjectsWithProgress = subjects.map(subject => {
            const subjectTopics = topics.filter(t => t.subjectId.toString() === subject._id.toString());
            const totalTopics = subjectTopics.length;
            const completedTopics = subjectTopics.filter(t => t.status === 'Completed').length;
            const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
            
            return {
                ...subject.toObject(),
                totalTopics,
                completedTopics,
                progress
            };
        });
        
        res.json(subjectsWithProgress);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route POST /api/subjects
router.post('/', async (req, res) => {
    const { subjectName } = req.body;
    
    if (!subjectName) {
        return res.status(400).json({ message: 'Subject name is required' });
    }

    try {
        const subject = await Subject.create({
            userId: req.user.id,
            subjectName
        });
        
        res.status(201).json({
            ...subject.toObject(),
            totalTopics: 0,
            completedTopics: 0,
            progress: 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route PUT /api/subjects/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { subjectName } = req.body;

    try {
        const subject = await Subject.findOne({ _id: id, userId: req.user.id });

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        subject.subjectName = subjectName || subject.subjectName;
        const updatedSubject = await subject.save();
        
        res.json(updatedSubject);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route DELETE /api/subjects/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const subject = await Subject.findOne({ _id: id, userId: req.user.id });

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        await subject.deleteOne();
        
        // Also delete all topics associated with this subject
        await Topic.deleteMany({ subjectId: id });
        
        res.json({ message: 'Subject removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

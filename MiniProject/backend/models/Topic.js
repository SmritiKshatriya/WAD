const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    topicName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    },
    deadline: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema);

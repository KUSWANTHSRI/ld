const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        default: ''
    },
    trainingId: {
        type: String,
        required: true
    },
    trainingTitle: {
        type: String,
        default: ''
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Prevent duplicate enrollments
enrollmentSchema.index({ userId: 1, trainingId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

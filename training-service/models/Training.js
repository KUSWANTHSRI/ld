const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    trainerId: {
        type: String, // User ID from User Service
        required: true
    },
    trainerName: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    capacity: {
        type: Number,
        default: 30
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    category: {
        type: String,
        default: 'General'
    }
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    enrollmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    trainingId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    present: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Prevent duplicate attendance entries for same user on same day
attendanceSchema.index({ userId: 1, trainingId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

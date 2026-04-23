const Enrollment = require('../models/Enrollment');
const Joi = require('joi');

const enrollSchema = Joi.object({
    userId: Joi.string().required(),
    userName: Joi.string().allow(''),
    trainingId: Joi.string().required(),
    trainingTitle: Joi.string().allow('')
});

exports.enroll = async (req, res, next) => {
    try {
        const { error, value } = enrollSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const existing = await Enrollment.findOne({ userId: value.userId, trainingId: value.trainingId });
        if (existing) return res.status(400).json({ message: 'User is already enrolled in this training' });

        const enrollment = new Enrollment(value);
        await enrollment.save();
        res.status(201).json(enrollment);
    } catch (error) { next(error); }
};

exports.getAllEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find().sort({ enrolledAt: -1 });
        res.json(enrollments);
    } catch (error) { next(error); }
};

exports.getEnrollmentsByTraining = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ trainingId: req.params.trainingId });
        res.json(enrollments);
    } catch (error) { next(error); }
};

exports.getMyEnrollments = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID missing' });
        const enrollments = await Enrollment.find({ userId }).sort({ enrolledAt: -1 });
        res.json(enrollments);
    } catch (error) { next(error); }
};

exports.updateProgress = async (req, res, next) => {
    try {
        const { progress } = req.body;
        if (progress === undefined || progress < 0 || progress > 100) {
            return res.status(400).json({ message: 'Progress must be between 0 and 100' });
        }
        const update = { progress };
        if (progress === 100) {
            update.completed = true;
            update.completedAt = new Date();
        }
        const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
        res.json(enrollment);
    } catch (error) { next(error); }
};

exports.unenroll = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
        res.json({ message: 'Enrollment removed successfully' });
    } catch (error) { next(error); }
};

exports.getEnrollmentStats = async (req, res, next) => {
    try {
        const total = await Enrollment.countDocuments();
        const completed = await Enrollment.countDocuments({ completed: true });
        const inProgress = await Enrollment.countDocuments({ completed: false });
        // Average progress
        const aggResult = await Enrollment.aggregate([
            { $group: { _id: null, avgProgress: { $avg: '$progress' } } }
        ]);
        const avgProgress = aggResult.length > 0 ? Math.round(aggResult[0].avgProgress) : 0;
        res.json({ total, completed, inProgress, avgProgress });
    } catch (error) { next(error); }
};

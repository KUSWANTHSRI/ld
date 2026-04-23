const Training = require('../models/Training');
const Joi = require('joi');

const trainingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    trainerId: Joi.string().required(),
    trainerName: Joi.string().allow(''),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    capacity: Joi.number().integer().min(1).default(30),
    status: Joi.string().valid('Upcoming', 'Ongoing', 'Completed', 'Cancelled').default('Upcoming'),
    category: Joi.string().allow('').default('General')
});

exports.getAllTrainings = async (req, res, next) => {
    try {
        const { status, category } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        const trainings = await Training.find(filter).sort({ startDate: 1 });
        res.json(trainings);
    } catch (error) { next(error); }
};

exports.getTrainingsByTrainer = async (req, res, next) => {
    try {
        const trainings = await Training.find({ trainerId: req.params.trainerId });
        res.json(trainings);
    } catch (error) { next(error); }
};

exports.getTrainingById = async (req, res, next) => {
    try {
        const training = await Training.findById(req.params.id);
        if (!training) return res.status(404).json({ message: 'Training not found' });
        res.json(training);
    } catch (error) { next(error); }
};

exports.createTraining = async (req, res, next) => {
    try {
        const { error, value } = trainingSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const training = new Training(value);
        await training.save();
        res.status(201).json(training);
    } catch (error) { next(error); }
};

exports.updateTraining = async (req, res, next) => {
    try {
        const training = await Training.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!training) return res.status(404).json({ message: 'Training not found' });
        res.json(training);
    } catch (error) { next(error); }
};

exports.deleteTraining = async (req, res, next) => {
    try {
        const training = await Training.findByIdAndDelete(req.params.id);
        if (!training) return res.status(404).json({ message: 'Training not found' });
        res.json({ message: 'Training deleted successfully' });
    } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
    try {
        const total = await Training.countDocuments();
        const upcoming = await Training.countDocuments({ status: 'Upcoming' });
        const ongoing = await Training.countDocuments({ status: 'Ongoing' });
        const completed = await Training.countDocuments({ status: 'Completed' });
        res.json({ total, upcoming, ongoing, completed });
    } catch (error) { next(error); }
};

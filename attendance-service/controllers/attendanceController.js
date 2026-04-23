const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');

exports.markAttendance = async (req, res, next) => {
    try {
        const { userId, trainingId, date, present, notes } = req.body;
        if (!userId || !trainingId || !date) {
            return res.status(400).json({ message: 'userId, trainingId, and date are required' });
        }

        const enrollment = await Enrollment.findOne({ userId, trainingId });
        if (!enrollment) return res.status(404).json({ message: 'User is not enrolled in this training' });

        // Normalize date to start of day for consistency
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOneAndUpdate(
            { userId, trainingId, date: normalizedDate },
            { enrollmentId: enrollment._id, userId, trainingId, date: normalizedDate, present, notes },
            { upsert: true, new: true }
        );

        res.status(200).json(attendance);
    } catch (error) { next(error); }
};

exports.getAttendanceByTraining = async (req, res, next) => {
    try {
        const { date } = req.query;
        const filter = { trainingId: req.params.trainingId };
        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            filter.date = { $gte: d, $lt: next };
        }
        const records = await Attendance.find(filter).sort({ date: -1 });
        res.json(records);
    } catch (error) { next(error); }
};

exports.getMyAttendance = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID missing' });
        const records = await Attendance.find({ userId }).sort({ date: -1 });
        res.json(records);
    } catch (error) { next(error); }
};

exports.getAttendanceReport = async (req, res, next) => {
    try {
        const { trainingId } = req.params;
        const records = await Attendance.find({ trainingId });
        const totalDays = [...new Set(records.map(r => r.date.toDateString()))].length;
        const enrollments = await Enrollment.find({ trainingId });

        const report = enrollments.map(enrollment => {
            const userRecords = records.filter(r => r.userId === enrollment.userId);
            const daysPresent = userRecords.filter(r => r.present).length;
            const attendancePercent = totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : 0;
            return {
                userId: enrollment.userId,
                userName: enrollment.userName,
                progress: enrollment.progress,
                completed: enrollment.completed,
                daysPresent,
                totalDays,
                attendancePercent
            };
        });

        res.json({ trainingId, totalDays, report });
    } catch (error) { next(error); }
};

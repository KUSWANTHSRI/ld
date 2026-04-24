const User = require('../models/User');

// Internal Create (Called by Auth Service during registration)
exports.createInternalUser = async (req, res, next) => {
    try {
        console.log('createInternalUser called with:', req.body);
        const { name, email, role, department } = req.body;
        const newUser = new User({ name, email, role, department });
        const saved = await newUser.save();
        console.log('User created:', saved._id);
        res.status(201).json(saved);
    } catch (error) {
        console.error('createInternalUser error:', error.message);
        next(error);
    }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await User.find(filter).select('-__v');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const total = await User.countDocuments();
        const employees = await User.countDocuments({ role: 'Employee' });
        const trainers = await User.countDocuments({ role: 'Trainer' });
        const admins = await User.countDocuments({ role: 'Admin' });
        res.json({ total, employees, trainers, admins });
    } catch (error) {
        next(error);
    }
};

// Get current user profile based on gateway header
exports.getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID missing in headers' });
        const user = await User.findById(userId).select('-__v');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-__v');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Update User
exports.updateUser = async (req, res, next) => {
    try {
        const { name, department, role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, department, role },
            { new: true, runValidators: true }
        ).select('-__v');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

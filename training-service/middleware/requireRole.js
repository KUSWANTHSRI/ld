const requireRole = (roles) => (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (!userRole) return res.status(401).json({ message: 'Role information missing' });
    if (!roles.includes(userRole)) return res.status(403).json({ message: 'Access forbidden: Insufficient privileges' });
    next();
};
module.exports = requireRole;

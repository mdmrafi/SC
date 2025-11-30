import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({success: false, message: 'No token provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({success: false, message: 'Invalid token'});
    }
};

export const verifyClerkUser = (req, res, next) => {
    // This middleware is for Clerk authentication
    // Clerk automatically provides the user in req.auth
    if (!req.auth?.userId) {
        return res.status(401).json({success: false, message: 'Unauthorized'});
    }
    req.userId = req.auth.userId;
    next();
};

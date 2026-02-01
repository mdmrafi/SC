import jwt from 'jsonwebtoken';
import { getAuth } from '@clerk/express';

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export const verifyClerkUser = async (req, res, next) => {
    try {
        const auth = getAuth(req);

        // Debug logging
        console.log('🔒 Auth Check:', {
            path: req.path,
            method: req.method,
            authObject: auth,
            headers: {
                authorization: req.headers.authorization ? 'Present (Bearer ...)' : 'Missing',
                contentType: req.headers['content-type']
            }
        });

        if (!auth?.userId) {
            console.error('❌ Clerk auth failed: No userId found in request', {
                path: req.path,
                authObjectKey: Object.keys(auth || {}),
                hasAuth: !!auth,
                token: req.headers.authorization?.substring(0, 20) + '...'
            });
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - No valid session found'
            });
        }

        req.userId = auth.userId;
        return next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(401).json({ success: false, message: 'Authentication error' });
    }
};

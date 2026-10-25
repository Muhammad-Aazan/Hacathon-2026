import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Check cookie first, then authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied. No authentication token found.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'hcm_lite_super_secret_jwt_key_2024');
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }
};

export const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient administrative privileges.' });
        }
        next();
    };
};

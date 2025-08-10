const jwt = require('jsonwebtoken');
const JWTvalidate = require('../helper/auth-helper');

function authMiddleware(requiredRoles = null) {
    return async (req, res, next) => {
        try {
            const token = req?.headers?.authorization?.split(' ')[1];           
            if (!token) {
                return res.status(401).json({ status: false, message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const { isValid, credentials } = await JWTvalidate(decoded);

            if (!isValid) {
                return res.status(401).json({ status: false, message: 'Invalid token or user not found' });
            }

            // Role check only if `requiredRoles` is given
            if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
                if (!requiredRoles.includes(credentials.scope)) {
                    return res.status(403).json({ status: false, message: 'Access denied: insufficient role' });
                }
            }

            req.auth = credentials;
            next();
        } catch (error) {
            console.error("Auth middleware error:", error);
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
    };
}

module.exports = authMiddleware;

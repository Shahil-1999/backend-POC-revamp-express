const JWTvalidate = require("../helper/auth-helper");
const { verifyAccessToken } = require("../service/token-service");
function authMiddleware(requiredRoles = []) {
  return async (req, res, next) => {
    try {
      // 1️ Get Authorization header
        const token = req?.headers?.authorization?.split(' ')[1];  
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "No token provided"
            });
        }

      // Verify access token signature + expiry
      let decoded;
      
      try {
        
        decoded = verifyAccessToken(token);
      } catch (err) {
        return res.status(401).json({
          status: false,
          message: "Invalid or expired access token"
        });
      }

      // Validate user from DB
      const { isValid, credentials } = await JWTvalidate(decoded);

      if (!isValid) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized user"
        });
      }

        // Role check only if `requiredRoles` is given
        if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
            if (!requiredRoles.includes(credentials.scope)) {
                return res.status(403).json({ status: false, message: 'Access denied: insufficient role' });
            }
        }

      // Attach user to request
      req.auth = credentials;

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({
        status: false,
        message: "Authentication failed"
      });
    }
  };
}

module.exports = authMiddleware;
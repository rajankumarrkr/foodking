import { verifyToken } from '../utils/jwtHelper.js';
import Admin from '../models/Admin.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Get admin from token (exclude password)
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - admin not found'
        });
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized - token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - no token provided'
    });
  }
};

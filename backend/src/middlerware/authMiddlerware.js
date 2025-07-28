import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/auth/UserModel.js';
import { logInfo } from '../log/log.js';

export const roles = () => {
    const roles = {
        admin: ["admin"],
        user: ["user"]
    };
    return roles;
};

export const protect = asyncHandler(async (req, res, next) => {
    try {
        // const token = req.cookies.token;

        const authHeader = req.headers['authorization'];
        logInfo("[protect]authHeader:", authHeader);
        const emailHeader = req.headers['x-user-email'];
        logInfo("[protect]emailHeader:", emailHeader);
        // Extract token from "Bearer <token>" format
        const token = authHeader && authHeader.split(' ')[1];
        logInfo("[protect]token:", token);

        if (!token || !emailHeader) {
            return res.status(401).json({ message: "Unauthorized, please login" });
        }

        // Verify the token and extract user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const decodedUser = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
        };

        if (emailHeader != decodedUser.email) {
            return res.status(400).json({ message: "Unauthorized, Invalid user request" });
        }

        // get user information to the request object
        const user = await User.findById(decoded.id).select('-password');

        // check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // set user details in the response object
        req.user = user;
        // proceed to the next middleware or route handler
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized, please login" });
    }
});

// Middleware for role-based access
export const authorizeRoles = (...allowedRoles) => asyncHandler(async (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
    next();
});

// admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        // if user is admin, proceed to the next middleware or route handler
        next();
        return;
    } else {
        // if not admin, sent 403 Forbidden response -> terminate the request
        res.status(403).json({ message: "Access denied, admin only" });
    }
});

export const creatorMiddleware = asyncHandler(async (req, res, next) => {
    if ((req.user && req.user.role === 'creator') || (req.user && req.user.role === 'admin')) {
        // if user is creator, proceed to the next middleware or route handler
        next();
        return;
    } else {
        // if not creator, sent 403 Forbidden response -> terminate the request
        res.status(403).json({ message: "Access denied, creator or admin only" });
    }
});

// verify user middleware
export const verifyUserMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        // if user is verified, proceed to the next middleware or route handler
        next();
        return;
    } else {
        // if not verified, sent 403 Forbidden response -> terminate the request
        res.status(403).json({ message: "Please verified your email address" });
    }
});
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/auth/UserModel.js';

export const protect = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized, please login" });
        }

        // Verify the token and extract user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
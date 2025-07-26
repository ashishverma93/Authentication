import express from 'express';
import { forgotPassword, getUser, loginUser, logoutUser, registerUser, updateUser, userLoginStatus, verifyEmail, verifyUser } from '../controllers/auth/userController.js';
import { adminMiddleware, creatorMiddleware, protect } from '../middlerware/authMiddlerware.js';
import { deleteUser, getAllUsers } from '../controllers/auth/adminController.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);

// admin routes can be added here if needed in the future
router.delete("/admin/user/:id", protect, adminMiddleware, deleteUser);

// get all users
router.get("/admin/users", protect, creatorMiddleware, getAllUsers);

//login status
router.get("/login-status", userLoginStatus);

//verify user
router.post("/verify-email", protect, verifyEmail);

// verify user email --> email verification
router.post("/verify-user/:verificationToken", verifyUser);

// forgot password
router.post("/forgot-password", forgotPassword);

export default router;
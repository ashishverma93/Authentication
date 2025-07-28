import express from 'express';
import { changePassword, forgotPassword, getUser, resetPassword, updateUser, userLoginStatus, verifyEmail, verifyUser } from '../controllers/user/userController.js';
import { adminMiddleware, authorizeRoles, creatorMiddleware, protect } from '../middlerware/authMiddlerware.js';
import { deleteUser, getAllUsers } from '../controllers/admin/adminController.js';
import { loginUser, logoutUser, registerUser } from '../controllers/auth/authController.js';
import { validateUpdateUserRequest, validateUserIdPathVariable } from '../validator/requestValidator.js';

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser);
//login status
router.get("/login-status", userLoginStatus);

// verify user email --> email verification
router.post("/verify-user/:verificationToken", verifyUser);

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.post("/reset-password/:resetPasswordToken", resetPassword);

// protected routes
router.get("/user/:id", validateUserIdPathVariable, protect, authorizeRoles('admin', 'user'), getUser);

router.patch("/user/:id", validateUpdateUserRequest, protect, authorizeRoles('user'), updateUser);

// admin routes can be added here if needed in the future
router.delete("/admin/user/:id", protect, adminMiddleware, deleteUser);

// get all users
router.get("/admin/users", protect, creatorMiddleware, getAllUsers);

//verify user
router.post("/verify-email/:id", validateUserIdPathVariable, protect, verifyEmail);

// change password - user must be logged-in
router.patch("/update-password", protect, changePassword);

export default router;
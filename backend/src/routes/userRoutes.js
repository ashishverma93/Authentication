import express from 'express';
import { getUser, loginUser, logoutUser, registerUser, updateUser } from '../controllers/auth/userController.js';
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

export default router;
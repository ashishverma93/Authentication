import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';

export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        // attempt to find and delete the user by id
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // delete user
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }

});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find(); // exclude password from the response
    if (users) {
        res.status(200).json(users);
    } else {
        res.status(404).json({ message: "No users found" });
    }
});
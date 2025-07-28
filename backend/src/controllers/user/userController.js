import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Token from '../../models/auth/Token.js';
import crypto from 'crypto';
import hashToken from '../../helpers/hashToken.js';
import { sendEmail, sendEmailHandlebars } from '../../helpers/sendEmail.js';

import { getUserDetail, updateUser, verifyEmailProcess, verifyUserEmailProcess } from '../../services/userService.js';


// get user
export const getUser = asyncHandler(async (req, res) => {
    // get userId from request param
    const id = req.params.id;
    // get user detail from the token ----> exclude password
    // const user = await getUserDetail(req.user._id).select('-password');
    const user = await getUserDetail(id);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

export const updateUser = asyncHandler(async (req, res) => {
    // get user details from the token ----> protect middleware
    const updatedUser = await updateUser(req.user._id, req.body);
    if (updatedUser) {
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            bio: updatedUser.bio,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

export const userLoginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    console.log("token:", token);
    if (!token) {
        // return res.status(401).json({ message: "Not authorized, please login!" });
        return res.status(401).json(false);
    }
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
        return res.status(200).json(true);
    } else {
        return res.status(401).json(false);
    }
});

//email verification
export const verifyEmail = asyncHandler(async (req, res) => {
    const result = await verifyEmailProcess(req.user._id);

    if (!result) {
        return res.status(404).json({ message: "User not found" });
    }

    // if user is verified
    if (result) {
        return res.status(400).json({ message: "User is already verified" });
    }

    if (result === "Success") {
        return res.status(200).json({ message: "Verification email sent successfully" });
    } else {
        return res.status(500).json({ message: "Error sending verification email" });
    }
});

//verifyUser
export const verifyUser = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    console.log("Verification Token:", verificationToken);
    const result = await verifyUserEmailProcess(verificationToken);
    if (!result) {
        return res.status(400).json({ message: "Invalid verification token" });
    }

    if (result === "expired") {
        return res
            .status(400)
            .json({ message: "Invalid or expired verification token" });
    }

    if (result) {
        return res.status(400).json({ message: "User is already verified" });
    }

    return res.status(200).json({ message: "User verified successfully" });

});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // validation
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // see if the reset token exists
    let token = await Token.findOne({ userId: user._id });
    // if token exists --> delete the token
    if (token) {
        await token.deleteOne();
    }

    // create new reset token ---> expires in 1 hour
    const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;
    // hash the reset token
    const hashedToken = hashToken(passwordResetToken);

    // save the token in the database
    await new Token({
        userId: user._id,
        passwordResetToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000, // 60 minutes
    }).save();

    // create reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

    // send email to user with the reset link
    const subject = "Password Reset - Authentication App";
    const send_to = user.email;
    // const reply_to = "noreply@gmail.com"
    const template = "forgotPassword";
    const send_from = process.env.USER_EMAIL;
    const name = user.name;
    const url = resetLink;

    try {
        await sendEmail(subject, send_to, send_from, template, name, url);
        // await sendEmailHandlebars(subject, send_to, reply_to, send_from,template, name, url);
        res.status(200).json({ message: "Password reset email sent successfully" });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return res.status(500).json({ message: "Error sending password reset email" });
    }
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { resetPasswordToken } = req.params;
    console.log("Reset Password Token:", resetPasswordToken);
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    // hash the reset token
    const hashedToken = hashToken(resetPasswordToken);

    // check if token exists and has not expired
    const userToken = await Token.findOne({
        passwordResetToken: hashedToken,
        expiresAt: { $gt: Date.now() },
    });
    console.log("User Token:", userToken);
    if (!userToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // find user with the user id in the token
    const user = await User.findById(userToken.userId);

    // update user password
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
});

// change password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    console.log("Current User ID:", req.user);
    console.log("Current Password:", currentPassword);
    console.log("New Password:", newPassword);

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
    }
    // find user by id
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isMatched) {
        return res.status(400).json({ message: "Current password is incorrect" });
    } else {
        // update user password
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    }
});
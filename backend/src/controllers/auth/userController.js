import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Token from '../../models/auth/Token.js';
import crypto from 'crypto';
import hashToken from '../../helpers/hashToken.js';
import { sendEmail, sendEmailHandlebars } from '../../helpers/sendEmail.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    // check password length
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    console.log("Existing User:", existingUser);
    if (existingUser) {
        // Bad request
        return res.status(400).json({ message: "User already exists" });
    }

    // create user
    const user = await User.create({
        name,
        email,
        password,
    });

    // generate token with user id
    const token = generateToken(user._id);

    // send back the user data and token in the response to the client
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "strict",
        secure: true // set to true if using https
    });


    if (user) {
        const { _id, name, email, photo, bio, role, isVerified } = user;
        // send response 201
        res.status(201).json({
            _id,
            name,
            email,
            role,
            photo,
            bio,
            isVerified,
            token,
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
});

// user login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
        return res.status(400).json({ message: "All the fields are required" });
    }

    // check if user exists
    const userExists = await User.findOne({ email });
    console.log("userExists:", userExists);
    if (!userExists) {
        return res.status(400).json({ message: "User does not exist" });
    };

    // check if password is correct
    const isMatch = await bcrypt.compare(password, userExists.password);
    console.log("isMatch:", isMatch);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // generate token with user id
    const token = generateToken(userExists._id);

    if (userExists && isMatch) {
        const { _id, name, email, photo, bio, role, isVerified } = userExists;
        // send back the user data and token in the response to the client
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: "strict",
            secure: true // set to true if using https
        });

        // send back the user and token in the response to the client
        res.status(200).json({
            _id,
            name,
            email,
            role,
            photo,
            bio,
            isVerified,
            token,
        });
    } else {
        res.status(400).json({ message: "Invalid email or password" });
    }
});

// logout user
export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
});

// get user
export const getUser = asyncHandler(async (req, res) => {
    // get user detail from the token ----> exclude password
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

export const updateUser = asyncHandler(async (req, res) => {
    // get user details from the token ----> protect middleware
    const user = await User.findById(req.user._id);
    if (user) {
        // user properties to update
        const { name, photo, bio } = req.body;

        // update user properties
        user.name = name || user.name;
        user.photo = photo || user.photo;
        user.bio = bio || user.bio;

        const updatedUser = await user.save();

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
    if (!token) {
        return res.status(401).json({ message: "Not authorized, please login!" });
    }
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
        return res.status(401).json({ message: true });
    } else {
        return res.status(401).json({ message: false });
    }
});

//email verification
export const verifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // if user is verified
    if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
    }

    let token = await Token.findOne({ userId: user._id });

    // if token exists --> delete the token
    if (token) {
        await token.deleteOne();
    }

    // create a verification token using the Token model ---> crypto
    const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

    // hash the token

    const hashedToken = await hashToken(verificationToken);

    await new Token({
        userId: user._id,
        verificationToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }).save();

    // create verification link
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // send email to user with the verification link
    const subject = "Email Verification - Authentication App";
    const send_to = user.email;
    // const reply_to = "noreply@gmail.com"
    const template = "emailVerification";
    const send_from = process.env.USER_EMAIL;
    const name = user.name;
    const url = verificationLink;

    try {
        await sendEmail(subject, send_to, send_from, template, name, url);
        // await sendEmailHandlebars(subject, send_to, reply_to, send_from,template, name, url);
        res.status(200).json({ message: "Verification email sent successfully" });
    } catch (error) {
        console.error("Error sending verification email:", error);
        return res.status(500).json({ message: "Error sending verification email" });
    }

});

//verifyUser
export const verifyUser = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    console.log("Verification Token:", verificationToken);
    if (!verificationToken) {
        return res.status(400).json({ message: "Invalid verification token" });
    }

    // hash the verification token
    const hashedToken = hashToken(verificationToken);
    console.log("hashedToken:", hashedToken);

    // find the user by verification token
    const userToken = await Token.findOne({
        verificationToken: hashedToken,
        // check if the token has not expired
        expiresAt: { $gt: Date.now() },
    });

    console.log("userToken:", userToken);

    if (!userToken) {
        return res
            .status(400)
            .json({ message: "Invalid or expired verification token" });
    }

    // find user with the user id in the token
    const user = await User.findById(userToken.userId);
    if(user.isVerified) {
        return res.status(400).json({ message: "User is already verified" });
    };

    // update user to verified
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "User verified successfully" });

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
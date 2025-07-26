import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcryptjs';

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
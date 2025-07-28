import hashToken from "../helpers/hashToken";
import { logInfo } from "../log/log";
import Token from "../models/auth/Token";
import User from "../models/auth/UserModel";

export const getUserDetail = async (userId) => {

    if (userId === null || userId === undefined) {
        logInfo("userId is null or undefined.");
        return null;
    }

    if (typeof userId === 'string') {
        if (userId.trim().length === 0) {
            logInfo("userId is an empty string or contains only spaces.");
            return null;
        }
    }
    return await User.findById(userId).select('-password');
};

export const updateUser = async (userId, user) => {
    const existingUser = await User.findById(userId);
    if (existingUser) {
        // user properties to update
        const { name, photo, bio } = user;

        // update user properties
        existingUser.name = name || user.name;
        existingUser.photo = photo || user.photo;
        existingUser.bio = bio || user.bio;

        return await existingUser.save();

    } else {
        return null;
    }
};

export const verifyEmailProcess = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        return null;
    }

    // if user is verified
    if (user.isVerified) {
        return true;
    }

    let token = await Token.findOne({ userId: user._id });

    // if token exists --> delete the token
    if (token) {
        await token.deleteOne();
    }

    // create a verification token using the Token model ---> crypto
    const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

    // hash the token

    const hashedToken = hashToken(verificationToken);

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
        return "Success";
    } catch (error) {
        console.error("Error sending verification email:", error);
        return error.message;
    }
}

export const verifyUserEmailProcess = async (verificationToken) => {
    if (!verificationToken) {
        return false;
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
        return "expired";
    }

    // find user with the user id in the token
    const user = await User.findById(userToken.userId);
    if (user.isVerified) {
        return true;
    };

    // update user to verified
    user.isVerified = true;
    await user.save();
    return "Success";
}
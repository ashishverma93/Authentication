import asyncHandler from "express-async-handler";
import { logInfo } from "../log/log.js";

export const validateUserIdPathVariable = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;

    if (userId === null || userId === undefined) {
        logInfo("userId is null or undefined.");
        return res.status(400).send("userId is null.");
    }

    if (typeof userId === 'string') {
        if (userId.trim().length === 0) {
            logInfo("userId is an empty string or contains only spaces.");
            return res.status(400).send("userId is an empty string or contains only spaces.");
        }
    }
    logInfo("Validation passed.", userId);
    next();
});

export const validateUpdateUserRequest = asyncHandler(async (req, res, next) => {
    const { name, photo, bio } = req.body;
    const userId = req.params.id;

    if (userId === null || userId === undefined) {
        logInfo("userId is null or undefined.");
        return res.status(400).send("userId is null.");
    }

    if (typeof userId === 'string') {
        if (userId.trim().length === 0) {
            logInfo("userId is an empty string or contains only spaces.");
            return res.status(400).send("userId is an empty string or contains only spaces.");
        }
    } else {
        return res.status(400).send("type of userId parameter is incorrect.");
    }

    if (name === null || name === undefined) {
        logInfo("name is null or undefined.");
        return res.status(400).send("name is null.");
    }

    if (typeof name === 'string') {
        if (name.trim().length === 0) {
            logInfo("name is an empty string or contains only spaces.");
            return res.status(400).send("name is an empty string or contains only spaces.");
        }
    } else {
        return res.status(400).send("type of name parameter is incorrect.");
    }

    if (photo === null || photo === undefined) {
        logInfo("photo is null or undefined.");
        return res.status(400).send("photo is null.");
    }

    if (typeof photo === 'string') {
        if (photo.trim().length === 0) {
            logInfo("photo is an empty string or contains only spaces.");
            return res.status(400).send("photo is an empty string or contains only spaces.");
        }
    } else {
        return res.status(400).send("type of photo parameter is incorrect.");
    }

    if (bio === null || bio === undefined) {
        logInfo("bio is null or undefined.");
        return res.status(400).send("bio is null.");
    }

    if (typeof bio === 'string') {
        if (bio.trim().length === 0) {
            logInfo("bio is an empty string or contains only spaces.");
            return res.status(400).send("bio is an empty string or contains only spaces.");
        }
    } else {
        return res.status(400).send("type of bio parameter is incorrect.");
    }
    logInfo("Validation passed.", { name, photo, bio });
    next();
});
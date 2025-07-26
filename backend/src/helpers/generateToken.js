import e from 'express';
import jwt from 'jsonwebtoken';

// use userId to generate a token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

export default generateToken;
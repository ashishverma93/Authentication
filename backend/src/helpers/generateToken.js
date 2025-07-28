import jwt from 'jsonwebtoken';

// use userId to generate a token
const generateToken = (id, name, email, role) => {
    return jwt.sign({ id, name, email, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

export default generateToken;
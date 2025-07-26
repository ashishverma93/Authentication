import crypto from 'node:crypto';

const hashToken = (token) => {
    // create hash object using sha256 algorithm
    return crypto.createHash("sha256").update(token.toString()).digest("hex");
}

export default hashToken;
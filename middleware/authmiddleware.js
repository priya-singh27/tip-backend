const { unauthorizedResponse,badRequestResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');
const secretkey = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
    const authToken = req.header('x-auth-token');

    if (!authToken) {
        return unauthorizedResponse(res, 'Authorization token is required');
    }
    try {
        const decoded = jwt.verify(authToken, secretkey);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return badRequestResponse(res, 'Invalid authorization token');
    }
}

module.exports = authMiddleware;
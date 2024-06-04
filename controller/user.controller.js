const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304
} = require('../utils/response');
const { pool } = require('../utils/dbConfig');
const joi_schema = require('../joi_validation/user/index');
const { findUserByEmail } = require('../repository/user.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.secret_key;

const login = async (req, res) => {
    try {
        const { error } = joi_schema.loginUser.validate(req.body);
        if (error) {
            return badRequestResponse(res,'Invalid data entered')
        }
        const [err, user] = await findUserByEmail(req.body.email);
        if (err) {
            if (err.code == 404) return badRequestResponse(res, 'User not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }

        const isValid = await bcrypt.compare(req.body.password, user.password_hash);
        if (!isValid) return badRequestResponse(res, 'Incorrect email or password');

        const token = jwt.sign({ userId: user.user_id }, secretKey);

        res.setHeader('x-auth-token', token);
        return successResponse(res, null, 'Successfully logged in');
        
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res,'Internal server error')
    }
}

const addUser = async (req, res) => {
    
    try {
        const { error } = joi_schema.createUser.validate(req.body);
        if (error) {
            return badRequestResponse(res,'Invalid data entered')
        }

        //check if user already exists
        const [err, user] = await findUserByEmail(req.body.email);
        console.log(err.code);
        if (err) {
            if (err.code === 404) {
                const password = await bcrypt.hash(req.body.password, 10);
                await pool.promise().query(
                    'INSERT INTO users (username, email, password_hash) VALUES (?,?,?)',[req.body.username,req.body.email,password]
                );
                return successResponse(res, 'User registered successfully');
            } else {
                return serverErrorResponse(res, 'Internal server error');
            }

        } else {
            return badRequestResponse(res, 'User already registered');
        }
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}


module.exports = {
    addUser,
    login
}



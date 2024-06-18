const {pool}=require('../utils/dbConfig')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { successResponse, badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } = require('../utils/response')
const joi_schema = require('../joi_validation/owner/index')
const { findOwnerByEmail } = require('../repository/owner.repository');
const secretKey = process.env.SECRET_KEY;


const loginOwner = async (req, res) => {
    try {
        const { err } = joi_schema.loginOwner.validate(req.body);
        if (err) {
            return badRequestResponse(res, 'Invaid data entered');
        }
        const [error, owner] = await findOwnerByEmail(req.body.email);
        if (error) {
            if (error.code == 404) return notFoundResponse(res, 'Owner not found');
            if (error.code == 500) return serverErrorResponse(res, 'Internal server error');
        }

        const isValid = await bcrypt.compare(req.body.password, owner.password_hash);
        if (!isValid) return unauthorizedResponse(res, 'Incorrect password entered');

        const token = jwt.sign({ _id: owner.owner_id, email: owner.email }, secretKey);

        res.setHeader('x-auth-token', token);
        return successResponse(res, 'Successfully logged in');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const registerOwner = async (req, res) => {
    try {
        
        const { err } = joi_schema.createOwner.validate(req.body);
        if (err) {
            return badRequestResponse(res, 'Invalid data returned');
        }

        const [error, owner] = await findOwnerByEmail(req.body.email);
        if (error) {
            if (error.code == 404) {
                const salt = await bcrypt.genSalt(12);
                const password = await bcrypt.hash(req.body.password, salt);

                const [newOwner] = await pool.promise().query(
                    'INSERT INTO owners (username,email,password_hash) VALUES (?,?,?)',
                    [req.body.username,req.body.email,password]  
                );

                return successResponse(res, 'Successfully registered');

            } else {
                return serverErrorResponse(res, 'Internal server error');
            }

            
        }

        else {
            return badRequestResponse(res, 'Already registered');
        }

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

module.exports = {
    registerOwner,
    loginOwner
}
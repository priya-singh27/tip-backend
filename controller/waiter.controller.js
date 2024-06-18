const { badRequestResponse, serverErrorResponse, successResponse, notFoundResponse,unauthorizedResponse } = require('../utils/response');
const { pool } = require('../utils/dbConfig');
const joi_schema = require('../joi_validation/waiter/index');
const { findWaiterByEmail } = require('../repository/waiter.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const loginWaiter = async (req, res) => {
    try {
        const { error } = joi_schema.loginWaiter.validate(req.body);
        if (error) {
            console.log(error);
            return badRequestResponse(res, 'Invalid data entered');
        }

        const [err, waiter] = await findWaiterByEmail(req.body.email);
        
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Waiter not found');
            if (err.code == 500) return serverErrorResponse(res, 'here Internal server error');
        }

        const isValid = await bcrypt.compare( req.body.password, waiter.password_hash);//waiter is an object returned
        
        if (!isValid) return unauthorizedResponse(res, 'Incorrect password entered');

        const token = jwt.sign({ id: waiter.waiter_id }, secretKey);
        res.setHeader('x-auth-token', token);

        return successResponse(res, null,'Successfully logged in');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const registerWaiter = async (req, res) => {
    const connection = await pool.promise().getConnection();
    try {
        
        await connection.beginTransaction();

        const { error } = joi_schema.createWaiter.validate(req.body);
        if (error) {
            return badRequestResponse(res,'Invalid data entered')
        }

        //check if user already exists
        const [err, user] = await findWaiterByEmail(req.body.email);
        
        if (err) {
            if (err.code === 404) {
                const password = await bcrypt.hash(req.body.password, 10);
                const [newWaiter]= await connection.query(
                    'INSERT INTO waiters (username, email, password_hash) VALUES (?,?,?)',[req.body.username,req.body.email,password]
                );
                try {
                    await connection.query(
                        'INSERT INTO wallets (balance,belongs_to,type) VALUES (?,?,?)',
                      [0.00,newWaiter.insertId,'waiter']  
                    );
                } catch (walletErr) {
                    await connection.rollback();
                    console.log(walletErr);
                    return serverErrorResponse(res, 'Internal server error');
                }

                await connection.commit();
                return successResponse(res, 'Waiter registered successfully');
            } else {
                await connection.rollback();
                return serverErrorResponse(res, 'Internal server error');
            }

        } else {
            await connection.rollback();
            return badRequestResponse(res, 'Waiter already registered');
        }

    } catch (err) {
        await connection.rollback();
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    } finally {
        connection.release();
    }       
}

module.exports = {
    registerWaiter,
    loginWaiter
}
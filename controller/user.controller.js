const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304,
    unauthorizedResponse
} = require('../utils/response');
const { pool } = require('../utils/dbConfig');
const joi_schema = require('../joi_validation/user/index');
const { findUserByEmail, findUserById } = require('../repository/user.repository');
const { findUserInWallet,findWaiterInWallet } = require('../repository/wallet.repository');
const { getTransactions} = require('../repository/transaction.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const getTransactionHistory = async (req,res) => {
    try {
        const userId = req.user._id;

        const [err1, userInWallets] = await findUserInWallet(userId, 'user');
        if (err1) {
            if (err1.code == 404) return notFoundResponse(res, 'user not found');
            if (err1.code == 500) return serverErrorResponse(res, 'Internal server error');
        }

        const userWalletId = userInWallets.wallet_id;

        const [err, transactions] = await getTransactions(userWalletId);

        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'No transactions found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        
        return successResponse(res,transactions,'All transactions sent')
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const getBalance = async (req, res) => {
    try {
        const id = req.user._id;
        if (!id) {
            return notFoundResponse(res, 'Invalid token');
        }

        const [err, wallet] = await findUserInWallet(id, 'user');
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'User not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        const balance = wallet.balance;
        return successResponse(res, balance, 'Balance updated');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const getUser = async (req, res) => {
    try {
        const id = req.user._id;
        if (!id) {
            return notFoundResponse(res, 'Invalid token');
        }

        const [err, user] = await findUserById(id);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'User not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal serevr error');
        }

        return successResponse(res, user, 'User data retrieved successfully');
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const loginUser = async (req, res) => {
    try {
        // console.log(req.body.email);
        const { error } = joi_schema.loginUser.validate(req.body);
        if (error) {
            console.log(error);
            return badRequestResponse(res, 'Invalid data entered');
        }

        const [err, user] = await findUserByEmail(req.body.email);
        if (err) {
            if (err.code == 404) return badRequestResponse(res, 'User not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }

        const isValid = await bcrypt.compare(req.body.password, user.password_hash);
        if (!isValid) return unauthorizedResponse(res, 'Incorrect password entered');

        const token = jwt.sign({ _id: user.user_id,email:user.email }, secretKey);

        res.setHeader('x-auth-token', token);
        
        return successResponse(res,user.username,'Successfully logged in');
        
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res,'Internal server error')
    }
}

const registerUser = async (req, res) => {
    const connection = await pool.promise().getConnection();
    
    try {
        await connection.beginTransaction();

        const { error } = joi_schema.createUser.validate(req.body);
        if (error) {
            return badRequestResponse(res,'Invalid data entered')
        }

        //check if user already exists
        const [err, user] = await findUserByEmail(req.body.email);

        
        if (err) {

            if (err.code === 404) {
                const salt = await bcrypt.genSalt(12);
                const password = await bcrypt.hash(req.body.password, salt);
                
                const [newUser] = await connection.query(
                    'INSERT INTO users (username, email, password_hash) VALUES (?,?,?)',
                    [req.body.username, req.body.email, password]
                );

                
                await connection.query(
                    'INSERT INTO Wallets (balance, belongs_to,type) VALUES (?,?,?)',
                    [0.00, newUser.insertId,'user']
                );
                
                await connection.commit();
                return successResponse(res, 'User registered successfully');
                
            }
            else {
                await connection.rollback();
                return serverErrorResponse(res, 'Internal server error');
            }

        } else {
            await connection.rollback();
            return badRequestResponse(res, 'User already registered');
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
    registerUser,
    loginUser,
    getBalance,
    getUser,
    getTransactionHistory
}



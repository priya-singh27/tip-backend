const { badRequestResponse, serverErrorResponse, successResponse, notFoundResponse,unauthorizedResponse } = require('../utils/response');
const { pool } = require('../utils/dbConfig');
const joi_schema = require('../joi_validation/waiter/index');
const { findWaiterByEmail } = require('../repository/waiter.repository');
const { getAllWaitersOfRestaurant,isFirstReq,getAllRequests} = require('../repository/restaurant_waiters.repository');
const { findRestaurantByUniqueIdAndName,getRestaurantByUniqueId, findRestaurantById } = require('../repository/restaurant.repository')
const {findWaiterInWallet } = require('../repository/wallet.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const allRequestsOfWaiter = async (req, res) => {
    try {
        const waiterId = req.user._id;
        if (!waiterId) return notFoundResponse(res, 'Invalid token');

        const [err, requests] = await getAllRequests(waiterId);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Waiter not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        const request_list = await Promise.all(requests.map(
            async (ele) => {
                const [err, restaurant] = await findRestaurantById(ele.restaurant_id);
                if (err) return notFoundResponse(res, 'Restaurant not found');
                return {
                    restaurant_name: restaurant.name,
                    status: ele.status
                }
            }
        ));
        return successResponse(res, request_list, 'All requests are sent');
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

        const [err, wallet] = await findWaiterInWallet(id, 'waiter');
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Waiter not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        const balance = wallet.balance;
        return successResponse(res, balance, 'Balance updated');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const getWaitersOfRestaurant = async (req, res) => {
    try {
        const restaurant_id = req.params.id;
        const [err, waiters] = await getAllWaitersOfRestaurant(restaurant_id);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        
        return successResponse(res, waiters, 'List of waiters  has been sent');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const sendRequest = async (req, res) => {
    try {
        const { error } = joi_schema.requestRestaurant.validate(req.body);
        if (error) {
            return badRequestResponse(res, 'Invalid data entered');
        }

        const waiter_id = req.user._id;
        if (!waiter_id) return badRequestResponse(res, 'Invalid token');

        const [err1, isRestaurant] = await findRestaurantByUniqueIdAndName(req.body.uniqueId,req.body.restaurantName);
        if (err1) {
            if (err1.code == 404) return notFoundResponse(res, 'Restaurant not found');
            if (err1.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        const [err2, restaurant_id] = await getRestaurantByUniqueId(req.body.uniqueId);
        if (err2) {
            if (err1.code == 404) return notFoundResponse(res, 'Restaurant not found');
            if (err1.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        
        const [err3, request] = await isFirstReq(restaurant_id, waiter_id);
        if (request) {
            return badRequestResponse(res, 'Already sent');
        }
        
        if (err3.code == 500) {
            return serverErrorResponse(res, 'Internal server error');
        }

        //send request
        const myReq = await pool.promise().query('INSERT INTO restaurant_waiters (restaurant_id,waiter_id,status) VALUES (?, ?, "pending")', [restaurant_id, waiter_id]);
        return successResponse(res, myReq,'Request sent successfully');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}


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

        const token = jwt.sign({ _id: waiter.waiter_id ,email:waiter.email}, secretKey);
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
    loginWaiter,
    sendRequest,
    getWaitersOfRestaurant,
    getBalance,
   allRequestsOfWaiter
}
const {pool}=require('../utils/dbConfig')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { successResponse, badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } = require('../utils/response')
const joi_schema = require('../joi_validation/owner/index');
const {findWaiterById } = require('../repository/waiter.repository');
const { findOwnerByEmail} = require('../repository/owner.repository');
const { doesRestaurantBelong ,getAllRestaurantOfOwner} = require('../repository/restaurant.repository');
const {isRequestPresent,isWaiterAlreadyApproved,getWaitersByStatus} = require('../repository/restaurant_waiters.repository');
const secretKey = process.env.SECRET_KEY;

const getAllRestaurant = async (req, res) => {
    try {
        const owner_id = req.user._id;
        const [err, restaurants] = await getAllRestaurantOfOwner(owner_id);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Restaurant not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internak server error');
        }
        return successResponse(res, restaurants, 'All restaurants have been sent');
    }catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}
const getPendingWaiter = async (req, res) => {
    try {
        const owner_id = req.user._id;

        const restaurant_id = req.params.id;
        if (!restaurant_id) return badRequestResponse(res, 'restaurant id not given');
        const [err, waiters] = await getWaitersByStatus(restaurant_id, 'pending');

        if (err) {
            if (err.code == 404) return successResponse(res, [],'No waiters request is pending');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        let waiter_details = await Promise.all(waiters.map(async ele => {
            const [err, waiter] = await findWaiterById(ele.waiter_id);
            if (err) {
                return null; 
            }
            return waiter;
        }));
        
        return successResponse(res, waiter_details, 'List of pending waiters are sent');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const getAcceptedWaiter = async (req, res) => {
    try {
        const owner_id = req.user._id;

        const restaurant_id = req.params.id;
        if (!restaurant_id) return successResponse(res, [],'restaurant id not given');
        const [err, waiters] = await getWaitersByStatus(restaurant_id, 'approved');
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'No waiters are approved yet');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        let waiter_details = await Promise.all(waiters.map(async ele => {
            const [err, waiter] = await findWaiterById(ele.waiter_id);
            if (err) {
                return null; 
            }
            return waiter;
        }));
        
        return successResponse(res, waiter_details, 'List of pending waiters are sent');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const addWaiter = async (req, res) => {
    try {
        const owner_id = req.user._id;
        const restaurant_id = req.query.restaurant_id;
        const waiter_id = req.query.waiter_id;
        if (!restaurant_id || !waiter_id) return badRequestResponse(res, 'Either restaurant id or waiter id is not given');

        const [err, restaurant] = await doesRestaurantBelong(restaurant_id, owner_id);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Restaurant does not belong to this owner');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }

        const [e, waiter] = await findWaiterById(waiter_id);
        if (e) {
            if (e.code == 404) return notFoundResponse(res, 'Waiter not found');
            if (e.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        const [error, isWaiter] = await isWaiterAlreadyApproved(restaurant_id, waiter_id);
        if (isWaiter) return badRequestResponse(res, 'Waiter is already approved');
        
        await pool.promise().query('INSERT INTO restaurant_waiters (restaurant_id,waiter_id,status) VALUES (?,?,"approved")', [restaurant_id, waiter_id]);
        
        return successResponse(res, 'Waiter added successfully');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

const acceptWaiter = async (req, res) => {
    try {
        const owner_id = req.user._id;
        const waiterId = req.query.waiter_id;
        const restaurantId = req.query.restaurant_id;
        if (!restaurantId || !waiterId) return badRequestResponse(res, 'Either restaurant id or waiter id is not given');

        const [e, restaurant] = await doesRestaurantBelong(restaurantId, owner_id);
        if (e) {
            if (e.code == 404) return notFoundResponse(res, 'Owner does not own this');
            if (e.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        const [err, request] = await isRequestPresent(restaurantId, waiterId);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'Request not found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        
        await pool.promise().query('UPDATE restaurant_waiters SET status=? WHERE waiter_id=? AND restaurant_id=?', ["approved", waiterId,restaurantId]);

        return successResponse(res, 'Your request has been approved');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

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
        return successResponse(res, owner.username,'Successfully logged in');

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
    loginOwner,
    acceptWaiter,
    addWaiter,
    getAcceptedWaiter,
    getPendingWaiter,
    getAllRestaurant
}
const { pool } = require('../utils/dbConfig');

async function getWaitersByStatus(restaurantId,status) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurant_waiters WHERE restaurant_id=? AND status=?', [restaurantId,status]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'restaurant not found'
            }
            return [errObj, null];
        }
        return [null, rows];

    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}


async function getAllRequests(waiterId) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurant_waiters WHERE waiter_id=?', [waiterId]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'restaurant not found'
            }
            return [errObj, null];
        }
        return [null, rows];
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

async function isWaiterAlreadyApproved(restaurantId,waiterId) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurant_waiters WHERE restaurant_id=? AND waiter_id =? AND status="approved"', [restaurantId, waiterId]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'restaurant not found'
            }
            return [errObj, null];
        }
        return [null, rows[0]];
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

async function isRequestPresent(restaurantId,waiterId) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurant_waiters WHERE restaurant_id=? AND waiter_id =? AND status="pending"', [restaurantId, waiterId]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'restaurant not found'
            }
            return [errObj, null];
        }
        return [null, rows[0]];
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

async function getAllWaitersOfRestaurant(restaurant_id) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurant_waiters WHERE restaurant_id=? AND status="approved"', [restaurant_id]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'restaurant not found'
            }
            return [errObj, null];
        }
        const waiterPromises = rows.map(async element => {
            const waiterId = element.waiter_id;
            const [waiterRows] = await pool.promise().query('SELECT * FROM waiters WHERE waiter_id =?', [waiterId]);
            
            if (waiterRows.length === 0) {
                throw { code: 404, message: 'Waiter not found' };
            }
            
            return waiterRows[0];
        });
        
        // Await all waiter data to be resolved
        const waiters = await Promise.all(waiterPromises);
        
        return [null, waiters];

    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

async function isFirstReq(restaurantId,waiterId) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurant_waiters WHERE restaurant_id=? AND waiter_id=?', [restaurantId, waiterId]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'No request found'
            }
            return [errObj, null];
        }
        return [null, rows[0]];
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

module.exports = {
    getAllWaitersOfRestaurant,
    isFirstReq,
    isRequestPresent,
    isWaiterAlreadyApproved,
    getAllRequests,
    getWaitersByStatus,

}
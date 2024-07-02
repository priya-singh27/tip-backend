const {pool } = require('../utils/dbConfig');

async function getAllRestaurantOfOwner(ownerId){
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurants WHERE belongs_to=?',[ownerId]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'No restaurants found'
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

async function getRestaurantByNameAndOwnerId(name,ownerId) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurants WHERE belongs_to=? AND name=? ', [ownerId,name]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Restaurant not found'
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

async function getRestaurantByUniqueId(uniqueId) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurants WHERE unique_id=? ', [uniqueId]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Restaurant not found'
            }
            return [errObj, null];
        }
        return [null, rows[0].restaurant_id];
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

async function getAllRestaurants() {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurants');
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'No restaurants found'
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

async function doesRestaurantBelong(restaurant_id,owner_id) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurants WHERE restaurant_id=? AND belongs_to=?', [restaurant_id, owner_id]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Restaurant not found'
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

async function findRestaurantByUniqueIdAndName(uniqueId,restaurantName) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurants WHERE unique_id=? AND name=?', [uniqueId,restaurantName]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Restaurant not found'
            }
            return [errObj, false];
        }
        return [null, true];
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, false];
        
   }
}

async function findRestaurantById(id) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM restaurants WHERE restaurant_id=?', [id]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Restaurant not found'
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
    findRestaurantById,
    doesRestaurantBelong,
    getAllRestaurants,
    findRestaurantByUniqueIdAndName,
    getRestaurantByUniqueId,
    getRestaurantByNameAndOwnerId,
    getAllRestaurantOfOwner
}
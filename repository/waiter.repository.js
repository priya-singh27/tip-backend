const { pool } = require('../utils/dbConfig');



async function findWaiterById(id) {
    try {
        const [rows] = await pool.promise().query('SELECT waiter_id,username,email FROM waiters WHERE waiter_id=?', [id]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Waiter not found'
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

async function findWaiterByEmail(email) {
    try {
        const [rows] = await pool.promise().query('SELECT waiter_id,username,email FROM waiters WHERE email=?', [email]);
        if (rows.length==0) {
            let errObj = {
                code: 404,
                message:'Waiter not found'
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
    findWaiterByEmail,
    findWaiterById,
    
}
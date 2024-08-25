const { pool } = require('../utils/dbConfig');

async function getTransactions(userId) {
    try {
        const [rows] = await pool.promise().query('SELECT from_id,to_id ,amount ,transaction_type ,transaction_time FROM transactions WHERE from_id=? OR to_id=?', [userId,userId]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'No transaction history found'
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

module.exports = {
    getTransactions
}
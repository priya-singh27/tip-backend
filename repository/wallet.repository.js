const { pool } = require('../utils/dbConfig');


async function findWaiterInWallet(id,type) {
    try {
        const [waiters] = await pool.promise().query('SELECT * FROM waiters WHERE waiter_id=?', [id]);

        if (waiters.length!=0) {
            const [rows] = await pool.promise().query('SELECT * FROM wallets WHERE belongs_to=? AND type=?', [id,type]);
            if (rows.length == 0) {
                let errObj = {
                    code: 404,
                    message:'Waiter not found'
                }
                return [errObj, null];
            }
            return [null, rows[0]];
        } else {
            let errObj = {
                code: 404,
                message:'Waiter not found'
            }
            return [errObj, null];
        }
    } catch (err) {
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

async function findUserInWallet(id,type) {
    try {
        const [users] = await pool.promise().query('SELECT * FROM users WHERE user_id=?', [id]);

        if (users.length!=0) {
            const [rows] = await pool.promise().query('SELECT * FROM wallets WHERE belongs_to=? AND type=?', [id,type]);
            if (rows.length == 0) {
                let errObj = {
                    code: 404,
                    message:'User not found'
                }
                return [errObj, null];
            }
            return [null, rows[0]];
        }else {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj, null];
        }
    } catch (err) {
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

module.exports = {
    findUserInWallet,
    findWaiterInWallet
}
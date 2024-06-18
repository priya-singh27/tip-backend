const { pool } = require('../utils/dbConfig');

async function findUserInWallet(id,type) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM wallets WHERE belongs_to=? AND type=?', [id,type]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj, null];
        }
        return [null, rows[0]];
    } catch (err) {
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

module.exports = {
    findUserInWallet
}
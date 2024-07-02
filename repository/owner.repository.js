const { pool } = require('../utils/dbConfig');


async function findOwnerById(id) {
    try {
        const [rows] = await pool.promise().query('SELECT owner_id,username,email FROM owners WHERE owner_id=?', [id]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Owner not found'
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

async function findOwnerByEmail(email) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM owners WHERE email=?', [email]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'Owner not found'
            }
            return [errObj, null];
        }

        return[null, rows[0]];
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
    findOwnerByEmail,
    findOwnerById
}
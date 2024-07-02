const mysql = require('mysql2');
const { pool } = require('../utils/dbConfig');

async function findUserById(userId) {
    try {
        const [rows] = await pool.promise().query('SELECT user_id,username,email FROM users WHERE user_id=?', [userId]);
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

async function findUserByEmail(email) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM users WHERE email=?', [email]);
        if (rows.length==0) {
            let errObj = {
                code: 404,
                message:'user not found'
            }
            return [errObj, null];
        }
        return [null, rows[0]];//row is an array of objects we are returning the first element of that array
        
    } catch (err) {
        console.log(err);
        let errObj = {
            code: 500,
            message: 'Internal server error'
        };
        return [errObj, null];
    }
}

module.exports = {
    findUserByEmail,
    findUserById
}
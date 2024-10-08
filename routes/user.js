const { registerUser,loginUser ,getBalance,getUser,getTransactionHistory} = require('../controller/user.controller');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getUser', authMiddleware, getUser);
router.get('/get-balance', authMiddleware, getBalance);
router.get('/get-transaction-history', authMiddleware, getTransactionHistory);


module.exports = router;
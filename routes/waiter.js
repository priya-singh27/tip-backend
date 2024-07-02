const authMiddleware = require('../middleware/authmiddleware');
const { registerWaiter, loginWaiter, sendRequest,getWaitersOfRestaurant,getBalance,allRequestsOfWaiter } = require('../controller/waiter.controller');
const express = require('express');
const router = express.Router();

router.post('/register', registerWaiter);
router.post('/login', loginWaiter);
//all-restaurants
router.post('/request', authMiddleware, sendRequest);
router.get('/all-waiters/:id', authMiddleware, getWaitersOfRestaurant);
router.get('/get-balance', authMiddleware, getBalance);
router.get('/get-request', authMiddleware, allRequestsOfWaiter);

module.exports = router;
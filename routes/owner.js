const { registerOwner, loginOwner, acceptWaiter ,addWaiter,getAcceptedWaiter,getPendingWaiter,getAllRestaurant} = require('../controller/owner.controller');
const authMiddleware = require('../middleware/authmiddleware');
const express = require('express');
const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginOwner);
router.post('/accept-waiter', authMiddleware, acceptWaiter);
router.post('/addwaiter', authMiddleware, addWaiter);
router.get('/accepted-waiter/:id', authMiddleware, getAcceptedWaiter);
router.get('/pending-waiter/:id', authMiddleware, getPendingWaiter);
router.get('/my-restaurants', authMiddleware,getAllRestaurant);



module.exports = router;


const express = require('express');
const router = express.Router();
const { registerRestaurant,getRestaurants } = require('../controller/restaurant.controller');
const authMiddleware = require('../middleware/authmiddleware');

router.post('/register', authMiddleware, registerRestaurant);
router.get('/all-restaurants', authMiddleware, getRestaurants);

module.exports = router;
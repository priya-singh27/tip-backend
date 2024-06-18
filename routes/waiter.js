const {registerWaiter,loginWaiter } = require('../controller/waiter.controller');
const express = require('express');
const router = express.Router();

router.post('/register', registerWaiter);
router.post('/login', loginWaiter);

module.exports = router;
const { registerOwner,loginOwner} = require('../controller/owner.controller');
const express = require('express');
const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginOwner);


module.exports = router;


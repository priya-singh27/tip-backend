const { addUser,login } = require('../controller/user.controller');
const express = require('express');
const router = express.Router();


router.post('/register', addUser);
router.post('/login', login);


module.exports = router;
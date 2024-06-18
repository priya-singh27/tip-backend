const joi = require('joi');

module.exports = joi.object().keys({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password:joi.string().min(8).max(25).required()
});
const joi = require('joi');

module.exports = joi.object().keys({
    restaurantName: joi.string().required(),
    uniqueId: joi.number().min(6).required()
});
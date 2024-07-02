const joi = require('joi');

// Custom validation rule for business hours
const businessHoursRegex = /^([A-Z]{3})-([A-Z]{3}):\s*\d{1,2}(am|pm)-\d{1,2}(am|pm)\s*$/i;

module.exports = joi.object().keys({
    name:joi.string().required(),
    email:joi.string().email().required(),
    phone:joi.string().min(10),
    business_hours: joi.string().regex(businessHoursRegex).required()
    
});
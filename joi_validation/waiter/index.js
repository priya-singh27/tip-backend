const requestRestaurant = require('./requestRestaurant');

module.exports = {
    createWaiter: require('./register.joi'),
    loginWaiter: require('./login.joi'),
    requestRestaurant:require('./requestRestaurant'),
} 
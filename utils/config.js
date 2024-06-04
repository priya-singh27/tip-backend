const secretKey = process.env.secret_key;

module.exports = function () {
    if (!secretKey) {
        console.log('FATAL ERROR:jwtPrivateKey is not defined.');
        process.exit(1);
    }
}
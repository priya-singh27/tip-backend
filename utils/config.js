const secretKey = process.env.SECRET_KEY;
const privateKey = process.env.PRIVATE_KEY;

module.exports = function () {
    if (!secretKey ) {//|| !privateKey
        console.log('FATAL ERROR:jwtPrivateKey is not defined.');
        process.exit(1);
    }
}
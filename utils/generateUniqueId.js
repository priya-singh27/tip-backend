const generateId =function() {
    const uniqueNumber = Math.floor(Math.random() * 900000) + 100000;
    return uniqueNumber;
}

module.exports = {
    generateId
}
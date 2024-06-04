require('./utils/config')();
const express = require('express');
const app = express();
app.use(express.json());
const { connectToDB } = require('./utils/dbConfig');

connectToDB();

const user = require('./routes/user');

app.use('/user', user);

const PORT = 3000;
app.listen(PORT, () => {
   console.log(`Listening on port ${PORT}`); 
});


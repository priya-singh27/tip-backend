require('./utils/config')();
const express = require('express');
const app = express();
const { connectToDB } = require('./utils/dbConfig');

connectToDB();

const user = require('./routes/user');
const waiter = require('./routes/waiter');
const payment = require('./routes/payment');
const owner=require('./routes/owner')

// added for stripe signature
app.use(
   express.json({
     verify: (req, res, buf) => {
       req.rawBody = buf;
     },
   })
 );

app.use('/owner', owner);
app.use('/payment', payment);
app.use('/waiter', waiter);
app.use('/user', user);




const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Listening on port ${port}`); 
});


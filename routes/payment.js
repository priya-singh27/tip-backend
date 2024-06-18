const express = require('express');
// const bodyParser = require('body-parser');
const router = express.Router();
const { createPaymentIntent,handleStripeWebhook,walletToWalletTransfer } = require('../controller/stripe.controller');
const authMiddleware = require('../middleware/authmiddleware');

router.post('/tip/:id', authMiddleware, walletToWalletTransfer);
router.post('/create-payment-intent', authMiddleware,createPaymentIntent);//
router.post('/webhook', express.raw({type: 'application/json'}),handleStripeWebhook);

module.exports = router;
const { pool } = require('../utils/dbConfig');
const stripe = require('stripe')('sk_test_51L6zQ2SEudow57FtZudQNAlAbVUmgIAKZcU4Naj2IyEb78cRLym2lHfuAromrcCO9MdKJRWU8xAoxjZSsZRhZa8c008JA1LLZR');
const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304,
    unauthorizedResponse
} = require('../utils/response');
const { findUserByEmail, findUserById } = require('../repository/user.repository');
const { findUserInWallet } = require('../repository/wallet.repository');
const endpointSecret = 'whsec_22933804d2bc95ec8eb08ef9c0c7595bfaa31e2fa2708f3c93a2d86655c4f740';

const walletToWalletTransfer = async (req, res) => {

    if (!req.body.amount || req.body.amount <= 0) {
        return badRequestResponse(res,'Invalid transfer amount');
    }

    const from_id = req.user._id;
    const to_id = req.params.id;

    const connection = await pool.promise().getConnection();
    try {

        await connection.beginTransaction();

        const [err1, user] = await findUserInWallet(from_id,'user');
        if (err1) {
            await connection.rollback();
            if (err1.code == 404) return  notFoundResponse(res, 'Not found');
            if (err1.code == 500) return serverErrorResponse(res, 'Internal server error');
        }

        const [err2, waiter] = await findUserInWallet(to_id,'waiter');
        if (err2) {
            await connection.rollback();
            if (err2.code == 404) return  notFoundResponse(res, 'Not found');
            if (err2.code == 500) return serverErrorResponse(res, 'Internal server error');
        }


        if (user.amount< req.body.amount) {
            await connection.rollback();
            return badRequestResponse(res, 'Insufficient fund');
        }

        await connection.execute('UPDATE wallets SET balance=balance-? WHERE wallet_id=?', [req.body.amount, user.wallet_id]);
        await connection.execute('UPDATE wallets SET balance=balance+? WHERE wallet_id=?', [req.body.amount, waiter.wallet_id]);


        const insertTransactinQuery = `INSERT INTO transactions (from_id,to_id,amount,transaction_type,transaction_time)
                                                            VALUES (?,?,?,'tip',NOW())`;
        
        await connection.execute(insertTransactinQuery, [user.wallet_id, waiter.wallet_id, req.body.amount]);

        await connection.commit();

        return successResponse(res, 'Tip sent successfully');
        
    } catch (err) {
        await connection.rollback();
        console.log(err);
        return serverErrorResponse(res, 'Internal server error');
    } finally {
        connection.release();
    }
}

const handleStripeWebhook = async (req, res) => {
    const connection = await pool.promise().getConnection();
    
    try {
        await connection.beginTransaction();

        console.log("Webhook Started...");
        const sig = req.headers['stripe-signature'];
        let event=req.body;

        try {
            event = stripe.webhooks.constructEvent(
                req['rawBody'],
                sig,
                endpointSecret
            );//req['rawBody']
        } catch (err) {
            await connection.rollback();
            console.log('Internal server error: ',err);
            return badRequestResponse(res, 'Webhook error');
        }

        
        if (event.type==='charge.succeeded') {
            
            const paymentIntent = event.data.object;
            const amountReceived = paymentIntent.amount;
            const userId = paymentIntent.metadata.user_id;

            if (!userId || !amountReceived) {
                await connection.rollback();
                return badRequestResponse(res, 'User id or amount not found');
            }

            const amountInINR = amountReceived / 100;
            
            try {
                

                // Verify if the user wallet exists
                const checkWalletQuery = 'SELECT * FROM wallets WHERE belongs_to = ?';
                const [walletExists] = await connection.execute(checkWalletQuery, [userId]);

                if (walletExists.length === 0) {
                    await connection.rollback();
                    return badRequestResponse(res, 'User wallet does not exist');
                }
                const walletId=walletExists[0].wallet_id;
                //update wallets table
                const updateBalanceQuery = `UPDATE wallets SET balance=balance+? WHERE wallet_id=?`;
                await connection.execute(updateBalanceQuery, [amountInINR,walletId]);

                const insertTransactinQuery = `INSERT INTO transactions 
                                (from_id,to_id,amount,transaction_type,transaction_time)
                                VALUES (NULL ,? ,?,'deposit',NOW())`;
                const [transaction]=await connection.execute(insertTransactinQuery, [walletId, amountInINR]);


                const insertWalletTransactionQuery = `INSERT INTO wallet_transactions (wallet_id,transaction_id) values (? ,?) `;
                await connection.execute(insertWalletTransactionQuery, [walletId,transaction.insertId]);

                await connection.commit();

                return successResponse(res,'Wallet updated')
            } catch (err) {
                await connection.rollback();
                console.log(err);
                return serverErrorResponse(res, 'Internal server error');
            } 
            
        } else if (event.type === 'payment_intent.created') {
            await connection.rollback();
            console.log('Payment intent created:', event.id);
            return successResponse(res, 'Payment intent created');
        }
        else {
            await connection.rollback();
            console.log('Unhandled event type ', event.type);
            return serverErrorResponse(res,'Event received but not completed')
        }
        
    } catch (err) {
        await connection.rollback();
        console.log(err);
        return serverErrorResponse(res,'Internal server error')
    }
    finally {
        connection.release();
    }
}

const createPaymentIntent = async (req, res) => {
    try {
        userEmail = req.user.email;
        userId = req.user._id;

        [err, user] = await findUserByEmail(userEmail);
        if (err) return badRequestResponse(res, 'User not registered');

        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'inr',
            metadata: {
                user_id:userId
            }
        });

        console.log(paymentIntent);

        return successResponse(res, paymentIntent, 'Payment intent created');
        
    } catch (err) {
        console.log('Error creating payment intent: ', err);
        return serverErrorResponse(res, 'Internal server error');
    }
}

// const createPaymentIntent = async (req, res) => {
//     try {
        

//         // const userId = req.user.user_id;

//         const session = await stripe.checkout.sessions.create({
//             success_url: 'https://example.com/success',
//             line_items: [
//                 {
//                   price_data: {
//                     currency: "inr",
//                     unit_amount: req.body.amount*100,
//                     product_data: {
//                         name: "wallet recharge : tip",
//                     },
//                   },
//                   quantity: 1,
//                 },

//             ],
//             metadata: {
//                 user_id: userId, // Add userId to metadata
//             },            
//             mode: 'payment',
//             cancel_url: 'https://example.com/cancel',
//             payment_method_types:['card']
//         });
//         //https://dashboard.stripe.com/payments/pi_3PPkkGSEudow57Ft1sD3zQjE
//         console.log(session);
//         return successResponse(res,session.url,'Payment-intent created')
//     } catch (err) {
//         console.log(err);
//         return serverErrorResponse(res, 'Internal server error');
//     }
// }


module.exports = {
    createPaymentIntent,
    handleStripeWebhook,
    walletToWalletTransfer
}
# TipEase API Documentation

## Overview
TipEase is a platform that facilitates tipping transactions between users, waiters, and restaurant owners. The API provides endpoints for user management, restaurant operations, payment processing, and waiter services.

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
node index.js
```

## Authentication
Most endpoints require authentication using the `authMiddleware`. Include your authentication token in the request header as `x-auth-token`.

## Response Format

All API endpoints return responses in the following consistent format:

```javascript
// Success Response
{
    "code": 200,
    "data": {}, // Response data
    "message": "Success message"
}

// Error Response
{
    "code": 500, // or 400, 404, etc.
    "message": "Error message"
}
```

## API Endpoints

### User Routes
Base path: `/api/user`

| Method | Endpoint | Auth Required | Description | Response Code |
|--------|----------|---------------|-------------|---------------|
| POST | `/register` | No | Register a new user | 200 |
| POST | `/login` | No | User login | 200 |
| GET | `/getUser` | Yes | Get user details | 200 |
| GET | `/get-balance` | Yes | Get user's wallet balance | 200 |
| GET | `/get-transaction-history` | Yes | Get user's transaction history | 200 |

### Waiter Routes
Base path: `/api/waiter`

| Method | Endpoint | Auth Required | Description | Response Code |
|--------|----------|---------------|-------------|---------------|
| POST | `/register` | No | Register a new waiter | 200 |
| POST | `/login` | No | Waiter login | 200 |
| POST | `/request` | Yes | Send request to join restaurant | 200 |
| GET | `/all-waiters/:id` | Yes | Get all waiters of a restaurant | 200 |
| GET | `/get-balance` | Yes | Get waiter's wallet balance | 200 |
| GET | `/get-request` | Yes | Get all requests made by waiter | 200 |
| GET | `/get-transaction-history` | Yes | Get waiter's transaction history | 200 |

### Payment Routes
Base path: `/api/payment`

| Method | Endpoint | Auth Required | Description | Response Code |
|--------|----------|---------------|-------------|---------------|
| POST | `/tip/:id` | Yes | Transfer tip from one wallet to another | 200 |
| POST | `/create-payment-intent` | Yes | Create a Stripe payment intent | 200 |
| POST | `/webhook` | No | Handle Stripe webhook events | 200 |

### Owner Routes
Base path: `/api/owner`

| Method | Endpoint | Auth Required | Description | Response Code |
|--------|----------|---------------|-------------|---------------|
| POST | `/register` | No | Register a new owner | 200 |
| POST | `/login` | No | Owner login | 200 |
| POST | `/accept-waiter` | Yes | Accept a waiter's request | 200 |
| POST | `/addwaiter` | Yes | Add a new waiter | 200 |
| GET | `/accepted-waiter/:id` | Yes | Get list of accepted waiters | 200 |
| GET | `/pending-waiter/:id` | Yes | Get list of pending waiter requests | 200 |
| GET | `/my-restaurants` | Yes | Get all restaurants owned by user | 200 |

### Restaurant Routes
Base path: `/api/restaurant`

| Method | Endpoint | Auth Required | Description | Response Code |
|--------|----------|---------------|-------------|---------------|
| POST | `/register` | Yes | Register a new restaurant | 200 |
| GET | `/all-restaurants` | Yes | Get list of all restaurants | 200 |

## Error Handling

The API implements comprehensive error handling with appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Transaction System

### Wallet Transfers
- Each user and waiter has an associated wallet
- Transfers between wallets are transactional (uses database transactions)
- Insufficient funds will result in a failed transfer
- All transfers are recorded in the transactions table

### Payment Processing
- Uses Stripe for payment processing
- Supports INR currency
- Webhook handling for payment events
- Supports payment intents and charge events
- Transaction records are maintained for all payment operations

## Environment Variables

Create a `.env` file in the root directory with the following:
```
STRIPE_SECRET_KEY=your_stripe_secret_key
ENDPOINT_SECRET=your_stripe_webhook_secret
SECRET_KEY=your_jwt_secret
# Add database configuration
```

## Database Tables
The system uses the following main tables:
- `users`
- `waiters`
- `restaurants`
- `wallets`
- `transactions`
- `restaurant_waiters`
- `wallet_transactions`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# TipEase API Documentation

## Overview
TipEase is a platform that facilitates tipping transactions between users, waiters, and restaurant owners. The API provides endpoints for user management, restaurant operations, payment processing, and waiter services.

## Authentication
Most endpoints require authentication using the `authMiddleware`. Include your authentication token in the request header.

## API Endpoints

### User Routes
Base path: `/api/user`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | User login | No |
| GET | `/getUser` | Get user details | Yes |
| GET | `/get-balance` | Get user's wallet balance | Yes |
| GET | `/get-transaction-history` | Get user's transaction history | Yes |

### Waiter Routes
Base path: `/api/waiter`

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|-----------|
| POST | `/register` | Register a new waiter | No | `{ username: string, email: string, password: string }` | Success message |
| POST | `/login` | Waiter login | No | `{ email: string, password: string }` | Username and JWT token in header |
| POST | `/request` | Send request to join restaurant | Yes | `{ uniqueId: string }` | Success message |
| GET | `/all-waiters/:id` | Get all waiters of a restaurant | Yes | - | List of waiters |
| GET | `/get-balance` | Get waiter's wallet balance | Yes | - | Current balance |
| GET | `/get-request` | Get all requests made by waiter | Yes | - | List of requests with restaurant names and status |
| GET | `/get-transaction-history` | Get waiter's transaction history | Yes | - | List of transactions |

### Payment Routes
Base path: `/api/payment`

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|-----------|
| POST | `/tip/:id` | Transfer tip from one wallet to another | Yes | `{ amount: number }` | Success message |
| POST | `/create-payment-intent` | Create a Stripe payment intent | Yes | `{ amount: number }` | Stripe payment intent details |
| POST | `/webhook` | Handle Stripe webhook events | No | Stripe event payload | Success message |

### Owner Routes
Base path: `/api/owner`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new owner | No |
| POST | `/login` | Owner login | No |
| POST | `/accept-waiter` | Accept a waiter's request | Yes |
| POST | `/addwaiter` | Add a new waiter | Yes |
| GET | `/accepted-waiter/:id` | Get list of accepted waiters | Yes |
| GET | `/pending-waiter/:id` | Get list of pending waiter requests | Yes |
| GET | `/my-restaurants` | Get all restaurants owned by user | Yes |

### Restaurant Routes
Base path: `/api/restaurant`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new restaurant | Yes |
| GET | `/all-restaurants` | Get list of all restaurants | Yes |

## Request & Response Formats

### Authentication Header
```
Authorization: Bearer <your_token>
```

### Success Response Format
```json
{
    "success": true,
    "data": <response_data>,
    "message": "Success message"
}
```

### Error Response Format
```json
{
    "success": false,
    "error": "Error message"
}
```

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

## Database Tables
The system uses the following main tables:
- `users`
- `waiters`
- `restaurants`
- `wallets`
- `transactions`
- `restaurant_waiters`
- `wallet_transactions`

## Error Handling
The API uses standard HTTP status codes and returns detailed error messages:
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Invalid authentication
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side errors

## Setup
1. Install dependencies
2. Configure environment variables:
   - `STRIPE_SECRET_KEY`
   - `ENDPOINT_SECRET`
   - `SECRET_KEY` (for JWT)
3. Set up MySQL database
4. Configure Stripe webhook endpoint
5. Start the server

## Notes
- The Stripe webhook endpoint requires raw body parsing
- All authenticated routes require a valid JWT token
- Restaurant IDs are required in URL parameters for relevant endpoints
- All monetary values are handled in INR
- Database transactions are used for all financial operations to ensure data consistency

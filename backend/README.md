# Real-Time Stock Trading Platform - Backend

Backend API for a real-time stock trading platform with WebSocket support.

## Features

- User Authentication (Register/Login with JWT)
- Real-time Stock Price Updates via WebSocket
- Buy/Sell Stock Orders
- Portfolio Management
- Wallet Management
- Transaction History

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```sql
CREATE DATABASE stock_trading_db;
```

3. Run the database schema:
```bash
psql -U postgres -d stock_trading_db -f schema.sql
```

4. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_trading_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

## Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Trading
- `GET /api/trades` - Get all orders
- `POST /api/trades/buy` - Place buy order
- `POST /api/trades/sell` - Place sell order

### Portfolio
- `GET /api/portfolio` - Get user portfolio

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/add-funds` - Add funds to wallet
- `GET /api/wallet/transactions` - Get transaction history

## WebSocket Connection

Connect to `ws://localhost:5000` for real-time stock price updates.

Messages received:
- `{ type: 'initial', data: [...stocks] }` - Initial stock data
- `{ type: 'update', data: [...stocks] }` - Updated stock prices (every 3 seconds)

## Stock Data Structure

```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 175.50
}
```

## Technologies Used

- Express.js - Web framework
- PostgreSQL - Database
- WebSocket (ws) - Real-time communication
- JWT - Authentication
- bcrypt - Password hashing

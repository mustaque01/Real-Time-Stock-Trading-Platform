const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const portfolioRoutes = require('./routes/portfolio');
const walletRoutes = require('./routes/wallet');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/wallet', walletRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'Real-Time Stock Trading Platform API' });
});

// Stock price simulation
const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.25 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380.75 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.60 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.30 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.90 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 720.45 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 625.80 }
];

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  // Send initial stock data
  ws.send(JSON.stringify({ type: 'initial', data: stocks }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Broadcast stock price updates to all connected clients
function broadcastStockUpdates() {
  stocks.forEach(stock => {
    // Simulate price change (-2% to +2%)
    const change = (Math.random() - 0.5) * 0.04;
    stock.price = parseFloat((stock.price * (1 + change)).toFixed(2));
  });

  const message = JSON.stringify({ type: 'update', data: stocks });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Update stock prices every 3 seconds
setInterval(broadcastStockUpdates, 3000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});

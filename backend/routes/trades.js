const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all orders for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, s.symbol, s.name 
       FROM orders o
       LEFT JOIN stocks s ON o.stock_id = s.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place a buy order
router.post('/buy', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { symbol, quantity, price } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!symbol || !quantity || !price) {
      return res.status(400).json({ error: 'Symbol, quantity, and price are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    const totalCost = quantity * price;

    await client.query('BEGIN');

    // Check wallet balance
    const walletResult = await client.query(
      'SELECT balance FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const balance = parseFloat(walletResult.rows[0].balance);

    if (balance < totalCost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get or create stock
    let stockResult = await client.query(
      'SELECT id FROM stocks WHERE symbol = $1',
      [symbol]
    );

    let stockId;
    if (stockResult.rows.length === 0) {
      const insertStock = await client.query(
        'INSERT INTO stocks (symbol, name) VALUES ($1, $2) RETURNING id',
        [symbol, symbol]
      );
      stockId = insertStock.rows[0].id;
    } else {
      stockId = stockResult.rows[0].id;
    }

    // Deduct from wallet
    await client.query(
      'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
      [totalCost, userId]
    );

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, stock_id, order_type, quantity, price, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, stockId, 'buy', quantity, price, totalCost, 'completed']
    );

    // Update or create portfolio entry
    const portfolioCheck = await client.query(
      'SELECT * FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );

    if (portfolioCheck.rows.length > 0) {
      await client.query(
        `UPDATE portfolio 
         SET quantity = quantity + $1,
             average_price = ((average_price * quantity) + $2) / (quantity + $1)
         WHERE user_id = $3 AND stock_id = $4`,
        [quantity, totalCost, userId, stockId]
      );
    } else {
      await client.query(
        `INSERT INTO portfolio (user_id, stock_id, quantity, average_price)
         VALUES ($1, $2, $3, $4)`,
        [userId, stockId, quantity, price]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Buy order placed successfully',
      order: orderResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Buy order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Place a sell order
router.post('/sell', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { symbol, quantity, price } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!symbol || !quantity || !price) {
      return res.status(400).json({ error: 'Symbol, quantity, and price are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be positive' });
    }

    const totalAmount = quantity * price;

    await client.query('BEGIN');

    // Get stock
    const stockResult = await client.query(
      'SELECT id FROM stocks WHERE symbol = $1',
      [symbol]
    );

    if (stockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stockId = stockResult.rows[0].id;

    // Check portfolio
    const portfolioResult = await client.query(
      'SELECT quantity FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );

    if (portfolioResult.rows.length === 0 || portfolioResult.rows[0].quantity < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient stock quantity' });
    }

    // Add to wallet
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2',
      [totalAmount, userId]
    );

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, stock_id, order_type, quantity, price, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, stockId, 'sell', quantity, price, totalAmount, 'completed']
    );

    // Update portfolio
    const newQuantity = portfolioResult.rows[0].quantity - quantity;
    
    if (newQuantity > 0) {
      await client.query(
        'UPDATE portfolio SET quantity = $1 WHERE user_id = $2 AND stock_id = $3',
        [newQuantity, userId, stockId]
      );
    } else {
      await client.query(
        'DELETE FROM portfolio WHERE user_id = $1 AND stock_id = $2',
        [userId, stockId]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Sell order placed successfully',
      order: orderResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sell order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;

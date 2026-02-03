const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all orders for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT o.*, s.symbol, s.name 
       FROM orders o
       LEFT JOIN stocks s ON o.stock_id = s.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ orders: result });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place a buy order
router.post('/buy', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
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

    await connection.beginTransaction();

    // Check wallet balance
    const [walletResult] = await connection.query(
      'SELECT balance FROM wallets WHERE user_id = ?',
      [userId]
    );

    if (walletResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const balance = parseFloat(walletResult[0].balance);

    if (balance < totalCost) {
      await connection.rollback();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get or create stock
    let [stockResult] = await connection.query(
      'SELECT id FROM stocks WHERE symbol = ?',
      [symbol]
    );

    let stockId;
    if (stockResult.length === 0) {
      const [insertStock] = await connection.query(
        'INSERT INTO stocks (symbol, name) VALUES (?, ?)',
        [symbol, symbol]
      );
      stockId = insertStock.insertId;
    } else {
      stockId = stockResult[0].id;
    }

    // Deduct from wallet
    await connection.query(
      'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
      [totalCost, userId]
    );

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, stock_id, order_type, quantity, price, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, stockId, 'buy', quantity, price, totalCost, 'completed']
    );

    // Update or create portfolio entry
    const [portfolioCheck] = await connection.query(
      'SELECT * FROM portfolio WHERE user_id = ? AND stock_id = ?',
      [userId, stockId]
    );

    if (portfolioCheck.length > 0) {
      await connection.query(
        `UPDATE portfolio 
         SET quantity = quantity + ?,
             average_price = ((average_price * quantity) + ?) / (quantity + ?)
         WHERE user_id = ? AND stock_id = ?`,
        [quantity, totalCost, quantity, userId, stockId]
      );
    } else {
      await connection.query(
        `INSERT INTO portfolio (user_id, stock_id, quantity, average_price)
         VALUES (?, ?, ?, ?)`,
        [userId, stockId, quantity, price]
      );
    }

    await connection.commit();

    res.json({
      message: 'Buy order placed successfully',
      order: { id: orderResult.insertId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Buy order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

// Place a sell order
router.post('/sell', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
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

    await connection.beginTransaction();

    // Get stock
    const [stockResult] = await connection.query(
      'SELECT id FROM stocks WHERE symbol = ?',
      [symbol]
    );

    if (stockResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stockId = stockResult[0].id;

    // Check portfolio
    const [portfolioResult] = await connection.query(
      'SELECT quantity FROM portfolio WHERE user_id = ? AND stock_id = ?',
      [userId, stockId]
    );

    if (portfolioResult.length === 0 || portfolioResult[0].quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({ error: 'Insufficient stock quantity' });
    }

    // Add to wallet
    await connection.query(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
      [totalAmount, userId]
    );

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, stock_id, order_type, quantity, price, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, stockId, 'sell', quantity, price, totalAmount, 'completed']
    );

    // Update portfolio
    const newQuantity = portfolioResult[0].quantity - quantity;
    
    if (newQuantity > 0) {
      await connection.query(
        'UPDATE portfolio SET quantity = ? WHERE user_id = ? AND stock_id = ?',
        [newQuantity, userId, stockId]
      );
    } else {
      await connection.query(
        'DELETE FROM portfolio WHERE user_id = ? AND stock_id = ?',
        [userId, stockId]
      );
    }

    await connection.commit();

    res.json({
      message: 'Sell order placed successfully',
      order: { id: orderResult.insertId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Sell order error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

module.exports = router;

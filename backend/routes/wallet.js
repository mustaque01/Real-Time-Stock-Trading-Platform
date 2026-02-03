const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get wallet balance
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT * FROM wallets WHERE user_id = ?',
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ wallet: result[0] });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add funds to wallet
router.post('/add-funds', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    await pool.query(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
      [amount, req.user.id]
    );

    const [result] = await pool.query(
      'SELECT * FROM wallets WHERE user_id = ?',
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      message: 'Funds added successfully',
      wallet: result[0]
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT o.*, s.symbol, s.name
       FROM orders o
       LEFT JOIN stocks s ON o.stock_id = s.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ transactions: result });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

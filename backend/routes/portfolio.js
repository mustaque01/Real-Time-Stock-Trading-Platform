const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get user portfolio
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, s.symbol, s.name
       FROM portfolio p
       JOIN stocks s ON p.stock_id = s.id
       WHERE p.user_id = $1 AND p.quantity > 0`,
      [req.user.id]
    );

    res.json({ portfolio: result.rows });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

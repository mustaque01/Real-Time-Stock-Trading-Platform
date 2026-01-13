import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/TradeModal.css';

const TradeModal = ({ stock, tradeType, onClose }) => {
  const { token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('MARKET');
  const [limitPrice, setLimitPrice] = useState(stock.price);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalAmount = orderType === 'MARKET' 
    ? quantity * stock.price 
    : quantity * limitPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const orderData = {
        symbol: stock.symbol,
        type: tradeType,
        orderType,
        quantity,
        price: orderType === 'LIMIT' ? limitPrice : stock.price,
      };

      const response = await axios.post('/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setSuccess(`Order placed successfully! Order ID: ${response.data.orderId}`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{tradeType} {stock.symbol}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="stock-info">
            <div>
              <span className="label">Current Price:</span>
              <span className="value">${stock.price.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Order Type</label>
              <select 
                value={orderType} 
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="MARKET">Market Order</option>
                <option value="LIMIT">Limit Order</option>
              </select>
            </div>

            {orderType === 'LIMIT' && (
              <div className="form-group">
                <label>Limit Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                required
              />
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Total Amount:</span>
                <span className="total-amount">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className={`btn-submit ${tradeType === 'BUY' ? 'buy' : 'sell'}`}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `${tradeType} ${stock.symbol}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
